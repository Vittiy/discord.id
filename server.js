const express = require("express"),
    app = express(),
    chalk = require('chalk'),
    figlet = require('figlet'),
    d_id = figlet.textSync("DISCORD.ID")
config = require("./config"),
    client = new (require("discord.js")).Client(),
    Badges = require("./Badges"),
    PORT = config.PORT || 3000;

client.on("ready", async () => {
    await client.user.setStatus("invisible");
    console.log(chalk.magenta(d_id));
});

// config
app.set("view engine", "ejs");
app.use(express.static("public"))
    .use(express.json())
    .use(express.urlencoded({extended: true}));

// main route
app.get("/", (req, res) => {
    res.render("index", {
        error: null,
        title: config.title
    });
});

// redirect post requests to get
app.post("/", async (req, res) => {
    if (req.body.user) res.redirect(`/${req.body.user}`);
    else res.redirect("/404", {
        title: config.title
    });
});

// main route (get)
app.get("/:userID", async (req, res) => {
    const userid = req.params.userID;
    if (!userid) return res.redirect("/404", {
        title: config.title
    });

    // fetch user
    const user = userid === client.user.id ? client.user : await client.users.fetch(getID(userid)).catch(e => {
    });
    if (!user) return res.render("index", {
        error: "Invalid user id!",
        title: config.title
    });
    if (!user.flags) await user.fetchFlags();
    // get data
    const Flags = user.flags.toArray();
    if (user.bot && Flags.includes("VERIFIED_BOT")) user.verified = true;

    const flags = Flags.filter(b => !!Badges[b]).map(m => Badges[m]);
    if (user.flags.has(1 << 18)) flags.push(Badges["DISCORD_CERTIFIED_MODERATOR"]);

    if (user.avatar && user.avatar.startsWith("a_")) flags.push(Badges["DISCORD_NITRO"]);
    if (user.bot) {
        flags.push(Badges["BOT"]);
    }

    return res.render("user", {
        user,
        flags,
        title: config.title
    });
});

// main route (get)
app.get("/api/:userID", async (req, res) => {
    const userid = req.params.userID;
    if (!userid) return res.redirect("/404", {
        title: config.title
    });

    // fetch user
    const user = userid === client.user.id ? client.user : await client.users.fetch(getID(userid)).catch(e => {
    });
    if (!user) return res.render("index", {
        error: "Invalid user id!",
        title: config.title
    });
    if (!user.flags) await user.fetchFlags();
    // get data
    const Flags = user.flags.toArray();
    if (user.bot && Flags.includes("VERIFIED_BOT")) user.verified = true;

    const flags = Flags.filter(b => !!Badges[b]).map(m => Badges[m]);
    if (user.flags.has(1 << 18)) flags.push(Badges["DISCORD_CERTIFIED_MODERATOR"]);

    if (user.avatar && user.avatar.startsWith("a_")) flags.push(Badges["DISCORD_NITRO"]);
    if (user.bot) {
        flags.push(Badges["BOT"]);
    }
    let userObj = {
        user: user,
        custom_data: {
            badges: Flags
        }
    }

    await res.json(userObj)
});


// handle invalid routes/methods
app.all("*", (req, res) => {
    return res.render("404", {
        title: config.title
    });
});

// run the client
client.login(config.TOKEN);

// start the server
app.listen(PORT, () => {
    console.log(chalk.magenta('[RouterUtils]: ') + chalk.green('PORT : [' + PORT + ']'))
});

// resolve user id
function getID(source) {
    const tokenRegex = /([A-Za-z\d]{24})\.([\w-]{6})\.([\w-]{27})/,
        isToken = tokenRegex.test(source);
    if (isToken) {
        const base64 = source.split(".")[0];
        return Buffer.from(base64, 'base64').toString();
    }
    return source;
}
