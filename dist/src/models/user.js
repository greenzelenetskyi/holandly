"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql_1 = __importDefault(require("mysql"));
exports.dbPool = mysql_1.default.createPool({
    connectionLimit: 100,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});
const makeSqlQuery = (sqlString, params) => {
    return new Promise((resolve, reject) => {
        exports.dbPool.query(sqlString, params, (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
};
exports.getUserName = (userId) => {
    let sqlString = `select userId from holandly.users where userId=?`;
    return makeSqlQuery(sqlString, userId);
};
exports.findUser = (username) => {
    let sqlString = `select * from holandly.users where login=?`;
    return makeSqlQuery(sqlString, username);
};
exports.queryScheduledEvents = () => {
    let sqlString = `
      select visitors.name, visitors.email, 
             eventslist.date, eventslist.time, eventslist.patternId, 
             eventvisitors.eventId, 
             eventpattern.type, eventpattern.number,
             eventpattern.duration, eventpattern.description, 
             visitCount.occupied 
     from holandly.eventvisitors
     inner join visitors on eventvisitors.visitorId = visitors.visitorId
     inner join eventslist on eventvisitors.eventId = eventslist.eventId
     inner join eventpattern on eventslist.patternId = eventpattern.patternId
     left join (select eventId, COUNT(*) AS occupied from eventvisitors 
        group by eventId) AS visitCount on eventslist.eventId = visitCount.eventId
     order by eventslist.date, eventslist.time, eventpattern.type;`;
    return makeSqlQuery(sqlString);
};
exports.queryEventPatterns = () => {
    let sqlString = `select * from eventpattern;`;
    return makeSqlQuery(sqlString);
};
exports.queryCreatedEvents = () => {
    let sqlString = `select eventslist.*, visitCount.occupied, eventpattern.number, eventpattern.type from holandly.eventslist
                    inner join eventpattern on eventslist.patternId = eventpattern.patternId
                    left join (select eventId, COUNT(*) AS occupied from eventvisitors group by eventId) AS visitCount on eventslist.eventId = visitCount.eventId
                  order by date, time;`;
    return makeSqlQuery(sqlString);
};
exports.insertNewPattern = (userId, pattern) => {
    let sqlString = `insert into eventpattern (type, number, duration, description, userId)
                      select ?, ?, ?, ?, ?
                  where not exists (select * from eventpattern where (type=? and userId = ?));`;
    let queryParams = [pattern.type, pattern.number, pattern.duration, pattern.description, userId, pattern.type, userId];
    return makeSqlQuery(sqlString, queryParams);
};
//new method to update existing pattern details      and p.duration=? and p.description=? and   req.body.duration, req.body.description,
exports.updatePattern = (attributes) => {
    let patternId = attributes.patternId;
    delete attributes.patternId;
    let sqlString = `update eventpattern set ? where patternId=? and not exists
                     (select * from (select * from holandly.eventpattern p
                  where (p.type=? and p.userId=? and patternId!=?)) as tmp)`;
    let queryParams = [attributes, patternId, attributes.type, attributes.userId, patternId];
    return makeSqlQuery(sqlString, queryParams);
};
exports.getPatternEvents = (patternId) => {
    let sqlString = `select eventId from eventslist where patternId = ?`;
    return makeSqlQuery(sqlString, patternId);
};
exports.deletePattern = (patternId) => {
    let sqlString = `delete from eventpattern where eventpattern.patternId = ?`;
    return makeSqlQuery(sqlString, patternId);
};
exports.deleteEvent = (eventId) => {
    let sqlString = `delete from eventslist where eventId = ?`;
    return makeSqlQuery(sqlString, eventId);
};
exports.deleteEventVisitor = (event) => {
    let sqlString = `delete from eventvisitors where eventId = ?
                  and visitorId = (select visitors.visitorId from visitors where email=?);`;
    let queryParams = [event.eventId, event.email];
    return makeSqlQuery(sqlString, queryParams);
};
exports.updateVisitorsInCalendar = (eventId) => {
    let sqlString = `select visitors.visitorId as id, visitors.email, visitors.name as displayName from eventvisitors
                   inner join visitors on visitors.visitorId = eventvisitors.visitorId
                   where eventId=?`;
    return makeSqlQuery(sqlString, eventId);
};
// schedules new or updates existing
exports.updateEvent = (event) => {
    let sqlString = `UPDATE eventslist SET ? WHERE eventId=?`;
    return makeSqlQuery(sqlString, [event, event.eventId]);
};
exports.scheduleNewEvent = (event) => {
    let sqlString = `INSERT INTO eventslist
                   SELECT ?, ?, ?, ?, ? FROM eventslist
                   WHERE eventId = ? or patternId = ? and time = ? and date = ?
                   HAVING COUNT(*) = 0`;
    let queryParams = [event.eventId, event.date, event.time, event.patternId, event.hasCalendarEntry,
        event.eventId, event.patternId, event.time, event.date];
    return makeSqlQuery(sqlString, queryParams);
};
exports.getEventDuration = (patternId) => {
    let sqlString = `select duration from eventpattern where patternId=?`;
    return makeSqlQuery(sqlString, patternId);
};
// google calendar api insert event call
exports.getPatternData = (patternId) => {
    let sqlString = `select description, duration, type from eventpattern where patternId=?`;
    return makeSqlQuery(sqlString, patternId);
};
//# sourceMappingURL=user.js.map