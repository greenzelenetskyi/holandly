/**
 * pre-work
 * 1. get endpoint address
 * 2. add webhook flags to event
 * 
 * 1. install axios module
 * 2. make post request to a specified endpoint
 * 3. pass event type and available non-secure data about the event
 * 4. make retries if the response is not 200
 * 
 */

 import axios from 'axios';
 import jwt from 'jsonwebtoken';

 let ENDPOINT = 'http://localhost:8129';

 interface Resource {
   event: string,
   pattern: string,
   date: string,
   time: string,
   visitorName: string,
   visitorEmail: string
 }

 export const generateApiToken = (userName: string) => {
   return new Promise((reject, resolve) => {
    jwt.sign({user: userName}, 'secret', (err: Error, token: string) => {
      if(err) {
          console.log(err)
        return reject(err);
      }
      resolve(token);
    });
   });
 }

 
export const sendHookData = async (resource: Resource) => {
    try {
      let response = await axios.post(ENDPOINT, resource);
      console.log(response);
    } catch (err) {
        console.log(err.message);
    }
 }