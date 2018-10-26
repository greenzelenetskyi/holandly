import express from 'express';
import bodyParser from 'body-parser';
import * as userController from '../controllers/user';
import passport from 'passport';

export const userRouter = express.Router();

userRouter.use(bodyParser.json());

userRouter.get('/', userController.requireLogin, userController.getMainPage);

userRouter.route('/login')
    .get(userController.getLoginPage)
    .post(passport.authenticate('local'), (req, res) => { res.redirect('/edit') });

userRouter.get('/logout', userController.stopSession);

userRouter.route('/events')
    .get(userController.requireLogin, userController.sendAvailableEvents)
    .post(userController.requireLogin, userController.scheduleEvent);

userRouter.route('/pattern')
    .get(userController.requireLogin, userController.sendEventPatterns)
    .post(userController.requireLogin, userController.addNewEventPattern)
    .put(userController.requireLogin, userController.updateEventPattern);

/* Returns the events, which have visitors*/
userRouter.get('/scheduled', userController.requireLogin, userController.sendScheduledEvents);

/* deletes the pattern by id specified in params, and then deletes all the events  */
userRouter.delete('/pattern/*', userController.requireLogin, userController.deleteEventPattern);

/* the param passed is the event id */
userRouter.delete('/events/*', userController.requireLogin, userController.deleteEvent);

/* cancels an event for one visitor */
userRouter.delete('/cancel', userController.requireLogin, userController.deleteEventVisitor);