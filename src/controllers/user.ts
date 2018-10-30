import {Request, Response} from 'express';
import path from 'path';
import * as userModel from '../models/user';
import moment from 'moment';
import * as calendar from '../models/calendar';

const DEADLINE = '30';

export let requireLogin = (req: Request, res: Response, next: any) => {
    if (!req.isAuthenticated()) {
        res.redirect('/edit/login');
    } else {
        next();
    }
}

export const verifyUser = async (username: any, password: any, callback: Function) => {
    try {
        let user = await userModel.findUser(username);
        if (user.length === 0) {
            return callback(null, false);
        }
        if (user[0].password !== password) {
            return callback(null, false);
        }
        return callback(null, user[0]);
    } catch (err) {
        callback(err);
    }
}

export let getMainPage = (req: Request, res: Response) => {
    res.render('personal');
    // res.sendFile(path.join(__dirname, '../public/personal.html'));
}

export let stopSession = (req: Request, res: Response) => {
    req.session.destroy(function (err: Error) {
        if (err) throw err;
        res.redirect('/edit/login');
    })
}

export let getLoginPage = (req: Request, res: Response) => {
    res.render('signIn');
    //res.sendFile(path.join(__dirname, '../public/login/signIn.html'));
}

const makeVisitorObject = (entry: any): any => {
    return {
        name: entry.name,
        email: entry.email,
    }
}

/* if the appointment is in 30 min or less, it is considered to be past*/
const makeAppointment = (entry: any, isPrevDatePast: boolean, momentObject: any) => {
    entry.isTimePast = isPrevDatePast ? true : momentObject.add(DEADLINE, 'm').isSameOrAfter(moment(entry.time, 'hh:mm:ss')),
        entry.occupied = entry.occupied === null ? 0 : entry.occupied
    entry.visitors = [makeVisitorObject(entry)]
    return entry;
}

/* aggregates events by common date and time */
const makeSortedEventList = (results: any, momentObject: any) => {
    let scheduledEvents: any[] = [];
    let prevDate: any;
    let prevTime: any;
    let prevType: any;
    let isPrevDatePast: any;
    results.forEach(function (entry: any) {
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
        let scheduledEvents = await userModel.queryScheduledEvents();
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
        let eventPatterns = await userModel.queryEventPatterns();
        res.json(eventPatterns);
    } catch (err) {
        res.status(500).json(err);
    }
}

export const sendAvailableEvents = async (req: Request, res: Response) => {
    try {
        let availableEvents = await userModel.queryCreatedEvents();
        if (availableEvents.length > 0) {
            availableEvents = availableEvents.map((entry: any) => {
                entry.occupied = null ? 0 : entry.occupied;
                entry.isDatePast = moment().isAfter(entry.date, 'day');
                entry.isTimePast = entry.isDatePast ? true : moment().add(DEADLINE, 'm').isSameOrAfter(moment(entry.time, 'hh:mm:ss'));
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
        let insertionResult = await userModel.insertNewPattern(req.user, req.body);
        if (insertionResult.affectedRows === 0) {
            return res.status(409).end()
        }
        res.end();
    } catch (err) {
        res.status(500).json(err);
    }
}


//new method to update existing pattern details      and p.duration=? and p.description=? and   req.body.duration, req.body.description,
export let updateEventPattern = async (req: Request, res: Response) => {
    try {
        let updateResult = await userModel.updatePattern(req.body);
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
    let apiStatus;
    try {
        patternEvents = await userModel.getPatternEvents(req.params[0])
    } catch (err) {
        apiStatus = err; // TODO maybe include in the response
    }

    try {
        let deletionResult = await userModel.deletePattern(req.params[0]);
        if (deletionResult.affectedRows === 0) {
            return res.status(409).end()
        }
        patternEvents.forEach((event) => {
            calendar.deleteCalendarEvent(event.eventId);
        })
        res.end();
    } catch (err) {
        res.status(500).json(err);
    }
}


export let deleteEvent = async (req: Request, res: Response) => {
    try {
        let deletionResult = await userModel.deleteEvent(req.params[0]);
        if (deletionResult.affectedRows === 0) {
            return res.status(409).end()
        }
        calendar.deleteCalendarEvent(req.params[0])
        res.end();
    } catch (err) {
        res.status(500).json(err);
    }
}

export let deleteEventVisitor = async (req: Request, res: Response) => {
    try {
        let deletionResult = await userModel.deleteEventVisitor(req.body);
        if (deletionResult.affectedRows === 0) {
            return res.status(409).end()
        }
        let visitors = await userModel.updateVisitorsInCalendar(req.body.eventId);
        calendar.updateEvent(req.body.eventId, {
            attendees: visitors.length > 0 ? JSON.parse(JSON.stringify(visitors)) : []
        })
        res.end();
    } catch (err) {
        res.status(500).json(err);
    }
}

// schedules new or updates existing
export let scheduleEvent = async (req: Request, res: Response) => {
    let event: any = req.body[0];
    delete event.reason;
    try {
        let updateResult = await userModel.updateEvent(event);
        if (updateResult.affectedRows > 0) {
            rescheduleInCalendar(event);
            return res.end();
        }
        event.hasCalendarEntry = 0;
        let insertResult = await userModel.scheduleNewEvent(event);
        if (insertResult.affectedRows > 0) {
            event.eventId = insertResult.insertId;
            addEventToCalendar(event)
        }
        res.end();
    } catch (err) {
        res.status(500).json(err);
    }
}

const rescheduleInCalendar = async (event: any) => {
    try {
        let eventDuration = await userModel.getEventDuration(event.patternId);
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
const addEventToCalendar = async (eventData: any) => {
    try {
        let patternProperties = await userModel.getPatternData(eventData.patternId);
        eventData = {...eventData, ...patternProperties[0]}
        calendar.insertToCalendar(eventData);
    } catch (err) {
        console.log(err);
    }
}