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
const passport_1 = __importDefault(require("passport"));
exports.userRouter = express_1.default.Router();
exports.userRouter.use(body_parser_1.default.json());
exports.userRouter.get('/', userController.requireLogin, userController.getMainPage);
exports.userRouter.route('/login')
    .get(userController.getLoginPage)
    .post(passport_1.default.authenticate('local'), (req, res) => { res.redirect('/edit'); });
exports.userRouter.get('/logout', userController.stopSession);
exports.userRouter.route('/events')
    .get(userController.requireLogin, userController.sendAvailableEvents)
    .post(userController.requireLogin, userController.scheduleEvent);
exports.userRouter.route('/pattern')
    .get(userController.requireLogin, userController.sendEventPatterns)
    .post(userController.requireLogin, userController.addNewEventPattern)
    .put(userController.requireLogin, userController.updateEventPattern);
/* Returns the events, which have visitors*/
exports.userRouter.get('/scheduled', userController.requireLogin, userController.sendScheduledEvents);
/* deletes the pattern by id specified in params, and then deletes all the events  */
exports.userRouter.delete('/pattern/*', userController.requireLogin, userController.deleteEventPattern);
/* the param passed is the event id */
exports.userRouter.delete('/events/*', userController.requireLogin, userController.deleteEvent);
/* cancels an event for one visitor */
exports.userRouter.delete('/cancel', userController.requireLogin, userController.deleteEventVisitor);
//# sourceMappingURL=user.js.map