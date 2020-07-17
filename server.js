const express = require('express'),
    bodyParser = require('body-parser'),
    config = require('./config'),
    { Client } = require('discord.js'),
    session = require('express-session'),
    app = express(),
    client = new Client();

app.set('view engine', 'ejs');
client.login(config.botTOKEN)

app.use('/assets', express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(session({
    secret: config.secret,
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false}
}));

app.get('/', (request, response) => {
    response.render('index.ejs');
});

app.get('/get/:userID', async (request, response) => {
    const user = await client.users.fetch(request.params.userID)
    response.render('index.ejs', {
        username: user.username,
        fetchedUser: true
    });
});

app.get('/get', async (request, response) => {
    response.render('404.ejs');
});


app.listen(8000)
