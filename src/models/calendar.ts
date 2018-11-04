const { google } = require('googleapis');
import moment from 'moment';

const calendId = process.env.CALENDAR_ID;

// configure a JWT auth client
let jwtClient = new google.auth.JWT(
    process.env.API_EMAIL,
    null,
    process.env.API_KEY.replace(/\\n/g, '\n'),
    [process.env.API_PATH]);
//authenticate request
jwtClient.authorize(function (err: any, tokens: any) {
    if (err) {
        console.log(err);
        return;
    } else {
        console.log('Successfully connected!');
    }
});

//Google Calendar API
let calendar = google.calendar('v3');

export const insertToCalendar = (newEvent: any) => {
    let dateTime = moment(newEvent.date + ' ' + newEvent.time).format();
    let id = '0000' + newEvent.eventId;
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
            calendar.events.get({
                auth: jwtClient,
                calendarId: calendId,
                eventId: id
            }, (err: Error, response: any) => {
                if (err) {
                    console.log('The API returned an error: ' + err);
                    return;
                } else {
                    console.log(response);
                }
            })
            //console.log('The API returned an error: ' + err);
           // return;
        } else {
            console.log('Event created: %s', response.data.htmlLink);
        }
    })
}

export const deleteCalendarEvent = (eventData: any) => {
    let id = '0000' + eventData;
    calendar.events.delete({
        auth: jwtClient,
        calendarId: calendId,
        eventId: id
    }, (err: Error, response: any) => {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        } else {
            console.log('Event deleted');
        }
    })
}

export const updateEvent = (eventId: any, resourceFields: any) => {
    let id = '0000' + eventId
    calendar.events.patch({
        auth: jwtClient,
        calendarId: calendId,
        eventId: id,
        resource: resourceFields
    }, (err: Error, response: any) => {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        } else {
            console.log('Event updated');
        }
    })
}