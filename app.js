var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require("mongoose");
require('dotenv').config();
var indexRouter = require('./routes/index');
const compression = require('compression')
const helmet = require('helmet');

//For passport.js
const User = require('./models/user');
const passport = require('passport');

//For flash messages
const flash = require('connect-flash');

//For sessions
const session = require('express-session');
const MongoStore = require('connect-mongo')(session); //session is middleware running fo each request

var app = express();

//


// compress responses
app.use(compression())

//helmet middleware
app.use(helmet());

// // view engine setup
// mongoose.connect('mongodb+srv://lets_travel:letstravel@cluster0.icmzf.mongodb.net/<dbname>?retryWrites=true&w=majority');
// mongoose.Promise = global.Promise;
// mongoose.connection.on('error', (error) => {
//   console.error(error.message);
// })

//New set up
mongoose.connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(res => console.log('Connected to db'));
mongoose.Promise = global.Promise;


//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(session({
  secret: process.env.SECRET,
  saveUninitialized: false,
  resave: false,
  store: new MongoStore({
    mongooseConnection: mongoose.connection
  })
  //resave means session isot saved unless modified
  //Secret is session id which is of your choice in env
  //save unintialized means new session is not saved in database unless th ession is actually modified
}));

//configure passport middleware
app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//Flash messages
app.use(flash());


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.url = req.path;
  res.locals.flash = req.flash();
  next();
})
//req.locals flash will enable it to be availble for entire project for ocnditional rendering
app.use('/', indexRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});



// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;