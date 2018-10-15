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
const path_1 = __importDefault(require("path"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_session_1 = __importDefault(require("express-session"));
const memorystore_1 = __importDefault(require("memorystore"));
const userModel = __importStar(require("./models/user"));
const user_1 = require("./routes/user");
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = __importDefault(require("passport-local"));
//import * as calendar from './models/calendar';
const visitor = require('./routes/index');
const LocalStrategy = passport_local_1.default.Strategy;
const memoryStore = memorystore_1.default(express_session_1.default);
const app = express_1.default();
app.use(express_session_1.default({
    secret: 'waffle',
    resave: false,
    saveUninitialized: true,
    store: new memoryStore({
        checkPeriod: 86400000
    })
}));
userModel.dbConnect;
//calendar.insertToCalendar();
app.set('views', path_1.default.join(__dirname, 'views'));
app.set('view engine', 'pug');
passport_1.default.use(new LocalStrategy(userModel.verifyUser));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
passport_1.default.serializeUser(function (user, done) {
    done(null, user.userId);
});
passport_1.default.deserializeUser(function (user, done) {
    userModel.dbConnect.query('select * from holandly.users where userId=?', [user], function (err, usr, fields) {
        done(null, usr[0]);
    });
});
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.text());
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
// processes user admin page routes
app.use('/', user_1.userRouter);
app.use('/user', visitor.router);
app.listen(8130, () => {
    console.log('wat up');
});
//# sourceMappingURL=server.js.map