import mysql, { MysqlError } from 'mysql';

export const dbPool = mysql.createPool({
  connectionLimit: 100,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

const makeSqlQuery = (sqlString: string, params?: any): Promise<any> => {
  return new Promise((resolve, reject) => {
      dbPool.query(sqlString, params, (err: MysqlError, result: Object[]) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      })
  })
    
}

export const getUserName = (userId: any) => {
  let sqlString = `select userId, login from holandly.users where userId=?`;
  return makeSqlQuery(sqlString, userId);
}

export const findUser = (username: any) => {
  let sqlString = `select userId, login, password from holandly.users where login=?`;
  return makeSqlQuery(sqlString, username);
}

export const queryScheduledEvents = (userId: number) => {
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
     order by eventslist.date, eventslist.time, eventpattern.type;`
  return makeSqlQuery(sqlString, userId);
}

export const queryEventPatterns = (userId: number) => {
  let sqlString = `select * from eventpattern;`;
  return makeSqlQuery(sqlString, userId);
}

export const queryCreatedEvents = (userId: number) => {
  let sqlString = `select eventslist.*, visitCount.occupied, eventpattern.number, eventpattern.type from holandly.eventslist
                    inner join eventpattern on eventslist.patternId = eventpattern.patternId
                    left join (select eventId, COUNT(*) AS occupied from eventvisitors group by eventId) AS visitCount on eventslist.eventId = visitCount.eventId
                  order by date, time;`;
  return makeSqlQuery(sqlString, userId);
}

export const insertNewPattern = (userId: number, pattern: any) => {
  let sqlString = `insert into eventpattern (type, number, duration, description, userId)
                      select ?, ?, ?, ?, ?
                  where not exists (select * from eventpattern where (type=? and userId = ?));`
  let queryParams = [pattern.type, pattern.number, pattern.duration, pattern.description, userId, pattern.type, userId];
  return makeSqlQuery(sqlString, queryParams);
}


//new method to update existing pattern details      and p.duration=? and p.description=? and   req.body.duration, req.body.description,
export const updatePattern = (attributes: any) => {
  let patternId: number = attributes.patternId;
  delete attributes.patternId;
  let sqlString = `update eventpattern set ? where patternId=? and not exists
                     (select * from (select * from holandly.eventpattern p
                  where (p.type=? and p.userId=? and patternId!=?)) as tmp)`;
  let queryParams = [attributes, patternId, attributes.type, attributes.userId, patternId];
  return makeSqlQuery(sqlString, queryParams);
}

export const getPatternEvents = (patternId: number) => {
  let sqlString = `select eventId from eventslist where patternId = ?`;
  return makeSqlQuery(sqlString, patternId);
}

export const getPatternEventsNotificationData = (patternId: number) => {
  let sqlString = `SELECT type, description, date, time, name as visitor from holandly.eventpattern
                    inner join eventslist on eventslist.patternId = eventpattern.patternId
                    inner join eventvisitors on eventslist.eventId = eventvisitors.eventId
                    inner join visitors on eventvisitors.visitorId = visitors.visitorId
                  where eventpattern.patternId = ?`;
  return makeSqlQuery(sqlString, [patternId]);
}

export let deletePattern = (patternId: number) => { // delete all the active events
  let sqlString = `delete from eventpattern where eventpattern.patternId = ?`;
  return makeSqlQuery(sqlString, patternId);
}

export const deleteEvent = (eventId: number) => {
  let sqlString = `delete from eventslist where eventId = ?`;
  return makeSqlQuery(sqlString, eventId);
}

export const deleteEventVisitor = (event: {eventId: number, email:  string}) => {
  let sqlString = `delete from eventvisitors where eventId = ?
                  and visitorId = (select visitors.visitorId from visitors where email=?);`;
  let queryParams = [event.eventId, event.email];
  return makeSqlQuery(sqlString, queryParams);
}

export const getVisitorNotificationData = (event: {eventId: number, email: string}) => {
  let sqlString = `SELECT type, description, date, time,
                    (select name from visitors where email = ?) as visitor from eventslist
                  inner join eventpattern on eventslist.patternId = eventpattern.patternId
                  where eventslist.eventId = ?`;
  let queryParams = [event.email, event.eventId]
  return makeSqlQuery(sqlString, queryParams);
}

export const getEventNotificationData = (eventId: number) => {
  let sqlString = `SELECT type, description, date, time, name as visitor from holandly.eventslist
                    inner join eventpattern on eventslist.patternId = eventpattern.patternId
                    inner join eventvisitors on eventslist.eventId = eventvisitors.eventId
                    inner join visitors on eventvisitors.visitorId = visitors.visitorId
                  where eventslist.eventId = ?`
  return makeSqlQuery(sqlString, [eventId]);
}

export const updateVisitorsInCalendar = (eventId: number) => {
  let sqlString = `select visitors.visitorId as id, visitors.email, visitors.name as displayName from eventvisitors
                   inner join visitors on visitors.visitorId = eventvisitors.visitorId
                   where eventvisitors.eventId=?`;
  return makeSqlQuery(sqlString, eventId);
}

// schedules new or updates existing
export const updateEvent = (event: any) => {
  let sqlString = `UPDATE eventslist SET ? WHERE eventId=?`;
  return makeSqlQuery(sqlString, [event, event.eventId]);
}


export const scheduleNewEvent = (event: any) => {
  let sqlString = `INSERT INTO eventslist
                   SELECT ?, ?, ?, ?, ? FROM eventslist
                   WHERE eventId = ? or patternId = ? and time = ? and date = ?
                   HAVING COUNT(*) = 0`;
  let queryParams = [event.eventId, event.date, event.time, event.patternId, event.hasCalendarEntry
                    , event.eventId, event.patternId, event.time, event.date];
  return makeSqlQuery(sqlString, queryParams);
}

export const getEventDuration = (patternId: number) => {
  let sqlString = `select duration from eventpattern where patternId=?`;
  return makeSqlQuery(sqlString, patternId);
}

// google calendar api insert event call
export const getPatternData = (patternId: number) => {
  let sqlString = `select description, duration, type from eventpattern where patternId=?`;
  return makeSqlQuery(sqlString, patternId);
}