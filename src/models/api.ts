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
    jwt.sign({ user: userName }, 'secret', { algorithm: 'HS512' }, (err: Error, token: string) => {
      if (err) {
        return reject(err);
      }
      resolve(token);
    });
  });
}

export const sendHookData = async (resource: Resource) => {
  try {
    let response = await axios.post(ENDPOINT, resource);
  } catch (err) {
    console.log(err.message);
  }
}