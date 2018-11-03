import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import session from 'express-session';
import passport from 'passport';
import passportLocal from 'passport-local';
import * as userModel from './models/user';
import * as userController from './controllers/user';
import { userRouter } from './routes/user';
import os from 'os';
import cluster from 'cluster';
import compression from 'compression';
const MySqlStore = require('express-mysql-session')(session);
const visitor = require('./routes/index');

const numCPUs = os.cpus().length;

if (cluster.isMaster) {
  console.log('hi I am your master');
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', function () {
    cluster.fork();
  });

} else {

  const app = express();
  console.log('hi i am a worker');
  const LocalStrategy = passportLocal.Strategy;

  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: new MySqlStore({}, userModel.dbPool)
  }));

  app.set('views', path.join(__dirname, '../views'));
  app.set('view engine', 'pug');
  
  app.use(compression());
  passport.use(new LocalStrategy(userController.verifyUser));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser(function (user: any, done) {
    delete user.password;
    done(null, user);
  });
  passport.deserializeUser(async function (user: any, done) {
    try {
      let usr = await userModel.getUserName(user.userId);
      done(null, usr[0]);
    } catch (err) {
      console.log(err);
    }
  });

  app.use(bodyParser.json());
  app.use(bodyParser.text());
  app.use(express.static(path.join(__dirname, 'public')));

  // processes user admin page routes
  app.use('/:clientname?/edit', userRouter);

  // http://server.com/:clientname?/edit -- admin all clients

  // http://server.com/shpp/p2p-entry-exam
  // http://........../:clientname/:meetingtype
  app.use('/user', visitor.router);

  app.listen(process.env.PORT, () => {
    console.log('wat up');
  });
}