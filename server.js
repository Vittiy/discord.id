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
    let badges;
    if (user.bot) {
        badges = {
            BUGHUNTER_LEVEL_1: user.flags.has(1 << 3),
            VERIFIED_BOT: user.flags.has(1 << 16)
        }
    } else {
        badges = {
            DISCORD_EMPLOYEE: user.flags.has(1 << 0),
            DISCORD_PARTNER: user.flags.has(1 << 1),
            HYPESQUAD_EVENTS: user.flags.has(1 << 2),
            BUGHUNTER_LEVEL_1: user.flags.has(1 << 3),
            HOUSE_BRAVERY: user.flags.has(1 << 6),
            HOUSE_BRILLIANCE: user.flags.has(1 << 7),
            HOUSE_BALANCE: user.flags.has(1 << 8),
            EARLY_SUPPORTER: user.flags.has(1 << 9),
            BUGHUNTER_LEVEL_2: user.flags.has(1 << 14),
            VERIFIED_DEVELOPER: user.flags.has(1 << 17)
        }
    }
    response.render('index.ejs', {
        username: user.username,
        avatar: user.avatar,
        badges: badges,
        id: user.id,
        bot: user.bot,
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
