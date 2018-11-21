import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import session from 'express-session';
import passport from 'passport';
import passportLocal from 'passport-local';
import * as userModel from './models/user';
import { userRouter } from './routes/user';
import { apiRouter } from './routes/api';
import os from 'os';
import cluster from 'cluster';
import compression from 'compression';
import mysql from 'mysql';
const MySqlStore = require('express-mysql-session')(session);
const visitor = require('./routes/index');
const helmet = require('helmet');

const numCPUs = os.cpus().length;

const dbPool = mysql.createPool({
  connectionLimit: 100,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

if (cluster.isMaster) {
  console.log('master');
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', function () {
    cluster.fork();
  });

} else {

  const app = express();
  app.use(helmet());
  // stored to pass to other modules through req.app.get
  app.set('dbPool', dbPool);

  console.log('worker');
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
  // simple authentication using username and password from the db
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

  passport.serializeUser((user: any, done) => {
    delete user.password;
    done(null, user);
  });
  passport.deserializeUser(async (user: any, done) => {
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

  app.use('/api', apiRouter);

  // public page route
  app.use('/:user', visitor.router);

  app.listen(process.env.PORT, () => {
    console.log('wat up');
  });
}