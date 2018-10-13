var express = require('express');
exports.router = express.Router();
var parser = require('body-parser');
var userModel = require('../models/user')

var mysql = require('mysql');

var borisDB = {
    host: "localhost",
    user: "root",
    password: "7B0fb6967",
    database: "holandly"
};

var igorDB = {
    host: "localhost",
    user: "root",
    password: "54321",
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
exports.router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});



exports.router.get('/:userName', function (req, res, next) {
    var usr = req.params.userName;
    var patterns = [];
    // con.query('select distinct type, description from eventpattern ' +
    con.query('select * from eventpattern ' +
        'left join users on eventpattern.userId = users.userId ' +
        'left join eventslist on eventpattern.patternId = eventslist.patternId and eventslist.date >= curdate() ' +
        'where users.login = ? group by type, duration, number;',
        usr, function (err, results, fields) {
            if (err) throw err;
            results.forEach(function (entry) {
                if (entry.patternId != null)
                    patterns.push({event: entry.type, patternId: entry.patternId, duration: entry.duration,
                        number: entry.number, description: entry.description});
            });
            res.render('index', {username: usr, patterns: patterns});
        });
});

exports.router.get('/:userName/:patternId', function (req, res, next) {
    var usr = req.params.userName;
    var patternId = req.params.patternId;
    con.query('select userId from users where login = ?', usr, function (err, results, fields) {
        if (err) throw err;
        if (results.length == 0) res.render('index', {description: '', duration: 0, dates: []});
        else {
            var conditions = [patternId, DAYS_FOR_SEARCH];
            con.query('select e.date, p.number, p.description, p.duration, p.type, count(v.visitorId) as amount from eventslist e ' +
                'left join eventpattern p on p.patternId = e.patternId ' +
                'left join eventvisitors v on v.eventId = e.eventId  ' +
                'where p.patternId = ? and e.date >= curdate() and (datediff(e.date, curdate()) <= ?) ' +
                'group by e.eventId order by e.date;',
                conditions, function (err, rslts, fields) {
                    if (err) throw err;
                    var dayCur = new Date();
                    var days = weekAvailable(dayCur, rslts);
                    res.render('timepicker', {userName: usr, eventType: rslts[0].type, description: rslts[0].description,
                        duration: rslts[0].duration, patternId: patternId, days: days});
                });
        }
    });
});

// exports.router.get('/events/:userName/:eventType', function (req, res, next) {
//     var conditions = [req.params.userName, req.params.eventType];
//     con.query('select * from eventslist ' +
//         'left join eventpattern on eventpattern.patternId = eventslist.patternId ' +
//         'join users on eventpattern.userId = users.userId ' +
//         'where users.login = ? and eventpattern.type = ? and eventslist.date >= curdate();',
//         conditions, function (err, results, fields) {
//             if (err) throw err;
//             var events = [];
//             results.forEach(function (entry) {
//                 events.push(entry.date);
//             });
//             res.render('index', {event: results[0].type, description: results[0].description,
//                 duration: results[0].duration, data: events});
//         });
// });

// modelling post-queries as get-queries
exports.router.get('/getWeek/:date/:patternId', function (req, res, next) {
    var conditions = [req.params.patternId, req.params.date, req.params.date, DAYS_FOR_SEARCH];
    con.query('select e.date, e.time, p.number, count(v.visitorId) as amount from eventslist e ' +
        'left join eventpattern p on p.patternId = e.patternId   ' +
        'left join eventvisitors v on v.eventId = e.eventId where e.patternId = ? and e.date >= ? and (datediff(e.date, ?) < ?) ' +
        'group by e.eventId;',
        conditions, function (err, results, fields) {
            if (err) throw err;
            var days = weekAvailable(new Date(req.params.date), results);
            res.json({days: days});
        });
});

exports.router.get('/getTimeLine/:date/:patternId', function (req, res, next) {
    var conditions = [req.params.patternId, req.params.date];
    console.log('hi')
    con.query(`select e.date, e.time, e.eventId, p.number, count(v.visitorId) as amount from eventslist e 
    right join eventpattern p on p.patternId = e.patternId  
    left join eventvisitors v on v.eventId = e.eventId
    where e.patternId = ? and e.date = ? group by e.eventId order by e.time;` ,
        conditions, function (err, results, fields) {
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
            console.log(events)
            res.json({events: events});
        });
});

