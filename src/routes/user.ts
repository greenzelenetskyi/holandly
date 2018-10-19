import express, {Request, Response} from 'express';
import bodyParser from 'body-parser';
import * as userController from "../controllers/user";
import * as userModel from "../models/user";
import passport from 'passport'

export const userRouter = express.Router();

userRouter.use(bodyParser.json());

userRouter.get("/", userController.requireLogin, userController.getMainPage);

userRouter.route('/login')
.get(userController.getLoginPage)
.post(passport.authenticate('local'), (req, res)=> {res.redirect('/')})

userRouter.get('/logout', userController.stopSession);

userRouter.route("/events")
.get(userController.requireLogin, userModel.sendAvailableEvents)
.post(userController.requireLogin, userModel.scheduleEvent)
  

userRouter.route('/pattern')
.get(userController.requireLogin, userModel.sendEventPatterns)
.post(userController.requireLogin, userModel.addNewEventPattern)
.put(userController.requireLogin, userModel.updateEventPattern)
  
/* Returns the events, which have visitors*/
userRouter.get('/scheduled', userController.requireLogin, userModel.sendScheduledEvents);
 
/* deletes the pattern by id specified in params, and then deletes all the events  */
userRouter.delete('/pattern/*', userController.requireLogin, userModel.deleteEventPattern)

/* the param passed is the event id */
userRouter.delete('/events/*', userController.requireLogin, userModel.deleteEvent)

/* cancels an event for one visitor */
userRouter.delete('/cancel', userController.requireLogin, userModel.deleteEventVisitor)