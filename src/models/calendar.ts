const {google} = require('googleapis');
import * as privatekey from '../holandlykey.json';
import moment from 'moment';

const calendId = 'greenzelenetskyi@gmail.com'

// configure a JWT auth client
let jwtClient = new google.auth.JWT(
    (<any>privatekey).client_email,
    null,
    (<any>privatekey).private_key,
    ['https://www.googleapis.com/auth/calendar']);
//authenticate request
jwtClient.authorize(function (err: any, tokens: any) {
    if (err) {
        console.log(err);
        return;
    } else {
        console.log("Successfully connected!");
    }
});

//Google Calendar API
let calendar = google.calendar('v3');

export const insertToCalendar = (newEvent: any) => {
    let dateTime = moment(newEvent.date + " " + newEvent.time).format();
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
              'dateTime': moment(dateTime).add(newEvent.duration, 'minutes'),
            }
          }
    }, (err: Error, response: any) => {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        } else {
            console.log('Event created: %s', response.data.htmlLink);
        }
    })
}

export const deleteCalendarEvent = (eventData: any) => {
    let id = "0000" + eventData;
    calendar.events.delete({
        auth: jwtClient,
        calendarId: calendId,
        eventId: id
    }), (err: Error, response: any) => {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        } else {
            console.log('Event created: %s', response.data.htmlLink);
        }
    }
}

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

export const updateEvent = (eventId: any, resourceFields: any) => {
    let id = "0000" + eventId
    calendar.events.patch({
        auth: jwtClient,
        calendarId: calendId,
        eventId: id,
        resource: resourceFields
    }), (err: Error, response: any) => {
          if (err) {
              console.log('The API returned an error: ' + err);
              return;
          } else {
              console.log('Event created: %s', response.data.htmlLink);
          }
      }
}