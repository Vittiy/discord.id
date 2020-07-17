const express = require('express'),
    bodyParser = require('body-parser'),
    config = require('./config'),
    session = require('express-session'),
    app = express();

app.set('view engine', 'ejs');

app.use('/assets', express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(session({
    secret: config.secret,
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false}
}));

app.listen(8000)
