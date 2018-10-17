"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const { google } = require('googleapis');
const privatekey = __importStar(require("../holandlykey.json"));
const moment_1 = __importDefault(require("moment"));
const calendId = 'greenzelenetskyi@gmail.com';
// configure a JWT auth client
let jwtClient = new google.auth.JWT(privatekey.client_email, null, privatekey.private_key, ['https://www.googleapis.com/auth/calendar']);
//authenticate request
jwtClient.authorize(function (err, tokens) {
    if (err) {
        console.log(err);
        return;
    }
    else {
        console.log("Successfully connected!");
    }
});
//Google Calendar API
let calendar = google.calendar('v3');
exports.insertToCalendar = (newEvent) => {
    let dateTime = moment_1.default(newEvent.date + " " + newEvent.time).format();
    let id = "0000" + newEvent.eventId;
    calendar.events.insert({
        auth: jwtClient,
        calendarId: calendId,
        resource: {
            'id': id,
            'summary': newEvent.type,
            'description': newEvent.description,
            'start': {
                'dateTime': dateTime,
            },
            'end': {
                'dateTime': moment_1.default(dateTime).add(newEvent.duration, 'minutes'),
            }
        }
    }, (err, response) => {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        else {
            console.log('Event created: %s', response.data.htmlLink);
        }
    });
};
exports.deleteCalendarEvent = (eventData) => {
    let id = "0000" + eventData;
    calendar.events.delete({
        auth: jwtClient,
        calendarId: calendId,
        eventId: id
    }, (err, response) => {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        else {
            console.log('Event deleted');
        }
    });
};
// // adds or deletes visitor, providing new visitor list
// export const changeVisitorList = (eventData: any) => {
//   calendar.events.patch({
//     auth: jwtClient,
//     calendarId: calendId,
//     resource: {
//         'attendees': []
//     }
//   }), (err: Error, response: any) => {
//         if (err) {
//             console.log('The API returned an error: ' + err);
//             return;
//         } else {
//             console.log('Event created: %s', response.data.htmlLink);
//         }
//     }
// }
exports.updateEvent = (eventId, resourceFields) => {
    let id = "0000" + eventId;
    calendar.events.patch({
        auth: jwtClient,
        calendarId: calendId,
        eventId: id,
        resource: resourceFields
    }, (err, response) => {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        else {
            console.log('Event updated');
        }
    });
};
//# sourceMappingURL=calendar.js.map