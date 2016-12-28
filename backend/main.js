const util = require("util");
const express = require("express");
const bodyParser = require("body-parser");
const resources = require("./resources.js");
const constants = require("./constants.js");
const requestHandlers = require("./requestHandlers.js");

const app = express();
app.use(express.static("../web"));
app.use(bodyParser.json());

app.post("/config/sso_url", requestHandlers.onGetSsoUrl);
app.post("/user/authenticate", requestHandlers.onUserAuthenticate);
app.post("/user/check", requestHandlers.onUserCheck);
app.post("/video/new", requestHandlers.onNewVideo);
app.post("/video/count", requestHandlers.onGetVideoCount);

async function run() {
    await resources.init();
    app.listen(constants.LISTEN_PORT);
}

run();
