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
jwtClient.authorize((err: Error, tokens: any) => {
    if (err) {
        console.log(err);
        return;
    } else {
        console.log('Successfully connected!');
    }
});

//Google Calendar API
let calendar = google.calendar('v3');

export const insertToCalendar = async (newEvent: any) => {
    let dateTime = moment(newEvent.date + ' ' + newEvent.time).format();
    let id = '0000' + newEvent.eventId;
    try {
        let apiResponse = await calendar.events.insert({
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
        });
        //console.log('Event created: %s', apiResponse.data.htmlLink);
    } catch (err) {
        console.log('The API returned an error: ' + err.message);
    }
}

export const deleteCalendarEvent = async (eventData: any) => {
    let id = '0000' + eventData;
    try {
        let apiResponse = await calendar.events.delete({
            auth: jwtClient,
            calendarId: calendId,
            eventId: id
        });
        console.log('Event deleted');
    } catch (err) {
        console.log('The API returned an error: ' + err.message);
    }
}

export const updateEvent = async (eventId: any, resourceFields: any) => {
    let id = '0000' + eventId
    try {
      let apiResponse = await calendar.events.patch({
        auth: jwtClient,
        calendarId: calendId,
        eventId: id,
        resource: resourceFields
      });
      console.log('Event updated');
    } catch (err) {
      console.log('The API returned an error: ' + err.message);
    }
}