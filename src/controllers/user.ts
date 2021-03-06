import { Request, Response } from 'express';
import path from 'path';
import * as userModel from '../models/user';
import moment from 'moment';
import * as calendar from '../models/calendar';
import * as mailer from '../models/mailer';
import pug from 'pug';
import { MysqlError, Connection, Pool, PoolConnection } from 'mysql';
import * as api from '../models/api';
import jwt from 'jsonwebtoken';

const DEADLINE = '30'; //mins till start

const useCancelTemplate = pug.compileFile(path.join(__dirname, '../../views/emails/cancellation.pug'));
const useConfirmTemplate = pug.compileFile(path.join(__dirname, '../../views/emails/confirmation.pug'));
const useRescheduleTemplate = pug.compileFile(path.join(__dirname, '../../views/emails/reschedule.pug'));

export const requireLogin = (req: Request, res: Response, next: Function) => {
  if (req.path == '/login') {
    next();
  } else if (!req.isAuthenticated()) {
    res.redirect('/edit/login');
  } else {
    next();
  }
}

export const getUserApiData = async (req: Request, res: Response) => {
  try {
    let apiData = await userModel.retreiveApiData(req.user.userId, req.app.get('dbPool'));
    if(apiData.length > 0) {
      res.json(JSON.parse(JSON.stringify(apiData[0])));
    } else {
      res.status(400).json();
    }
  } catch (err) {
    console.log(err)
    res.status(500).json();
  }
}

export const updateUserEndpoints = async (req: Request, res: Response) => {
  try {
    await userModel.addApiEndpoints(req.body, req.user.userId, req.app.get('dbPool'));
    res.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export const generateNewApiToken = async (req: Request, res: Response) => {
  try {
    console.log(req.user.endpoints);
    if (!req.user.endpoints) {
      return res.status(400).json({ error: 'No endpoints specified' });
    }
    let token = jwt.sign({ user: req.user.login }, process.env.API_SECRET, { algorithm: process.env.API_ALGORITHM });
    await userModel.saveTokenToDb(token, req.user.userId, req.app.get('dbPool'));
    res.json({ apikey: token, endpoints: req.user.endpoints });
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err.message });
  }
}

export const getMainPage = (req: Request, res: Response) => {
  try {
    res.render('users/personal', { login: req.user.login });
  } catch (err) {
    console.log('hi');
  }
}

export const stopSession = (req: Request, res: Response) => {
  req.session.destroy((err: Error) => {
    if (err)
      throw err;
    res.redirect('/edit/login');
  });
}

export const getLoginPage = (req: Request, res: Response) => {
  try {
    res.render('users/signIn');
  } catch (err) {
    console.log('hi');
  }
}

const makeVisitorObject = (entry: any): any => {
  return {
    name: entry.name,
    email: entry.email,
    visitorId: entry.visitorId
  }
}

/* if the appointment is in 30 min or less, it is considered to be past*/
const makeAppointment = (entry: any, isPrevDatePast: boolean, momentObject: moment.Moment) => {
  entry.isTimePast = isPrevDatePast ? true : momentObject.add(DEADLINE, 'm')
    .isSameOrAfter(moment(entry.time, 'hh:mm:ss')),
    entry.occupied = entry.occupied === null ? 0 : entry.occupied
  entry.visitors = [makeVisitorObject(entry)]
  return entry;
}

/* aggregates events by common date and time */
const makeSortedEventList = (results: any, momentObject: any) => {
  let scheduledEvents: any[] = [];
  let prevDate: string;
  let prevTime: string;
  let prevType: string;
  let isPrevDatePast: any;
  results.forEach((entry: any) => {
    if (+entry.date === +prevDate) {
      delete entry.date;
      if (entry.time === prevTime && entry.type === prevType) {
        scheduledEvents[scheduledEvents.length - 1]
          .appointments[scheduledEvents[scheduledEvents.length - 1].appointments.length - 1]
          .visitors.push(makeVisitorObject(entry));
      } else {
        prevTime = entry.time;
        prevType = entry.type;
        scheduledEvents[scheduledEvents.length - 1].appointments.push(makeAppointment(entry, isPrevDatePast, momentObject))
      }
    } else {
      let event: any = {};
      prevDate = event.date = entry.date;
      event.isDatePast = isPrevDatePast = momentObject.isAfter(entry.date, 'day');
      prevTime = entry.time;
      prevType = entry.type;
      delete entry.date;
      event.appointments = [makeAppointment(entry, isPrevDatePast, momentObject)];
      scheduledEvents.push(event);
    }
  })
  return scheduledEvents;
}


