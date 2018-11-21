import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

export const checkToken = (req: Request, res: Response, next: Function) => {
  let token = req.header('Authorization');
  if (token) {
    req.token = token.split(' ')[1];
    next();
  } else {
    res.status(403).json();
  }
}

export const checkApiKey = (req: Request, res: Response, next: Function) => {
  jwt.verify(req.token, process.env.API_SECRET, { algorithms: [process.env.API_ALGORITHM] }, (err, decoded) => {
    if (err) {
      console.log(err)
    } else {
      req.user = decoded;
      next();
    }
  })
}

export const requestReceived = (req: Request, res: Response) => {
  console.log(req.user);
  console.log(req.params)
}