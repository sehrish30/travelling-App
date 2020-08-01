var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require("mongoose");
require('dotenv').config();
var indexRouter = require('./routes/index');

var app = express();

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



app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.locals.url = req.path
  next();
})

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