// modules
const express = require("express");
const app = express();
const config = require("./config");
const client = new (require("discord.js")).Client();
const Badges = require("./Badges");
const PORT = config.PORT || 3000;

client.on("ready", () => {
    client.user.setStatus("invisible");
    console.log("Bot is online!");
});

// run the client
client.login(config.TOKEN);

// config
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// main route
app.get("/", (req, res) => {
    res.render("index", {
        error: null
    });
});

// main route (post)
app.post("/", async (req, res) => {
    const userid = req.body.user;
    if (!userid) return res.redirect("/404");

    // fetch user
    const user = userid === client.user.id ? client.user : await client.users.fetch(getID(userid)).catch(e => {});
    if (!user || user.deleted) return res.render("index", {
        error: "Invalid user id!"
    });
    if (!user.flags) await user.fetchFlags();
    // get data
    const Flags = user.flags.toArray();
    if (user.bot && Flags.includes("VERIFIED_BOT")) user.verified = true;
    const flags = Flags.filter(b => !!Badges[b]).map(m => Badges[m]);
    if (user.avatar && user.avatar.startsWith("a_")) flags.push(Badges["DISCORD_NITRO"]);
    if (user.avatar) user.avatar = 'https://discordapp.com/assets/322c936a8c8be1b803cd94861bdfa868.png';
    if (user.bot) {
        flags.push(Badges["BOT"]);
    }

    return res.render("user", {
        user,
        flags
    });
});

// GET METHOD FOR X-BOT_V2 INTER SERVER.
app.get("/xbot/:userID", async (req, res) => {
    const userid = req.params.userID;
    if (!userid) return res.redirect("/404");

    // fetch user
    const user = userid === client.user.id ? client.user : await client.users.fetch(getID(userid)).catch(e => {});
    if (!user) return res.render("index", {
        error: "Invalid user id!"
    });
    if (!user.flags) await user.fetchFlags();
    // get data
    const Flags = user.flags.toArray();
    if (user.bot && Flags.includes("VERIFIED_BOT")) user.verified = true;
    const flags = Flags.filter(b => !!Badges[b]).map(m => Badges[m]);
    if (user.avatar.startsWith("a_")) flags.push(Badges["DISCORD_NITRO"]);
    if (user.bot) {
        flags.push(Badges["BOT"]);
    }

    return res.render("user", {
        user,
        flags
    });
});

// handle invalid routes/methods
app.all("*", (req, res) => {
    return res.render("404");
});

// start the server
app.listen(PORT, () => {
    console.log(`Website running on port *${PORT}`);
});

// resolve user id
function getID(source) {
    const tokenRegex = /([MN][A-Za-z\d]{23})\.([\w-]{6})\.([\w-]{27})/;
    const isToken = tokenRegex.test(source);
    if (isToken) {
        const base64 = source.split(".")[0];
        const id = Buffer.from(base64, 'base64').toString();
        return id;
    }
    return source;
}