exports.router.post('/submitVisitor', function (req, res, next) {
    let vname = req.body.name;
    let vemail = req.body.email;
    let eventId = req.body.event;
    console.log(eventId);

    let visitor = [vname, vemail, vname, vemail];
    let vstrId, eventCapacity;

    //  check the possibility of recording on the event
    con.query('select e.date, e.time, p.number, count(v.visitorId) as amount from eventslist e ' +
        'left join eventpattern p on p.patternId = e.patternId ' +
        'left join eventvisitors v on v.eventId = e.eventId where e.eventId = ? ;',
        [eventId], function (err, possibility, fields) {
            if (err) throw err;
            if (possibility.length == 0 || possibility[0].number - possibility[0].amount < 1) {   // recording possibility  = false
                console.log('Sorry...');
                res.json({success: false, name: vname, email: vemail});
            }
            else {                                                                                // recording possibility  = true
                //   input visitor ( + uniqueness check)
                eventCapacity = possibility[0].number;
                con.query('select visitorId from visitors where name = ? and email = ?;',
                    visitor, function (err, visitorid, fields) {
                        if (err) throw err;
                        if (visitorid.length != 0) {
                            vstrId = visitorid[0].visitorId;
                        }
                        else {
                            con.query('insert into visitors (name, email) select * from (select ?, ?) as tmp ' +
                                'where not exists(select * from visitors where name = ? and email = ?) limit 1;',
                                visitor, function (err, results, fields) {
                                    if (err) throw err;
                                    vstrId = results.insertId;
                                });
                        }

                        // check for duplicate entries on an event
                        con.query(`select count(visitorId) as amount from eventvisitors
                        where eventId = ? and visitorId = ?`, [eventId, vstrId], function (err, duplicate, fields) {
                            if (err) throw err;
                            if (duplicate[0].amount == 0) {
                                //  event recording
                                con.query('insert into eventvisitors (eventId, visitorId) values (?, ?);',
                                    [eventId, vstrId], function (err, recording, fields) {
                                        if (err) throw err;
                                        //  collision check
                                        con.query(`select count(visitorId) as amount 
                                            from eventvisitors where eventId = ?`,
                                            [eventId], function (err, completeness, fields) {
                                                if (err) throw err;
                                                if (completeness[0].amount > eventCapacity) {  // too many visitors've recorded to the event
                                                    con.query(`select evId, visitorId from eventvisitors where eventId = ? order by evId desc limit 1 ;`,
                                                        [eventId], function (err, lastVisitor, fields) {
                                                            if (lastVisitor[0].visitorId == vstrId) {   // our visitor is last one who's recorded to the event
                                                                con.query(`delete from eventvisitors where evId = ?`,
                                                                    [lastVisitor[0].evId], function (err, delVisitEv, fields) {
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
                                                    res.json({success: true, name: vname, email: vemail});
                                                }
                                            });
                                    });


                    }
                            else {   //  visitor has already recorded on this event
                                console.log("You've already recorded on this event.");
                                res.json({success: true, name: vname, email: vemail});
                            }
                        });
                    });

            }
            console.log('End of checking.');
        });

});

function weekAvailable (dayCur, rsl) {
    var days = [];
    for (var i = 0; i < DAYS_FOR_SEARCH; i++) {
        days.push({date: dateFormat(dayCur), available: false});
        dayCur.setDate(dayCur.getDate() + 1);
    }
    var currentDay = new Date();
    rsl.forEach(function (entry) {
        if (entry.number - entry.amount > 0) {
            for (var i = 0; i < DAYS_FOR_SEARCH; i++) {
                if ((entry.date < currentDay) || (dateFormat(entry.date) != days[i].date)) continue;
                if (entry.date > currentDay) {
                    days[i].available = true;
                    break;
                }
                currentDay.setMinutes(currentDay.getMinutes() + DEAD_ZONE);
                var timeArray = entry.time.split(':');
                var dateTime = entry.date;
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