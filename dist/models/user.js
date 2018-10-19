"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql_1 = __importDefault(require("mysql"));
const moment_1 = __importDefault(require("moment"));
const calendar = __importStar(require("./calendar"));
exports.dbConnect = mysql_1.default.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '0',
    database: 'holandly'
});
exports.verifyUser = (username, password, done) => {
    exports.dbConnect.query('select * from holandly.users where login=?', [username], function (err, usr, fields) {
        if (err) {
            return done(err);
        }
        if (usr.length === 0) {
            return done(null, false);
        }
        if (usr[0].password !== password) {
            return done(null, false);
        }
        return done(null, usr[0]);
    });
};
/* returns events sorted by data, time and type */
exports.sendScheduledEvents = (req, res) => {
    exports.dbConnect.query(`select visitors.name, visitors.email, eventslist.date, eventslist.time, eventslist.patternId, eventvisitors.eventId, eventpattern.type, eventpattern.number,
                eventpattern.duration, eventpattern.description, visitCount.occupied from holandly.eventvisitors
                inner join visitors on eventvisitors.visitorId = visitors.visitorId
                inner join eventslist on eventvisitors.eventId = eventslist.eventId
                inner join eventpattern on eventslist.patternId = eventpattern.patternId
                left join (select eventId, COUNT(*) AS occupied from eventvisitors group by eventId) AS visitCount on eventslist.eventId = visitCount.eventId
                order by eventslist.date, eventslist.time, eventpattern.type;`, function (err, results, fields) {
        if (err) {
            console.log(err);
            res.json("Data retrieval failed");
        }
        else if (results.length > 0) {
            res.send(JSON.stringify(makeSortedEventList(results)));
        }
        else {
            res.json("No scheduled events");
        }
    });
};
/* aggregates events by common date and time */
const makeSortedEventList = (results) => {
    let scheduledEvents = [];
    let prevDate;
    let prevTime;
    let prevType;
    let isPrevDatePast;
    results.forEach(function (entry) {
        if (+entry.date === +prevDate) {
            delete entry.date;
            if (entry.time === prevTime && entry.type === prevType) {
                scheduledEvents[scheduledEvents.length - 1]
                    .appointments[scheduledEvents[scheduledEvents.length - 1].appointments.length - 1]
                    .visitors.push(makeVisitorObject(entry));
            }
            else {
                prevTime = entry.time;
                prevType = entry.type;
                scheduledEvents[scheduledEvents.length - 1].appointments.push(makeAppointment(entry, isPrevDatePast));
            }
        }
        else {
            let event = {};
            prevDate = event.date = entry.date;
            let mom = moment_1.default();
            event.isDatePast = isPrevDatePast = mom.isAfter(entry.date, 'day');
            prevTime = entry.time;
            prevType = entry.type;
            delete entry.date;
            event.appointments = [makeAppointment(entry, isPrevDatePast)];
            scheduledEvents.push(event);
        }
    });
    return scheduledEvents;
};
/* if the appointment is in 30 min or less, it is considered to be past*/
const makeAppointment = (entry, isPrevDatePast) => {
    let momnt = moment_1.default();
    entry.isTimePast = isPrevDatePast ? true : momnt.add('30', 'm').isSameOrAfter(moment_1.default(entry.time, "hh:mm:ss")),
        entry.occupied = entry.occupied === null ? 0 : entry.occupied;
    entry.visitors = [makeVisitorObject(entry)];
    return entry;
};
const makeVisitorObject = (entry) => {
    return {
        name: entry.name,
        email: entry.email,
    };
};
exports.sendEventPatterns = (req, res) => {
    exports.dbConnect.query(`select * from eventpattern;`, function (err, results, fields) {
        if (err) {
            res.json("Data retrieval failed");
        }
        else if (results.length > 0) {
            res.end(JSON.stringify(results));
        }
        else {
            res.json("No patterns yet");
        }
    });
};
exports.sendAvailableEvents = (req, res) => {
    exports.dbConnect.query(`select eventslist.*, visitCount.occupied, eventpattern.number, eventpattern.type from holandly.eventslist
                      inner join eventpattern on eventslist.patternId = eventpattern.patternId
                      left join (select eventId, COUNT(*) AS occupied from eventvisitors group by eventId) AS visitCount on eventslist.eventId = visitCount.eventId
                      order by date, time;`, function (err, results, fields) {
        if (err) {
            res.json("Data retrieval failed");
        }
        else if (results.length > 0) {
            let mom = moment_1.default();
            results.map((entry) => {
                entry.occupied = null ? 0 : entry.occupied;
                entry.isDatePast = mom.isAfter(entry.date, 'day');
                entry.isTimePast = entry.isDatePast ? true : mom.add('30', 'm').isSameOrAfter(moment_1.default(entry.time, "hh:mm:ss")),
                    entry.number = entry.number;
            });
            res.end(JSON.stringify(results));
        }
        else {
            res.json("No events to show");
        }
    });
};
exports.addNewEventPattern = (req, res) => {
    let user = req.user.userId;
    let type = req.body.type;
    let pattern = [type, req.body.number, req.body.duration, req.body.description, user, type, user];
    exports.dbConnect.query(`insert into eventpattern (type, number, duration, description, userId)
                      select ?, ?, ?, ?, ?
                      where not exists (select * from eventpattern where
                      (type=? and userId = ?));`, pattern, function (err, results, fields) {
        if (err) {
            res.json("Error ocurred");
        }
        else if (results.affectedRows > 0) {
            res.json("Successful");
        }
        else {
            res.json('The operation is failed');
        }
    });
};
//new method to update existing pattern details      and p.duration=? and p.description=? and   req.body.duration, req.body.description,
exports.updateEventPattern = (req, res) => {
    let patternId = req.body.patternId;
    delete req.body.patternId;
    exports.dbConnect.query(`update eventpattern set ?
                    where patternId=? and not exists (select * from
                    (select * from holandly.eventpattern p where (p.type=? and p.userId=? and patternId!=?)) as tmp)`, [req.body, patternId, req.body.type, req.user.userId, patternId], function (err, results, fields) {
        if (err) {
            res.json("Error ocurred");
        }
        else if (results.affectedRows > 0) {
            res.json("Successful");
        }
        else {
            res.json('The operation is failed');
        }
    });
};
exports.deleteEventPattern = (req, res) => {
    let patternId = req.params[0];
    exports.dbConnect.query(`delete from eventpattern where eventpattern.patternId = ?`, patternId, function (err, results, fields) {
        if (err) {
            res.json("Error ocurred");
        }
        else if (results.affectedRows > 0) {
            deleteCalendarPatternEvents();
            res.json("Successful");
        }
        else {
            res.json('The operation is failed');
        }
    });
};
const deleteCalendarPatternEvents = () => {
};
exports.deleteEvent = (req, res) => {
    let eventId = req.params[0];
    exports.dbConnect.query(`delete from eventslist where eventslist.eventId = ?`, eventId, function (err, results, fields) {
        if (err) {
            res.json("Data retrieval failed");
        }
        else if (results.affectedRows > 0) {
            calendar.deleteCalendarEvent(req.params[0]);
            res.json("Successful");
        }
        else {
            res.json('The operation is failed');
        }
    });
};
exports.deleteEventVisitor = (req, res) => {
    exports.dbConnect.query(`delete from eventvisitors where eventId = ? and visitorId = 
    (select visitors.visitorId from visitors where email=?)`, [req.body.eventId, req.body.email], function (err, results, fields) {
        if (err) {
            res.json("Data retrieval failed");
        }
        else if (results.affectedRows > 0) {
            deleteVisitorInCalendar(req.body.eventId);
            res.json("Successful");
        }
        else {
            res.json('The operation is failed');
        }
    });
};
const deleteVisitorInCalendar = (eventId) => {
    exports.dbConnect.query(`select visitors.visitorId as id, visitors.email, visitors.name as displayName from eventvisitors
                      inner join visitors on visitors.visitorId = eventvisitors.visitorId
                      where eventId=?`, [eventId], function (err, results, fields) {
        if (err) {
            console.log('Failed to fetch Google Calendar data');
        }
        else if (results.length > 0) {
            calendar.updateEvent(eventId, {
                'attendees': JSON.parse(JSON.stringify(results))
            });
        }
        else {
            calendar.updateEvent(eventId, {
                'attendees': []
            });
        }
    });
};
// schedules new or updates existing
exports.scheduleEvent = (req, res) => {
    let event = req.body[0];
    delete event.reason; //the reason is saved on front end in the form
    exports.dbConnect.query(`UPDATE eventslist SET ? WHERE eventId=?`, [event, event.eventId], function (err, results, fields) {
        if (err) {
            console.log(err);
            res.json("Error");
        }
        else if (results.affectedRows > 0) {
            rescheduleInCalendar(event);
            res.json('The event rescheduled');
        }
        else {
            event.hasCalendarEntry = 0;
            scheduleNewEvent(req, res, event);
        }
    });
};
const scheduleNewEvent = (req, res, event) => {
    exports.dbConnect.query(`INSERT INTO eventslist
      SELECT ?, ?, ?, ?, ? FROM eventslist
      WHERE eventId = ? or patternId = ? and time = ? and date = ?
      HAVING COUNT(*) = 0`, [event.eventId, event.date, event.time, event.patternId, event.hasCalendarEntry, event.eventId, event.patternId, event.time, event.date], function (err, results, fields) {
        if (err) {
            console.log(err);
            res.json("Error");
        }
        else if (results.affectedRows > 0) {
            event.eventId = results.insertId;
            addEventToCalendar(event);
            res.json("The event scheduled");
        }
    });
};
const rescheduleInCalendar = (newEventData) => {
    let dateTime = moment_1.default(newEventData.date + " " + newEventData.time).format();
    exports.dbConnect.query(`select duration from eventpattern where patternId=?`, [newEventData.patternId], (err, results) => {
        if (err) {
            console.log('Failed to fetch Google Calendar data');
        }
        else if (results.length == 0) {
            console.log('No pattern');
        }
        else {
            // creates resources object for Calendar API
            calendar.updateEvent(newEventData.eventId, {
                'start': {
                    'dateTime': dateTime,
                },
                'end': {
                    'dateTime': moment_1.default(dateTime).add(results.duration, 'minutes'),
                }
            });
        }
    });
};
// google calendar api insert event call
const addEventToCalendar = (eventData) => {
    exports.dbConnect.query(`select description, duration, type from eventpattern where patternId=?`, [eventData.patternId], (err, results) => {
        if (err) {
            console.log('Failed to fetch Google Calendar data');
        }
        else if (results.length == 0) {
            console.log('No pattern');
        }
        else {
            eventData = Object.assign({}, eventData, results[0]);
            calendar.insertToCalendar(eventData);
        }
    });
};
//# sourceMappingURL=user.js.map