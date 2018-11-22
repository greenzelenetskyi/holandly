import { Request, Response } from 'express';

//  *******************  Used types  **********************************************
type rezEvents =
    {
    type: string, patternId?: number, duration: number, description: string, number: number,
    eventId?: number, date: Date, time: string, amount: number };

type rezEventMin = {
    number: number, date: Date, time: string, eventId?: number, amount: number };

type eventsForTimeLine = {
    date: Date, time: string, eventId: number, remain: number, availability: boolean };

type eventForSubmit = {
    date: Date, time: string, number: number, multiaccess: number, patternId: number, amount: number };

type eventReschedule = {
    date: Date, time: string, eventId: number, type: string, description: string,
    userId: number, multiaccess: number, duration: number, login: string };

type eventsList = {
    eventId: number, date: Date, time: string, isRecord: boolean};

type arrOfArray = [number, number];

type dateAvailable = {
    date: string, available: boolean }

type usedPatterns = {
    event: string, patternId: number, duration: number,
    number: number, description: string };
//  *******************  End of used types  ****************************************


// const userModel = require('../models/user');
const express = require('express');
// const mailer = require('../models/mailer');
exports.router = express.Router();

const mysql = require('mysql');

const con = mysql.createPool({
    connectionLimit: 100,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

// sampling period for the time line, days
const DAYS_FOR_SEARCH = 7;

// time before the current date event on which recording is impossible, min
const DEAD_ZONE = 120;

/* GET home page. */
exports.router.get('/', function (req: Request, res: Response): void {
    res.render('index', {title: 'Express'});
});

exports.router.get('/:userName', function (req: Request, res: Response): void {
    let usr = req.params.userName;
    let patterns: Array<usedPatterns> = [];
    //  collects information about possible events of user patterns
    con.query(`select p.type,
                      p.patternId,
                      p.duration,
                      p.description,
                      p.number,
                      e.eventId,
                      e.date,
                      e.time,
                      count(v.visitorId) as amount
               from eventpattern p
                      left join eventslist e on p.patternId = e.patternId and e.date >= curdate()
                      left join eventvisitors v on v.eventId = e.eventId
               where p.patternId in (select distinct p.patternId
                                     from eventpattern p
                                            left join users u on p.userId = u.userId
                                            left join eventslist e on p.patternId = e.patternId and e.date >= curdate()
                                     where u.login = ?)
               group by e.eventId;`,
        [usr], function (err: Error, results: Array<rezEvents>): void {
            if (err) throw err;
            // let timeArray: Array<string> = [];
            let dateTime: Date;
            let noPatterns: boolean;
            let currentDay: Date = new Date();
            currentDay.setMinutes(currentDay.getMinutes() + DEAD_ZONE);  //  the beginning of the possible recording time
            results.forEach(function (entry: rezEvents): void {
                if (entry.patternId != null && entry.eventId != null) {  //   is there a subject of record ?
                    dateTime = entry.date;
                    if (dateTime < currentDay) {  //  need to check the current date event's time
                        // timeArray = entry.time.split(':');
                        // dateTime.setHours(+timeArray[0], +timeArray[1], +timeArray[2]);
                        exactEventTime(dateTime, entry.time);
                    }
                    if (dateTime > currentDay && entry.number > entry.amount) {  // event's pattern must be considered
                        noPatterns = true;
                        for (let i = 0; i < patterns.length; i++) {  // check for duplicate pattern entry
                            if (patterns[i].patternId == entry.patternId) {
                                noPatterns = false;
                                break;
                            }
                        }
                        if (noPatterns)   //  present the pattern to the visitor
                            patterns.push({event: entry.type, patternId: entry.patternId, duration: entry.duration,
                                number: entry.number, description: entry.description});
                    }
                }
            });
            res.render('index', {username: usr, patterns: patterns});
        });
});

// events of the selected pattern
exports.router.get('/:userName/:patternId', function (req: Request, res: Response): void {
    let usr = req.params.userName;
    let patternId = req.params.patternId;
    con.query(`select userId
               from users
               where login = ?`, usr, function (err: Error, results: Array<number>) {
        if (err) throw err;
        if (results.length == 0) res.render('index', {description: '', duration: 0, dates: []});
        else {
            let conditions = [patternId, DAYS_FOR_SEARCH];
            con.query(`select e.date, e.time, p.number, p.description, p.duration, p.type, count(v.visitorId) as amount
                       from eventslist e
                              left join eventpattern p on p.patternId = e.patternId
                              left join eventvisitors v on v.eventId = e.eventId
                       where p.patternId = ?
                         and e.date >= curdate()
                       group by e.eventId
                       order by e.date;`,
                conditions, function (err: Error, rslts: Array<rezEvents>): void {
                    if (err) throw err;
                    let dayCur = new Date();
                    let days = weekAvailable(dayCur, rslts);
                    console.log(rslts);
                    res.render('timepicker', {username: usr, eventType: rslts[0].type, description: rslts[0].description,
                        duration: rslts[0].duration, patternId: patternId, days: days});
                });
        }
    });
});

// pattern events for the specified week
exports.router.get('/getWeek/:date/:patternId', function (req: Request, res: Response) {
    let conditions = [req.params.patternId, req.params.date, req.params.date, DAYS_FOR_SEARCH];
    con.query(`select e.date, e.time, p.number, count(v.visitorId) as amount
               from eventslist e
                      left join eventpattern p on p.patternId = e.patternId
                      left join eventvisitors v on v.eventId = e.eventId
               where e.patternId = ?
                 and e.date >= ?
                 and (datediff(e.date, ?) < ?)
               group by e.eventId;`,
        conditions, function (err: Error, results: Array<rezEventMin>): void {
            if (err) throw err;
            let days = weekAvailable(new Date(req.params.date), results);
            res.json({days: days});
        });
});

exports.router.get('/getTimeLine/:date/:patternId', function (req: Request, res: Response) {
    let conditions = [req.params.patternId, req.params.date];
    con.query(`select e.date, e.time, e.eventId, p.number, count(v.visitorId) as amount
               from eventslist e
                      right join eventpattern p on p.patternId = e.patternId
                      left join eventvisitors v on v.eventId = e.eventId
               where e.patternId = ?
                 and e.date = ?
               group by e.eventId
               order by e.time;` ,
        conditions, function (err: Error, results: Array<rezEventMin>): void {
            if (err) throw err;
            // console.log(results);
            let events: Array<eventsForTimeLine> = [];
            let timeArray: Array<string> = [];
            let dateTime: Date;
            let deadZoneBoundary = new Date();
            deadZoneBoundary.setMinutes(deadZoneBoundary.getMinutes() + DEAD_ZONE);
            results.forEach(function (entry): void {
                timeArray = entry.time.split(':');
                dateTime = entry.date;
                dateTime.setHours(+timeArray[0], +timeArray[1], +timeArray[2]);
                events.push({date: entry.date, time: entry.time, eventId: entry.eventId, remain: (entry.number - entry.amount),
                    availability: (deadZoneBoundary < dateTime) && (entry.number - entry.amount > 0)});
            });
            // console.log(events);
            res.json({events: events});
        });
});

exports.router.post('/submitVisitor', function (req: Request, res: Response) {
    let vname = req.body.name;
    let vemail = req.body.email;
    let eventId = req.body.event;

    let visitor: Array<string> = [vemail, vname, vemail];
    let vstrId: number, eventCapacity: number, eventPattern: number, access: number;

    //  checking the possibility of recording on the event
    con.query(`select e.date, e.time, p.number, p.multiaccess, p.patternId, count(v.visitorId) as amount
               from eventslist e
                      left join eventpattern p on p.patternId = e.patternId
                      left join eventvisitors v on v.eventId = e.eventId
               where e.eventId = ?;`,
        [eventId], function (err: Error, possibility: Array<eventForSubmit>) {
            if (err) throw err;
            if (possibility.length == 0 || possibility[0].number - possibility[0].amount < 1) {   // recording possibility  = false
                // console.log('Sorry...');
                res.json({success: 1, name: vname, email: vemail});
            }
            else {                                                                                // recording possibility  = true
                //   input visitor ( + uniqueness check)
                eventCapacity = possibility[0].number;
                eventPattern = possibility[0].patternId;
                access = possibility[0].multiaccess;
                con.query(`select visitorId from visitors where email = ?;`,
                    visitor, function (err: Error, visitorid: Array<{visitorId: number}>): void {
                        if (err) throw err;
                        if (visitorid.length != 0) {
                            vstrId = visitorid[0].visitorId;
                        }
                        else {
                            con.query(`insert into visitors (email, name)
                                       select *
                                       from (select ?, ?) as tmp
                                       where not exists(select * from visitors where email = ?)
                                       limit 1;`,
                                visitor, function (err: Error, results: {insertId: number}): void {
                                    if (err) throw err;
                                    vstrId = results.insertId;
                                });
                        }

                        // checking for duplicate entries on an event
                        con.query(`select count(visitorId) as amount
                                   from eventvisitors
                                   where eventId = ?
                                     and visitorId = ?;`,
                            [eventId, vstrId], function (err: Error, duplicate: Array<{amount: number}>): void {
                            if (err) throw err;
                            if (duplicate[0].amount == 0) {

                                // checking for pattern restrictions
                                if (access > 0) {  /* there are restrictions on the number of pattern events
                                                    that a visitor can be recorded */
                                    let currentDay = new Date();
                                    currentDay.setHours(0, 0, 0, 0);
                                    con.query(`select count(v.evId) as alreadyRecords
                                               from eventvisitors v
                                               where v.visitorId = ?
                                                 and v.eventId in (select e.eventId
                                                                   from eventslist e
                                                                   where e.patternId = ?
                                                                     and e.date >= ?);`,
                                        [vstrId, eventPattern, currentDay], function (err: Error, isRecords: Array<{alreadyRecords: number}>): void {
                                            if (err) throw err;
                                            if (isRecords[0].alreadyRecords < access) {  /* it's still possible to record
                                                to the pattern events */
                                                eventRecording(eventId, vstrId, eventCapacity);
                                                res.json({success: 0, name: vname, email: vemail});
                                            }
                                            else {  /* it's impossible to be written to the pattern events,
                                                because the visitor has already been recorded to other pattern events */
                                                res.json({success: 3, name: vname, email: vemail, eventId: eventId});
                                            }
                                        });
                                }
                                else {  /* there are no restrictions on the number of pattern events
                                        that a visitor can be recorded */
                                    eventRecording(eventId, vstrId, eventCapacity);
                                    res.json({success: 0, name: vname, email: vemail});
                                }
                            }
                            else {   //  visitor has already recorded on this event earlier
                                // console.log("You've already recorded on this event.");
                                res.json({success: 2, name: vname, email: vemail});
                            }
                        });
                    });
            }
        });
});

// information about the pattern events to which the visitor is subscribed
exports.router.get('/reschedule/:patternId/:eventId/:email', function (req: Request, res: Response): void {
    let currentDay = new Date();
    currentDay.setHours(0, 0, 0, 0);
    let newEvent = req.params.eventId;
    let vEmail = req.params.email;
    let conditions = [newEvent, req.params.patternId, vEmail, currentDay];
    con.query(`select e.date,
                      e.time,
                      e.eventId,
                      p.type,
                      p.description,
                      p.userId,
                      p.multiaccess,
                      p.duration,
                      u.login
               from eventslist e
                      left join eventpattern p on p.patternId = e.patternId
                      left join users u on u.userId = p.userId
               where e.eventId = ?
                  or (p.patternId = ? and e.eventId in (select e.eventId
                                                        from eventslist e
                                                               left join eventvisitors v on v.eventId = e.eventId
                                                               left join visitors s on s.visitorId = v.visitorId
                                                        where s.email = ?
                                                          and e.date >= ?));`,
        conditions, function (err: Error, vstrEvents: Array<eventReschedule>): void {
        if (err) throw err;
        let events: Array<eventsList> = [];
        // let timeArray: Array<string> = [];
        let dateTime: Date;
        currentDay = new Date();
        vstrEvents.forEach(function (evnt): void {
            if (evnt.date <= currentDay) {  //  current date event
                // timeArray = evnt.time.split(':');
                dateTime = evnt.date;
                // dateTime.setHours(+timeArray[0], +timeArray[1], +timeArray[2]);
                exactEventTime(dateTime, evnt.time);
                if (dateTime < currentDay) return; //  the event has passed
            }
            events.push({eventId: evnt.eventId, date: evnt.date, time: evnt.time, isRecord: evnt.eventId != newEvent});
        });
        res.render('rescheduler', {username: vstrEvents[0].login, type: vstrEvents[0].type, description: vstrEvents[0].description,
            access: vstrEvents[0].multiaccess, duration: vstrEvents[0].duration, email: vEmail, events: events});
    });
});

// clarification of pattern events for which the visitor is subscribed
// json-object is received: {email: email, events: [{eventId: eventId, isRecord: isRecord}]}
exports.router.post('/rerecording', function (req: Request, res: Response): void {
    let vemail = req.body.email;
    let events = req.body.events;
    let vvisitorId: number;
    let eventsTrue: Array<number> = [], eventsFalse: Array<number> = [];

    events.forEach(function (evnt: {eventId: number, isRecord: boolean}): void {
        if (evnt.isRecord) eventsTrue.push(evnt.eventId);
        else eventsFalse.push(evnt.eventId);
    });
    let conditionsTrue = [vemail, eventsTrue];
    con.query(`select visitorId
               from visitors
               where email = ?;`, [vemail],
        function (err: Error, recVisitor: Array<{visitorId: number}>): void {
        if (err) throw err;
        if (recVisitor.length == 0) console.log('No visitor!');
        else {
            vvisitorId = recVisitor[0].visitorId;
            con.query(
                `select eventId
                 from eventvisitors
                 where visitorId = ?;`,
                [vvisitorId], function (err: Error, eventRecords: Array<{eventId: number}>): void {
                    if (err) throw err;
                    eventRecords.forEach(function (evnt) {
                        for (let i = 0; i < eventsTrue.length; i++) {
                            if (evnt.eventId === eventsTrue[i]) {
                                eventsTrue.splice(i, 1);
                                break;
                            }
                        }
                    });
                    if (eventsTrue.length > 0) {
                        let recordEvents: Array<arrOfArray> = [];
                        for (let i = 0; i < eventsTrue.length; i++)
                            recordEvents.push([eventsTrue[i], vvisitorId]);
                        con.query(`insert into eventvisitors (eventId, visitorId)
                                   values ?;`,
                            [recordEvents], function (err: Error, recEvents: number): void {
                                if (err) {
                                    res.json({success: 1});
                                    throw err;
                                }
                            });
                    }
                    if (eventsFalse.length > 0) {
                        // let deleteEvents: Array<arrOfArray>;
                        // for (let i = 0; i < eventsFalse.length; i++)
                        //     deleteEvents.push([eventsFalse[i], vvisitorId]);
                        con.query(`delete
                                   from eventvisitors
                                   where visitorId = ?
                                     and eventId in (?);`,
                            [vvisitorId, eventsFalse], function (err: Error, delEvents: number): void {
                                if (err) {
                                    res.json({success: 2});
                                    throw err;
                                }
                            });
                    }
                    res.json({success: 0});
                });
        }
    });
});

function eventRecording(eventId: number, vstrId: number, eventCapacity: number): void {
    //  event recording
    con.query(`insert into eventvisitors (eventId, visitorId) values (?, ?);`,
        [eventId, vstrId], function (err: Error, recording: number) {
            if (err) throw err;
            //  collision check
            con.query(`select count(visitorId) as amount from eventvisitors where eventId = ?;`,
                [eventId], function (err: Error, completeness: Array<{amount: number}>): void {
                    if (err) throw err;
                    if (completeness[0].amount > eventCapacity) {  // too many visitors've recorded to the event
                        con.query(`select evId, visitorId from eventvisitors where eventId = ? order by evId desc limit 1 ;`,
                            [eventId], function (err: Error, lastVisitor: Array<{evId: number, visitorId: number}>): void {
                                if (lastVisitor[0].visitorId == vstrId) {   // our visitor is last one who's recorded to the event
                                    con.query(`delete from eventvisitors where evId = ?`,
                                        [lastVisitor[0].evId], function (err: Error, delVisitEv: {affectedRows: number}): void {
                                            if (err) throw err;
                                            if (delVisitEv.affectedRows == 1) {
                                                console.log('Removed excess');
                                            }
                                        })
                                }
                            })
                    }
                    else {
                        console.log('Success!');
                    }
                });
        });
}

function weekAvailable (dayCur: Date, rsl: Array<rezEvents | rezEventMin>): Array<dateAvailable> {
    let days: Array<dateAvailable> = [];
    for (let i = 0; i < DAYS_FOR_SEARCH; i++) {
        days.push({date: dateFormat(dayCur), available: false});
        dayCur.setDate(dayCur.getDate() + 1);
    }
    let currentDay = new Date();
    // let timeArray: Array<string> = [];
    let dateTime: Date;
    rsl.forEach(function (entry) {
        currentDay.setHours(0, 0, 0, 0);
        if (entry.number - entry.amount > 0) {
            for (let i = 0; i < DAYS_FOR_SEARCH; i++) {
                if ((entry.date < currentDay) || (dateFormat(entry.date) != days[i].date)) continue;
                if (entry.date > currentDay) {
                    days[i].available = true;
                    break;
                }
                currentDay = new Date();
                currentDay.setMinutes(currentDay.getMinutes() + DEAD_ZONE);
                // timeArray = entry.time.split(':');
                dateTime = entry.date;
                // dateTime.setHours(+timeArray[0], +timeArray[1], +timeArray[2]);
                exactEventTime(dateTime, entry.time);
                if (dateTime > currentDay) {
                    days[i].available = true;
                    break;
                }
            }
        }
    });
    return days;
}

function dateFormat(dt: Date): string {
    let dd = dt.getDate() < 10 ? '0' + dt.getDate() : dt.getDate();
    let mm = dt.getMonth() + 1;
    let month: string = mm < 10 ? '0' + mm : '' + mm;
    return month + '/' + dd + '/' + dt.getFullYear();
}

function exactEventTime (dateEvent: Date, timeEvent: string): void {
    let timeArray: Array<string> = timeEvent.split(':');
    dateEvent.setHours(+timeArray[0], +timeArray[1], +timeArray[2]);
}