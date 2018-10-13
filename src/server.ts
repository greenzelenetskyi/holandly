import express from "express";
import path from "path";
import bodyParser from 'body-parser';
import session from 'express-session';
import sessionStore from 'memorystore';
import * as userModel from "./models/user";
import { userRouter } from "./routes/user";
import passport from 'passport';
import passportLocal from 'passport-local'
const LocalStrategy = passportLocal.Strategy;
const memoryStore = sessionStore(session);
const app = express();


app.use(session({
  secret: 'waffle',
  resave: false,
  saveUninitialized: true,
  store: new memoryStore({
    checkPeriod: 86400000
  })
}))

userModel.dbConnect;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

passport.use(new LocalStrategy(userModel.verifyUser))
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user: any, done) {
  done(null, user.userId);
});
passport.deserializeUser(function(user: any, done) {
  userModel.dbConnect.query('select * from holandly.users where userId=?', [user], function(err: any, usr: any, fields: any) {
    done(null, usr[0]);
  }
)});

app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(express.static(path.join(__dirname, 'public')));

// processes user admin page routes
app.use('/', userRouter)

//app.use('/user', visitor.router);

app.listen(8130, () => {
    console.log('wat up');
});