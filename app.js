var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

const myMongo = require('mongodb').MongoClient;
myMongo.connect("mongodb://127.0.0.1:27017", {
useUnifiedTopology:true}).then(client => {console.log("uppkopplad mot databas");
const myDatabase = client.db("nyhetsbrev");
app.locals.myDatabase = myDatabase})

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;