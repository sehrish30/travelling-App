require('dotenv').config();
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const index = require('./routes/index');
const helmet = require('helmet');
const compression = require('compression')

// For sessions
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

// For flash messages (also requires session from above)
const flash = require('connect-flash');

// For passport.js:
const User = require('./models/user');
const passport = require('passport');

const app = express();
// compress responses
app.use(compression())

app.use(helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Session management
app.use(session({
  secret: process.env.SECRET,
  saveUninitialized: false, 
  resave: false, 
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

// Configure passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Passport.js
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash messages
app.use(flash());

// Make locals available in all templates
app.use((req, res, next) =>{
  res.locals.user = req.user;
  res.locals.url = req.path,
  res.locals.flash = req.flash();
  next();
});

//Set up mongoose connection
mongoose.connect(process.env.DB);
mongoose.Promise = global.Promise;
mongoose.connection.on('error', (error) => console.error(error.message) );

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(express.static(path.join(__dirname, 'public')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
