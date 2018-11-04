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
import mysql from 'mysql';
const MySqlStore = require('express-mysql-session')(session);
const visitor = require('./routes/index');

const numCPUs = os.cpus().length;

const dbPool = mysql.createPool({
  connectionLimit: 100,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

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

  app.set('dbPool', dbPool);

  console.log('hi i am a worker');
  const LocalStrategy = passportLocal.Strategy;

  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: new MySqlStore({}, dbPool)
  }));

  app.set('views', path.join(__dirname, '../views'));
  app.set('view engine', 'pug');

  app.use(compression());
  passport.use(new LocalStrategy(async (username: string, password: string, callback: Function) => {
    try {
      let user = await userModel.findUser(username, dbPool);
      if (user.length === 0) {
        return callback(null, false);
      }
      if (user[0].password !== password) {
        return callback(null, false);
      }
      return callback(null, user[0]);
    } catch (err) {
      callback(err);
    }
  }));
  
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser(function (user: any, done) {
    delete user.password;
    done(null, user);
  });
  passport.deserializeUser(async function (user: any, done) {
    try {
      let usr = await userModel.getUserName(user.userId, app.get('dbPool'));
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