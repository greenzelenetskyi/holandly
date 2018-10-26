"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
const path_1 = __importDefault(require("path"));
const userModel = __importStar(require("../models/user"));
const moment_1 = __importDefault(require("moment"));
const calendar = __importStar(require("../models/calendar"));
const DEADLINE = '30';
exports.requireLogin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        res.redirect('/edit/login');
    }
    else {
        next();
    }
};
exports.verifyUser = (username, password, callback) => __awaiter(this, void 0, void 0, function* () {
    try {
        let user = yield userModel.findUser(username);
        if (user.length === 0) {
            return callback(null, false);
        }
        if (user[0].password !== password) {
            return callback(null, false);
        }
        return callback(null, user[0]);
    }
    catch (err) {
        callback(err);
    }
});
exports.getMainPage = (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../public/personal.html'));
};
exports.stopSession = (req, res) => {
    req.session.destroy(function (err) {
        if (err)
            throw err;
        res.redirect('/edit/login');
    });
};
exports.getLoginPage = (req, res) => {
    res.render('signIn');
    //res.sendFile(path.join(__dirname, '../public/login/signIn.html'));
};
const makeVisitorObject = (entry) => {
    return {
        name: entry.name,
        email: entry.email,
    };
};
/* if the appointment is in 30 min or less, it is considered to be past*/
const makeAppointment = (entry, isPrevDatePast, momentObject) => {
    entry.isTimePast = isPrevDatePast ? true : momentObject.add(DEADLINE, 'm').isSameOrAfter(moment_1.default(entry.time, 'hh:mm:ss')),
        entry.occupied = entry.occupied === null ? 0 : entry.occupied;
    entry.visitors = [makeVisitorObject(entry)];
    return entry;
};
/* aggregates events by common date and time */
const makeSortedEventList = (results, momentObject) => {
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
                scheduledEvents[scheduledEvents.length - 1].appointments.push(makeAppointment(entry, isPrevDatePast, momentObject));
            }
        }
        else {
            let event = {};
            prevDate = event.date = entry.date;
            event.isDatePast = isPrevDatePast = momentObject.isAfter(entry.date, 'day');
            prevTime = entry.time;
            prevType = entry.type;
            delete entry.date;
            event.appointments = [makeAppointment(entry, isPrevDatePast, momentObject)];
            scheduledEvents.push(event);
        }
    });
    return scheduledEvents;
};
exports.sendScheduledEvents = (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        let scheduledEvents = yield userModel.queryScheduledEvents();
        if (scheduledEvents.length > 0) {
            scheduledEvents = makeSortedEventList(scheduledEvents, moment_1.default());
        }
        res.json(scheduledEvents);
    }
    catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});
exports.sendEventPatterns = (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        let eventPatterns = yield userModel.queryEventPatterns();
        res.json(eventPatterns);
    }
    catch (err) {
        res.status(500).json(err);
    }
});
exports.sendAvailableEvents = (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        let availableEvents = yield userModel.queryCreatedEvents();
        if (availableEvents.length > 0) {
            availableEvents = availableEvents.map((entry) => {
                entry.occupied = null ? 0 : entry.occupied;
                entry.isDatePast = moment_1.default().isAfter(entry.date, 'day');
                entry.isTimePast = entry.isDatePast ? true : moment_1.default().add(DEADLINE, 'm').isSameOrAfter(moment_1.default(entry.time, 'hh:mm:ss'));
                return entry;
            });
            res.json(availableEvents);
        }
        res.end();
    }
    catch (err) {
        res.status(500).json(err);
    }
});
exports.addNewEventPattern = (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        let insertionResult = yield userModel.insertNewPattern(req.user, req.body);
        if (insertionResult.affectedRows === 0) {
            return res.status(409).end();
        }
        res.end();
    }
    catch (err) {
        res.status(500).json(err);
    }
});
//new method to update existing pattern details      and p.duration=? and p.description=? and   req.body.duration, req.body.description,
exports.updateEventPattern = (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        let updateResult = yield userModel.updatePattern(req.body);
        if (updateResult.affectedRows === 0) {
            return res.status(409).end();
        }
        res.end();
    }
    catch (err) {
        res.status(500).json(err);
    }
});
exports.deleteEventPattern = (req, res) => __awaiter(this, void 0, void 0, function* () {
    let patternEvents;
    let apiStatus;
    try {
        patternEvents = yield userModel.getPatternEvents(req.params[0]);
    }
    catch (err) {
        apiStatus = err; // TODO maybe include in the response
    }
    try {
        let deletionResult = yield userModel.deletePattern(req.params[0]);
        if (deletionResult.affectedRows === 0) {
            return res.status(409).end();
        }
        patternEvents.forEach((event) => {
            calendar.deleteCalendarEvent(event.eventId);
        });
        res.end();
    }
    catch (err) {
        res.status(500).json(err);
    }
});
exports.deleteEvent = (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        let deletionResult = yield userModel.deleteEvent(req.params[0]);
        if (deletionResult.affectedRows === 0) {
            return res.status(409).end();
        }
        calendar.deleteCalendarEvent(req.params[0]);
        res.end();
    }
    catch (err) {
        res.status(500).json(err);
    }
});
exports.deleteEventVisitor = (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        let deletionResult = yield userModel.deleteEventVisitor(req.body);
        if (deletionResult.affectedRows === 0) {
            return res.status(409).end();
        }
        let visitors = yield userModel.updateVisitorsInCalendar(req.body.eventId);
        calendar.updateEvent(req.body.eventId, {
            attendees: visitors.length > 0 ? JSON.parse(JSON.stringify(visitors)) : []
        });
        res.end();
    }
    catch (err) {
        res.status(500).json(err);
    }
});
// schedules new or updates existing
exports.scheduleEvent = (req, res) => __awaiter(this, void 0, void 0, function* () {
    let event = req.body[0];
    delete event.reason;
    try {
        let updateResult = yield userModel.updateEvent(event);
        if (updateResult.affectedRows > 0) {
            rescheduleInCalendar(event);
            return res.end();
        }
        event.hasCalendarEntry = 0;
        let insertResult = yield userModel.scheduleNewEvent(event);
        if (insertResult.affectedRows > 0) {
            event.eventId = insertResult.insertId;
            addEventToCalendar(event);
        }
        res.end();
    }
    catch (err) {
        res.status(500).json(err);
    }
});
const rescheduleInCalendar = (event) => __awaiter(this, void 0, void 0, function* () {
    try {
        let eventDuration = yield userModel.getEventDuration(event.patternId);
        if (eventDuration.length !== 0) {
            let dateTime = moment_1.default(event.date + ' ' + event.time).format();
            //creates resources object for Calendar API
            calendar.updateEvent(event.eventId, {
                'start': {
                    'dateTime': dateTime,
                },
                'end': {
                    'dateTime': moment_1.default(dateTime).add(eventDuration.duration, 'minutes'),
                }
            });
        }
    }
    catch (err) {
        console.log(err);
    }
});
// google calendar api insert event call
const addEventToCalendar = (eventData) => __awaiter(this, void 0, void 0, function* () {
    try {
        let patternProperties = yield userModel.getPatternData(eventData.patternId);
        eventData = Object.assign({}, eventData, patternProperties[0]);
        calendar.insertToCalendar(eventData);
    }
    catch (err) {
        console.log(err);
    }
});
//# sourceMappingURL=user.js.map