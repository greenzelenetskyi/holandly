import express from 'express';
import bodyParser from 'body-parser';
import * as userController from '../controllers/user';
import passport from 'passport';

export const userRouter = express.Router();

userRouter.use(bodyParser.json());

userRouter.use(userController.requireLogin);

userRouter.get('/', userController.getMainPage);

userRouter.route('/login')
    .get(userController.getLoginPage)
    .post(passport.authenticate('local'), (req, res) => { res.redirect('/edit') });

userRouter.get('/logout', userController.stopSession);

userRouter.route('/events')
    .get(userController.sendAvailableEvents)
    .post(userController.scheduleEvent);

userRouter.route('/pattern')
    .get(userController.sendEventPatterns)
    .post(userController.addNewEventPattern)
    .put(userController.updateEventPattern);

/* Returns the events, which have visitors*/
userRouter.get('/scheduled', userController.sendScheduledEvents);

/* deletes the pattern by id specified in params, and then deletes all the events  */
userRouter.delete('/pattern/*', userController.deleteEventPattern);

/* the param passed is the event id */
userRouter.delete('/events/*', userController.deleteEvent);

/* cancels an event for one visitor */
userRouter.delete('/cancel', userController.deleteEventVisitor);

userRouter.route('/apiData')
    .get(userController.getUserApiData)
    .post(userController.updateUserEndpoints)
    .put(userController.generateNewApiToken);