import { Request, Response } from 'express';
import path from 'path';
import * as userModel from '../models/user';
import moment from 'moment';
import * as calendar from '../models/calendar';
import * as mailer from '../models/mailer';
import pug from 'pug';
import { MysqlError } from 'mysql';

const DEADLINE = '30'; //mins till start

const useCancelTemplate = pug.compileFile(path.join(__dirname, '../../views/emails/cancellation.pug'));
const useConfirmTemplate = pug.compileFile(path.join(__dirname, '../../views/emails/confirmation.pug'));

export let requireLogin = (req: Request, res: Response, next: Function) => {
  if (!req.isAuthenticated()) {
    res.redirect('/edit/login');
  } else {
    next();
  }
}

export let getMainPage = (req: Request, res: Response) => {
  res.render('personal');
}

export let stopSession = (req: Request, res: Response) => {
  req.session.destroy((err: Error) => {
    if (err)
      throw err;
    res.redirect('/edit/login');
  });
}

export let getLoginPage = (req: Request, res: Response) => {
  res.render('signIn');
}

const makeVisitorObject = (entry: any): any => {
  return {
    name: entry.name,
    email: entry.email,
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
    console.log(err);
    res.status(500).json(err);
  }
}


export const sendEventPatterns = async (req: Request, res: Response) => {
  try {
    let eventPatterns = await userModel.queryEventPatterns(req.user.userId, req.app.get('dbPool'));
    res.json(eventPatterns);
  } catch (err) {
    res.status(500).json(err);
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
    res.status(500).json(err);
  }
}

export let addNewEventPattern = async (req: Request, res: Response) => {
  try {
    let insertionResult = await userModel.insertNewPattern(req.user.userId, req.body
      , req.app.get('dbPool'));
    if (insertionResult.affectedRows === 0) {
      return res.status(409).end();
    }
    res.end();
  } catch (err) {
    res.status(500).json(err);
  }
}


//new method to update existing pattern details      and p.duration=? and p.description=? and   req.body.duration, req.body.description,
export let updateEventPattern = async (req: Request, res: Response) => {
  try {
    let updateResult = await userModel.updatePattern(req.body, req.app.get('dbPool'));
    if (updateResult.affectedRows === 0) {
      return res.status(409).end()
    }
    res.end();
  } catch (err) {
    res.status(500).json(err);
  }
}

export const deleteEventPattern = async (req: Request, res: Response) => { // delete all the active events
  let patternEvents: any[];
  let apiErr;
  try {
    patternEvents = await userModel.getPatternEvents(req.params[0], req.app.get('dbPool'));
  } catch (err) {
    apiErr = err;// TODO maybe include in the response
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
    }), req.user.login, req.body.reason, 'Oтмена участия: ', useCancelTemplate);
    if (!apiErr) {
      patternEvents.forEach((event) => {
        calendar.deleteCalendarEvent(event.eventId);
      })
    }
    res.end();
  } catch (err) {
    res.status(500).json(err);
  }
}

export let deleteEvent = async (req: Request, res: Response) => {
  try {
    let notificationData = await userModel.getEventNotificationData(req.params[0], req.app.get('dbPool'));
    let deletionResult = await userModel.deleteEvent(req.params[0], req.app.get('dbPool'));
    if (deletionResult.affectedRows === 0) {
      return res.status(409).end()
    }
    if (moment().isBefore(notificationData[0].date, 'day')) {
      mailer.notify(notificationData, req.user.login, req.body.reason
        , 'Отмена участия: ', useCancelTemplate);
    }
    calendar.deleteCalendarEvent(req.params[0])
    res.end();
  } catch (err) {
    res.status(500).json(err);
  }
}

export let deleteEventVisitor = async (req: Request, res: Response) => {
  try {
    let deletionResult = await userModel.deleteEventVisitor(req.body, req.app.get('dbPool'));
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
    res.status(500).json(err);
  }
}

const getDbCon = (pool: any) => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err: MysqlError, con: any) => {
      if(err) {
        return reject(err);
      }
      resolve(con);
    })
  })
}

// schedules new or updates existing
export let scheduleEvent = async (req: Request, res: Response) => {
  let dbPool = req.app.get('dbPool');
  let events: any = req.body;
  try {
    let db: any = await getDbCon(dbPool);
    for (let event of events) {
      if (event.eventId == 0) {
        delete event.reason;
        let insertResult = await userModel.scheduleNewEvent(event, db);
        if (insertResult.affectedRows > 0) {
          event.eventId = insertResult.insertId;
          addEventToCalendar(event, db);
        }
      } else {
        let reason = event.reason;
        delete event.reason;
        let updateResult = await userModel.updateEvent(event, db);
        if (updateResult.affectedRows > 0) {
          let notificationData = await userModel.getEventNotificationData(event.eventId, db);
          mailer.notify(notificationData, req.user.login, reason, 'Изменение в ', useConfirmTemplate);
          rescheduleInCalendar(event, db);
        }
      }
    }
    db.release();
    res.end();
  } catch (err) {
    console.log(err.message)
    res.status(500).json(err);
  }
}

const scheduleNewEvent = async (req: Request, res: Response) => {
  try {
    let insertResult = await userModel.scheduleNewEvent(req.body, req.app.get('dbPool'));
    if (insertResult.affectedRows > 0) {
      //event.eventId = insertResult.insertId;
      addEventToCalendar(event, req); // TODO pass errors somewhere
    }
  } catch (err) {

  }
}

const rescheduleInCalendar = async (event: any, db: any) => {
  try {
    let eventDuration = await userModel.getEventDuration(event.patternId, db);
    if (eventDuration.length !== 0) {
      let dateTime = moment(event.date + ' ' + event.time).format();
      //creates resources object for Calendar API
      calendar.updateEvent(event.eventId, {
        'start': {
          'dateTime': dateTime,
        },
        'end': {  // TODO get duration from the front-end if convenient
          'dateTime': moment(dateTime).add(eventDuration.duration, 'minutes'),
        }
      })
    }
  } catch (err) {
    console.log(err);
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