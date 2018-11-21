import express from 'express';
import bodyParser from 'body-parser';
import * as api from '../controllers/api';
import { deleteEventVisitor } from '../controllers/user';
import { getEventData } from '../controllers/user';

export const apiRouter = express.Router();

apiRouter.use(bodyParser.json());

apiRouter.get('/event/:eventId', api.checkToken, api.checkApiKey, getEventData);

apiRouter.delete('/event/:eventId/visitor/:visitorId', api.checkToken, api.checkApiKey, deleteEventVisitor);
