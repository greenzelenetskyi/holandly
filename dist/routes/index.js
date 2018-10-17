//import * as userModel from "../models/user";

var express = require('express');
exports.router = express.Router();
// var parser = require('body-parser');
 var userModel = require('../models/user')

var mysql = require('mysql');

var borisDB = {
    host: "localhost",
    user: "root",
    password: "0",
    database: "holandly"
};

var igorDB = {
    host: "localhost",
    user: "root",
    password: "0",
    database: "shppcalendly"
};

// var con = mysql.createConnection(igorDB);
//var con = mysql.createConnection(borisDB);
var con = userModel.dbConnect;

con.connect(function(err) {
    if (err) throw err;
    console.log("DB connected!");
});

// sampling period for the time line, days
var DAYS_FOR_SEARCH = 7;

// time before the current date event on which recording is impossible, min
var DEAD_ZONE = 120;

/* GET home page. */
exports.router.get('/', function (req, res) {
    res.render('index', {title: 'Express'});
});


exports.router.get('/:userName', function (req, res) {
    var usr = req.params.userName;
    var patterns = [];
    //  collects information about possible events of user patterns
    con.query('select p.type, p.patternId, p.duration, p.description, p.number, e.eventId, e.date, e.time, count(v.visitorId) as amount ' +
        'from eventpattern p  ' +
        'left join eventslist e on p.patternId = e.patternId and e.date >= curdate() ' +
        'left join eventvisitors v on v.eventId = e.eventId ' +
        'where p.patternId in ' +
        '(select distinct p.patternId from eventpattern p ' +
        'left join users u on p.userId = u.userId ' +
        'left join eventslist e on p.patternId = e.patternId and e.date >= curdate() ' +
        'where u.login = ? ) group by e.eventId;',
        [usr], function (err, results) {
            if (err) throw err;
            var timeArray, dateTime, noPatterns;
            var currentDay = new Date();
            currentDay.setMinutes(currentDay.getMinutes() + DEAD_ZONE);  //  the beginning of the possible recording time
            results.forEach(function (entry) {
                if (entry.patternId != null && entry.eventId != null) {  //   is there a subject of record ?
                    dateTime = entry.date;
                    if (dateTime < currentDay) {  //  need to check the current date event's time
                        timeArray = entry.time.split(':');
                        dateTime.setHours(timeArray[0], timeArray[1], timeArray[2]);
                    }
                    if (dateTime > currentDay && entry.number > entry.amount) {  // event's pattern must be considered
                        noPatterns = true;
                        for (var i = 0; i < patterns.length; i++) {  // check for duplicate pattern entry
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
exports.router.get('/:userName/:patternId', function (req, res) {
    var usr = req.params.userName;
    var patternId = req.params.patternId;
    con.query('select userId from users where login = ?', usr, function (err, results) {
        if (err) throw err;
        if (results.length == 0) res.render('index', {description: '', duration: 0, dates: []});
        else {
            var conditions = [patternId, DAYS_FOR_SEARCH];
            con.query('select e.date, e.time, p.number, p.description, p.duration, p.type, count(v.visitorId) as amount from eventslist e ' +
                'left join eventpattern p on p.patternId = e.patternId ' +
                'left join eventvisitors v on v.eventId = e.eventId  ' +
                'where p.patternId = ? and e.date >= curdate()' +
                'group by e.eventId order by e.date;',
                conditions, function (err, rslts) {
                    if (err) throw err;
                    var dayCur = new Date();
                    var days = weekAvailable(dayCur, rslts);
                    res.render('timepicker', {username: usr, eventType: rslts[0].type, description: rslts[0].description,
                        duration: rslts[0].duration, patternId: patternId, days: days});
                });
        }
    });
});

// pattern events for the specified week
exports.router.get('/getWeek/:date/:patternId', function (req, res) {
    var conditions = [req.params.patternId, req.params.date, req.params.date, DAYS_FOR_SEARCH];
    con.query('select e.date, e.time, p.number, count(v.visitorId) as amount from eventslist e ' +
        'left join eventpattern p on p.patternId = e.patternId   ' +
        'left join eventvisitors v on v.eventId = e.eventId where e.patternId = ? and e.date >= ? and (datediff(e.date, ?) < ?) ' +
        'group by e.eventId;',
        conditions, function (err, results) {
            if (err) throw err;
            var days = weekAvailable(new Date(req.params.date), results);
            res.json({days: days});
        });
});

exports.router.get('/getTimeLine/:date/:patternId', function (req, res) {
    var conditions = [req.params.patternId, req.params.date];
    // console.log('hi');
    con.query('select e.date, e.time, e.eventId, p.number, count(v.visitorId) as amount from eventslist e ' +
        'right join eventpattern p on p.patternId = e.patternId ' +
        'left join eventvisitors v on v.eventId = e.eventId ' +
        'where e.patternId = ? and e.date = ? group by e.eventId order by e.time;' ,
        conditions, function (err, results) {
            if (err) throw err;
            console.log(results);
            var events = [];
            var dateTime, timeArray;
            var deadZoneBoundary = new Date();
            deadZoneBoundary.setMinutes(deadZoneBoundary.getMinutes() + DEAD_ZONE);
            results.forEach(function (entry) {
                timeArray = entry.time.split(':');
                dateTime = entry.date;
                dateTime.setHours(timeArray[0], timeArray[1], timeArray[2]);
                events.push({date: entry.date, time: entry.time, eventId: entry.eventId, remain: (entry.number - entry.amount),
                    availability: (deadZoneBoundary < dateTime) && (entry.number - entry.amount > 0)});
            });
            console.log(events);
            res.json({events: events});
        });
});

exports.router.post('/submitVisitor', function (req, res) {
    var vname = req.body.name;
    var vemail = req.body.email;
    var eventId = req.body.event;
    // console.log(eventId);

    var visitor = [vname, vemail, vname, vemail];
    var vstrId, eventCapacity, eventPattern, access;

    //  checking the possibility of recording on the event
    con.query('select e.date, e.time, p.number, p.multiaccess, p.patternId, count(v.visitorId) as amount from eventslist e ' +
        'left join eventpattern p on p.patternId = e.patternId ' +
        'left join eventvisitors v on v.eventId = e.eventId where e.eventId = ? ;',
        [eventId], function (err, possibility) {
            if (err) throw err;
            if (possibility.length == 0 || possibility[0].number - possibility[0].amount < 1) {   // recording possibility  = false
                console.log('Sorry...');
                res.json({success: 1, name: vname, email: vemail});
            }
            else {                                                                                // recording possibility  = true
                //   input visitor ( + uniqueness check)
                eventCapacity = possibility[0].number;
                eventPattern = possibility[0].patternId;
                access = possibility[0].multiaccess;
                con.query('select visitorId from visitors where name = ? and email = ?;',
                    visitor, function (err, visitorid) {
                        if (err) throw err;
                        if (visitorid.length != 0) {
                            vstrId = visitorid[0].visitorId;
                        }
                        else {
                            con.query('insert into visitors (name, email) select * from (select ?, ?) as tmp ' +
                                'where not exists(select * from visitors where name = ? and email = ?) limit 1;',
                                visitor, function (err, results) {
                                    if (err) throw err;
                                    vstrId = results.insertId;
                                });
                        }

                        // checking for duplicate entries on an event
                        con.query('select count(visitorId) as amount from eventvisitors ' +
                        'where eventId = ? and visitorId = ?;', [eventId, vstrId], function (err, duplicate) {
                            if (err) throw err;
                            if (duplicate[0].amount == 0) {

                                // checking for pattern restrictions
                                if (access > 0) {  /* there are restrictions on the number of pattern events
                                                    that a visitor can be recorded */
                                    var currentDay = new Date();
                                    currentDay.setHours(0, 0, 0, 0);
                                    con.query('select count(v.evId) as alreadyRecords from eventvisitors v ' +
                                        'where v.visitorId = ? and v.eventId in ' +
                                        '(select e.eventId from eventslist e where e.patternId = ? and e.date >= ?);',
                                        [vstrId, eventPattern, currentDay], function (err, isRecords) {
                                        if (err) throw err;
                                        if (isRecords[0].alreadyRecords < access) {  /* it's still possible to record
                                                to the pattern events */
                                            eventRecording(eventId, vstrId, eventCapacity);
                                            res.json({success: 0, name: vname, email: vemail});
                                        }
                                        else {  /* it's impossible to be written to the pattern events,
                                                because the visitor has already been recorded to other pattern events */
                                            res.json({success: 3, name: vname, email: vemail});
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
                                console.log("You've already recorded on this event.");
                                res.json({success: 2, name: vname, email: vemail});
                            }
                        });
                    });
            }
        });
});

// information about the pattern events to which the visitor is subscribed
exports.router.get('/reschedule/:patternId/:name/:email', function (req, res) {
    var currentDay = new Date();
    currentDay.setHours(0, 0, 0, 0);
    var conditions = [req.params.patternId, req.params.name, req.params.email, currentDay];
    con.query('select e.date, e.time, e.eventId, p.type, p.description, p.userId, u.login from eventslist e ' +
        'left join eventpattern p on p.patternId = e.patternId ' +
        'left join users u on u.userId = p.userId ' +
        'where p.patternId = ? and e.eventId in ' +
        '(select e.eventId from eventslist e left join eventvisitors v on v.eventId = e.eventId ' +
        'left join visitors s on s.visitorId = v.visitorId ' +
        'where s.name = ? and s.email = ? and e.date >= ?);', conditions, function (err, vstrEvents) {
        if (err) throw err;
        var events = [], timeArray, dateTime;
        currentDay = new Date();
        vstrEvents.forEach(function (evnt) {
            if (evnt.date <= currentDay) {  //  current date event
                timeArray = evnt.time.split(':');
                dateTime = evnt.date;
                dateTime.setHours(timeArray[0], timeArray[1], timeArray[2]);
                if (dateTime < currentDay) return; //  the event has passed
            }
            events.push({eventId: evnt.eventId, date: evnt.date, time: evnt.time, isRecord: true});
        });
        res.json({user: vstrEvents[0].login, type: vstrEvents[0].type, description: vstrEvents[0].description,
            events: events});
    });
});

function eventRecording(eventId, vstrId, eventCapacity) {
    //  event recording
    con.query('insert into eventvisitors (eventId, visitorId) values (?, ?);',
        [eventId, vstrId], function (err, recording) {
            if (err) throw err;
            //  collision check
            con.query('select count(visitorId) as amount from eventvisitors where eventId = ?;',
                [eventId], function (err, completeness) {
                    if (err) throw err;
                    if (completeness[0].amount > eventCapacity) {  // too many visitors've recorded to the event
                        con.query('select evId, visitorId from eventvisitors where eventId = ? order by evId desc limit 1 ;',
                            [eventId], function (err, lastVisitor) {
                                if (lastVisitor[0].visitorId == vstrId) {   // our visitor is last one who's recorded to the event
                                    con.query('delete from eventvisitors where evId = ?',
                                        [lastVisitor[0].evId], function (err, delVisitEv) {
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

function weekAvailable (dayCur, rsl) {
    var days = [];
    for (var i = 0; i < DAYS_FOR_SEARCH; i++) {
        days.push({date: dateFormat(dayCur), available: false});
        dayCur.setDate(dayCur.getDate() + 1);
    }
    var currentDay = new Date();
    var timeArray, dateTime;
    rsl.forEach(function (entry) {
        currentDay.setHours(0, 0, 0, 0);
        if (entry.number - entry.amount > 0) {
            for (var i = 0; i < DAYS_FOR_SEARCH; i++) {
                if ((entry.date < currentDay) || (dateFormat(entry.date) != days[i].date)) continue;
                if (entry.date > currentDay) {
                    days[i].available = true;
                    break;
                }
                currentDay = new Date();
                currentDay.setMinutes(currentDay.getMinutes() + DEAD_ZONE);
                timeArray = entry.time.split(':');
                dateTime = entry.date;
                dateTime.setHours(timeArray[0], timeArray[1], timeArray[2]);
                if (dateTime > currentDay) {
                    days[i].available = true;
                    break;
                }
            }
        }
    });
    return days;
}

function dateFormat(dt) {
    var dd = dt.getDate() < 10 ? '0'+dt.getDate() : dt.getDate();
    var mm = dt.getMonth() + 1;
    mm = mm < 10 ? '0'+mm : mm;
    return mm + '/' + dd + '/' + dt.getFullYear();
}