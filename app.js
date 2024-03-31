var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('hbs'); // Required for below helper functions

var indexRouter = require('./routes/index');
// Add the router for tasks
var tasksRouter = require('./routes/tasks');
var usersRouter = require('./routes/users');

// Import scheduler service
var scheduler = require('./services/scheduler');
scheduler; // Start the scheduler

// Import mongoose
var mongoose = require('mongoose');
var configs = require('./configs/globals');

// Creates a hbs helper to convert a variable to JSON so we can access it client-side in the hbs file. Used to create the messages dynamically
hbs.registerHelper('json', function(context) {
  return JSON.stringify(context);
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
// Use the router for tasks
app.use('/users', usersRouter);
app.use('/tasks', tasksRouter);

// Connect to MongoDB
mongoose.connect(configs.ConnectionStrings.MongoDB).then(
  () => {console.log('Connected to MongoDB')},
  err => {console.error('Error connecting to MongoDB')}
);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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