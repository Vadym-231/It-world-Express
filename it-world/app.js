var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const history = require('connect-history-api-fallback')
var indexRouter = require('./routes/index');
var api = require('./routes/api');
const Cookies = require('cookies')
const {sql} = require('./nodeSrc/mySqlClass')
var app = express();


const _sql = new sql('127.0.0.1','root','root','parsedate');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('root'));
app.use(express.static(path.join(__dirname, 'public')));


const session = require('express-session')
var mySqlStor = require('express-mysql-session')(session)



//var conn =
var sessionStore = new mySqlStor({

  checkExpirationInterval: 900000,// How frequently expired sessions will be cleared; milliseconds.
  createDatabaseTable: true,// Whether or not to create the sessions database table, if one does not already exist.
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'id',
      expires: 'expires',
      data: 'token',

    }
  }
}, _sql.conn);

/*
app.use(session({
  name:'SSID',
  secret: 'root',

  cookie: {
    maxAge:60*10*1000,
    httpOnly: true,
    secure: false
  },
  resave:false,
  //domain: '.mydomain.com',
  store: sessionStore,
  signed: true,

  saveUninitialized: true
}));
*/

app.use(RegExp(/^\/api*/), api);
app.use(RegExp(/^\/.*/), indexRouter);
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
