const mongoUrl = "mongodb+srv://rebecka:hemligtpwd@cluster1.ho8up.mongodb.net/nyhetsbrev?retryWrites=true&w=majority";var express = require('express');
const mongoUrlLocal = "mongodb://127.0.0.1:27017";

var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');

var app = express();

const myMongo = require('mongodb').MongoClient;
myMongo.connect(mongoUrl, {
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

app.use('/users', usersRouter);
app.use('/', adminRouter);

module.exports = app;