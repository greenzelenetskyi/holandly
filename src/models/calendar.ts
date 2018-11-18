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
        return;
    } else {
        console.log('Successfully connected!');
    }
});

const callApi = (apiFunction: Function, apiObject: any) => {
    return new Promise((resolve, reject) => {
      apiFunction(apiObject, (err: Error, response: any) => {
        if(err) {
          return reject(err);
        }
        resolve(response);
      })
    })
  }

//Google Calendar API
let calendar = google.calendar('v3');

export const insertToCalendar = async (newEvent: any) => {
    let dateTime = moment(newEvent.date + ' ' + newEvent.time).format();
    let id = '1000' + newEvent.eventId;
    try {
        let apiResponse: any = await callApi(calendar.events.insert, {
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
    let id = '1000' + eventData;
    try {
        let apiResponse = await callApi(calendar.events.delete, {
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
    let id = '1000' + eventId
    console.log(resourceFields)
    try {
      let apiResponse = await callApi(calendar.events.patch, {
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