export const sendScheduledEvents = async (req: Request, res: Response) => {
  try {
    let scheduledEvents = await userModel.queryScheduledEvents(req.user.userId, req.app.get('dbPool'));
    if (scheduledEvents.length > 0) {
      scheduledEvents = makeSortedEventList(scheduledEvents, moment());
    }
    res.json(scheduledEvents)
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


export const sendEventPatterns = async (req: Request, res: Response) => {
  try {
    let eventPatterns = await userModel.queryEventPatterns(req.user.userId, req.app.get('dbPool'));
    res.json(eventPatterns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export const sendAvailableEvents = async (req: Request, res: Response) => {
  try {
    let availableEvents = await userModel.queryCreatedEvents(req.user.userId, req.app.get('dbPool'));
    if (availableEvents.length > 0) {
      let now = moment();
      availableEvents = availableEvents.map((entry: any) => {
        entry.occupied = null ? 0 : entry.occupied;
        entry.isDatePast = now.isAfter(entry.date, 'day');
        entry.isTimePast = entry.isDatePast ? true : now.add(DEADLINE, 'm')
          .isSameOrAfter(moment(entry.time, 'hh:mm:ss'));
        return entry;
      });
      res.json(availableEvents);
    }
    res.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export const addNewEventPattern = async (req: Request, res: Response) => {
  try {
    let insertionResult = await userModel.insertNewPattern(req.user.userId, req.body
      , req.app.get('dbPool'));
    if (insertionResult.affectedRows === 0) {
      return res.status(409).end();
    }
    if (req.body.hasApiHook) { //for testing, should not be here
      api.sendHookData({
        event: 'signin',
        pattern: 'random',
        date: 'today',
        time: 'now',
        visitorName: 'vasyl',
        visitorEmail: 'vasyl@com.com'
      });
    }
    res.end();
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err.message });
  }
}


//new method to update existing pattern details
export let updateEventPattern = async (req: Request, res: Response) => {
  try {
    let updateResult = await userModel.updatePattern(req.body, req.app.get('dbPool'));
    if (updateResult.affectedRows === 0) {
      return res.status(409).end()
    }
    res.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export const deleteEventPattern = async (req: Request, res: Response) => { // delete all the active events
  let patternEvents: any[];
  let apiErr;
  try {
    patternEvents = await userModel.getPatternEvents(req.params[0], req.app.get('dbPool'));
  } catch (err) {
    apiErr = err;
  }
  try {
    let notificationData = await userModel.getPatternEventsNotificationData(req.params[0], req.app.get('dbPool'));
    let deletionResult = await userModel.deletePattern(req.params[0], req.app.get('dbPool'));
    if (deletionResult.affectedRows === 0) {
      return res.status(409).json();
    }
    let now = moment();
    mailer.notify(notificationData.filter((event: any) => {
      return now.isBefore(event.date, 'day')
    }), req.user.login, req.body.Reason, 'Oтмена участия: ', useCancelTemplate);
    if (!apiErr) {
      patternEvents.forEach((event) => {
        calendar.deleteCalendarEvent(event.eventId);
      });
    }
    res.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    let notificationData = await userModel.getEventNotificationData(req.params[0], req.app.get('dbPool'));
    let deletionResult = await userModel.deleteEvent(req.params[0], req.app.get('dbPool'));
    if (deletionResult.affectedRows === 0) {
      return res.status(409).end()
    }
    if (notificationData.length > 0 && moment().isBefore(notificationData[0].date, 'day')) {
      mailer.notify(notificationData, req.user.login, req.body.reason
        , 'Отмена участия: ', useCancelTemplate);
    }
    calendar.deleteCalendarEvent(req.params[0])
    res.end();
  } catch (err) {
    console.log(err)
    res.status(500).json(err);
  }
}

export const deleteEventVisitor = async (req: Request, res: Response) => {
  try {
    let args;
    if (req.body) {
      args = req.body;
    } else {
      args = { eventId: req.params.eventId, visitorId: req.params.visitorId };
    }

    let deletionResult = await userModel.deleteEventVisitor(args, req.app.get('dbPool'));
    if (deletionResult.affectedRows === 0) {
      return res.status(409).end();
    }
    let notificationData = await userModel.getVisitorNotificationData(req.body, req.app.get('dbPool'));
    mailer.notify(notificationData, req.user.login, req.body.reason, 'Отмена участия:', useCancelTemplate);
    let visitors = await userModel.updateVisitorsInCalendar(req.body.eventId, req.app.get('dbPool'));
    calendar.updateEvent(req.body.eventId, {
      attendees: visitors.length > 0 ? JSON.parse(JSON.stringify(visitors)) : []
    })
    res.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

const getDbCon = (pool: Pool) => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err: MysqlError, con: PoolConnection) => {
      if (err) {
        return reject(err);
      }
      resolve(con);
    })
  })
}

interface EventObject {
  eventId: number,
  reason: string,
  date: Date,
  time: string,
  timeOld?: string,
  dateOld?: string
}

// schedules new or updates existing
export const scheduleEvent = async (req: Request, res: Response) => {
  let dbPool: Pool = req.app.get('dbPool');
  let events: EventObject[] = req.body;
  try {
    let db: any = await getDbCon(dbPool);
    for (let event of events) {
      if (event.eventId == 0) {
        await addNewEvent(event, db);
      } else {
        await rescheduleExistingEvent(event, db, req.user.login);
      }
    }
    db.release();
    res.end();
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ error: err.message });
  }
}

const addNewEvent = async (event: EventObject, db: Connection) => {
  delete event.reason;
  let insertResult = await userModel.scheduleNewEvent(event, db);
  if (insertResult.affectedRows > 0) {
    event.eventId = insertResult.insertId;
    addEventToCalendar(event, db);
  }
}

const rescheduleExistingEvent = async (event: any, db: Connection, login: string) => {
  let { reason, duration, timeOld, dateOld, ...eventData } = event;
  let prevDate = moment(dateOld).format('DD.MM.YYYY') + ' в ' + timeOld;
  let updateResult = await userModel.updateEvent(eventData, db);
  if (updateResult.affectedRows > 0) {
    let notificationData = await userModel.getEventNotificationData(eventData.eventId, db);
    rescheduleInCalendar(eventData, duration);
    if (notificationData.length > 0) {
      notificationData[0].before = prevDate;
      mailer.notify(notificationData, login, reason, 'Изменение в ', useRescheduleTemplate);
    }
  }
}

const rescheduleInCalendar = async (event: any, duration: number) => {
  try {
    let dateTime = moment(event.date + ' ' + event.time).format();
    //creates resources object for Calendar API
    calendar.updateEvent(event.eventId, {
      'start': {
        'dateTime': dateTime,
      },
      'end': {
        'dateTime': moment(dateTime).add(duration, 'minutes'),
      }
    });
  } catch (err) {
    console.log({ error: err.message });
  }
}

// google calendar api insert event call
const addEventToCalendar = async (eventData: any, db: any) => {
  try {
    let patternProperties = await userModel.getPatternData(eventData.patternId, db);
    eventData = { ...eventData, ...patternProperties[0] }
    calendar.insertToCalendar(eventData);
  } catch (err) {
    console.log(err.message);
  }
}

export const getEventData = async (req: Request, res: Response) => {
  try {
    let data = await userModel.getEventData(req.params.eventId, req.app.get('dbPool'));
    if (data.length > 0) {
      res.json(data[0]);
    } else {
      res.status(400).json();
    }
  } catch (err) {
    console.log(err);
  }
}