const path = require("path");
const util = require("util");
const express = require("express");
const bodyParser = require("body-parser");
const resources = require("./resources.js");
const requestHandlers = require("./requestHandlers.js");

let app;

async function run() {
    await resources.init();

    app = express();

    let webDirectory = path.join(__dirname, "../web");
    if(resources.cfg.webDirectory) webDirectory = resources.cfg.webDirectory;

    app.use(express.static(webDirectory));
    app.use(bodyParser.json());

    app.post("/config/sso_url", requestHandlers.onRequest("getSsoUrl"));
    app.post("/config/site_title", requestHandlers.onRequest("getSiteTitle"));
    app.post("/user/authenticate", requestHandlers.onRequest("userAuthenticate"));
    app.post("/user/check", requestHandlers.onRequest("userCheck"));
    app.post("/video/new", requestHandlers.onRequest("newVideo"));
    app.post("/video/remove", requestHandlers.onRequest("removeVideo"));
    app.post("/video/info", requestHandlers.onRequest("getVideoInfo"));
    app.post("/video/count", requestHandlers.onRequest("getVideoCount"));
    app.post("/video/latest", requestHandlers.onRequest("getLatestVideos"));
    app.post("/video/like/new", requestHandlers.onRequest("createVideoLike"));
    app.post("/video/like/count", requestHandlers.onRequest("getVideoLikeCount"));
    app.post("/video/upload/request", requestHandlers.onRequest("requestClientVideoUpload"));
    app.post("/video/upload/check", requestHandlers.onRequest("checkClientVideoUpload"));
    app.post("/comment/new", requestHandlers.onRequest("createComment"));
    app.post("/comment/get", requestHandlers.onRequest("getComments"));
    app.post("/comment/count", requestHandlers.onRequest("getCommentCount"));

    app.listen(resources.cfg.listenPort);
}

run();
