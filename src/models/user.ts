import mysql from 'mysql';

export const dbPool = mysql.createPool({
  connectionLimit: 100,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

const makeSqlQuery = (sqlString: string, params?: any): Promise<any> => {
  return new Promise((resolve, reject) => {
      dbPool.query(sqlString, params, (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      })
  })
    
}

export const getUserName = (userId: any) => {
  let sqlString = `select userId from holandly.users where userId=?`;
  return makeSqlQuery(sqlString, userId);
}

export const findUser = (username: any) => {
  let sqlString = `select * from holandly.users where login=?`;
  return makeSqlQuery(sqlString, username);
}

export const queryScheduledEvents = () => {
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
  return makeSqlQuery(sqlString);
}

export const queryEventPatterns = () => {
  let sqlString = `select * from eventpattern;`;
  return makeSqlQuery(sqlString);
}

export const queryCreatedEvents = () => {
  let sqlString = `select eventslist.*, visitCount.occupied, eventpattern.number, eventpattern.type from holandly.eventslist
                    inner join eventpattern on eventslist.patternId = eventpattern.patternId
                    left join (select eventId, COUNT(*) AS occupied from eventvisitors group by eventId) AS visitCount on eventslist.eventId = visitCount.eventId
                  order by date, time;`;
  return makeSqlQuery(sqlString);
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

export const getPatternEvents = (patternId: any): any => {
  let sqlString = `select eventId from eventslist where patternId = ?`;
  return makeSqlQuery(sqlString, patternId);
}

export let deletePattern = (patternId: any) => { // delete all the active events
  let sqlString = `delete from eventpattern where eventpattern.patternId = ?`;
  return makeSqlQuery(sqlString, patternId);
}

export const deleteEvent = (eventId: any) => {
  let sqlString = `delete from eventslist where eventId = ?`;
  return makeSqlQuery(sqlString, eventId);
}

export const deleteEventVisitor = (event: any) => {
  let sqlString = `delete from eventvisitors where eventId = ?
                  and visitorId = (select visitors.visitorId from visitors where email=?);`;
  let queryParams = [event.eventId, event.email];
  return makeSqlQuery(sqlString, queryParams);
}

export const updateVisitorsInCalendar = (eventId: any) => {
  let sqlString = `select visitors.visitorId as id, visitors.email, visitors.name as displayName from eventvisitors
                   inner join visitors on visitors.visitorId = eventvisitors.visitorId
                   where eventId=?`;
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

export const getEventDuration = (patternId: any) => {
  let sqlString = `select duration from eventpattern where patternId=?`;
  return makeSqlQuery(sqlString, patternId);
}

// google calendar api insert event call
export const getPatternData = (patternId: any) => {
  let sqlString = `select description, duration, type from eventpattern where patternId=?`;
  return makeSqlQuery(sqlString, patternId);
}