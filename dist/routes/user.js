"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const userController = __importStar(require("../controllers/user"));
const userModel = __importStar(require("../models/user"));
const passport_1 = __importDefault(require("passport"));
exports.userRouter = express_1.default.Router();
exports.userRouter.use(body_parser_1.default.json());
exports.userRouter.get("/", userController.requireLogin, userController.getMainPage);
exports.userRouter.route('/login')
    .get(userController.getLoginPage)
    .post(passport_1.default.authenticate('local'), (req, res) => { res.redirect('/'); });
exports.userRouter.get('/logout', userController.stopSession);
exports.userRouter.route("/events")
    .get(userController.requireLogin, userModel.sendAvailableEvents)
    .post(userModel.scheduleEvent);
exports.userRouter.route('/pattern')
    .get(userController.requireLogin, userModel.sendEventPatterns)
    .post(userController.requireLogin, userModel.addNewEventPattern)
    .put(userController.requireLogin, userModel.updateEventPattern);
/* Returns the events, which have visitors*/
exports.userRouter.get('/scheduled', userController.requireLogin, userModel.sendScheduledEvents);
/* deletes the pattern by id specified in params, and then deletes all the events  */
exports.userRouter.delete('/pattern/*', userController.requireLogin, userModel.deleteEventPattern);
/* the param passed is the event id */
exports.userRouter.delete('/events/*', userController.requireLogin, userModel.deleteEvent);
/* cancels an event for one visitor */
exports.userRouter.delete('/cancel', userController.requireLogin, userModel.deleteEventVisitor);
//# sourceMappingURL=user.js.map