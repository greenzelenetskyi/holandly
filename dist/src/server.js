"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: '../.env' });
const path_1 = __importDefault(require("path"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = __importDefault(require("passport-local"));
const userModel = __importStar(require("./models/user"));
const userController = __importStar(require("./controllers/user"));
const user_1 = require("./routes/user");
const os_1 = __importDefault(require("os"));
const cluster_1 = __importDefault(require("cluster"));
//import mysqlStore from 'express-mysql-session';
const MySqlStore = require('express-mysql-session')(express_session_1.default);
const visitor = require('./routes/index');
const numCPUs = os_1.default.cpus().length;
/*
1) no global variables and functions
2) no configurations inside working modules
3) use evironment vars
4) create files to compile and run
5) functions should be pure or get configuration object as a parameter
6) use redis or memcache as a session store
7) use clusters
8) large mysql requests should be cached
9) use async await
10) use docker
11) use single style throughout the code
12) response should be an object with error field and etc not s string
*/
if (cluster_1.default.isMaster) {
    console.log('hi I am your master');
    for (let i = 0; i < numCPUs; i++) {
        cluster_1.default.fork();
    }
    cluster_1.default.on('exit', function () {
        cluster_1.default.fork();
    });
}
else {
    const app = express_1.default();
    console.log('hi i am a worker');
    const LocalStrategy = passport_local_1.default.Strategy;
    app.use(express_session_1.default({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        store: new MySqlStore({}, userModel.dbPool)
    }));
    app.set('views', path_1.default.join(__dirname, 'views'));
    app.set('view engine', 'pug');
    passport_1.default.use(new LocalStrategy(userController.verifyUser));
    app.use(passport_1.default.initialize());
    app.use(passport_1.default.session());
    passport_1.default.serializeUser(function (user, done) {
        done(null, user.userId);
    });
    passport_1.default.deserializeUser(function (user, done) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let usr = yield userModel.getUserName(user);
                done(null, usr[0].userId);
            }
            catch (err) {
                console.log(err);
            }
        });
    });
    app.use(body_parser_1.default.json());
    app.use(body_parser_1.default.text());
    app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
    // processes user admin page routes
    app.use('/:clientname?/edit', user_1.userRouter);
    // http://server.com/admin -- admin all clients
    // http://server.com/shpp/p2p-entry-exam
    // http://........../:clientname/:meetingtype
    app.use('/user', visitor.router);
    app.listen(process.env.PORT, () => {
        console.log('wat up');
    });
}
//# sourceMappingURL=server.js.map