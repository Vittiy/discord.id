const express = require('express'),
    config = require('./config'),
    {Client} = require('discord.js'),
    session = require('express-session'),
    app = express(),
    client = new Client();

app.set('view engine', 'ejs');
client.login(config.botTOKEN)

app.use('/assets', express.static('public'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
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
    const user = await client.users.fetch(request.params.userID).catch(() => {});
    if(!user) return response.redirect('/404');
    response.render('index.ejs', {
        username: user.username,
        avatar: user.avatar,
        id: user.id,
        fetchedUser: true
    });
});

app.get('/get', async (request, response) => {
    response.redirect('/404');
});

app.get('/404', async (request, response) => {
    response.render('404.ejs');
});


app.listen(8000)
