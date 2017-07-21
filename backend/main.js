const path = require("path");
const util = require("util");
const ice = require("ice-node");
/*
const bodyParser = require("body-parser");
const RateLimit = require("express-rate-limit");
*/
const resources = require("./resources.js");
const requestHandlers = require("./requestHandlers.js");

let app;

async function run() {
    await resources.init();

    if(util.isString(resources.cfg.serviceName) && util.isString(resources.cfg.serviceAddr)) {
        console.log("Registering service...");
        console.log("Done.");
    }

    app = new ice.Ice();

    let webDirectory = path.join(__dirname, "../web");
    if(resources.cfg.webDirectory) webDirectory = resources.cfg.webDirectory;

    /*
    let rateLimitRule = new RateLimit({
        "windowMs": 2 * 60 * 1000, // 2 mins
        "delayAfter": 150,
        "delayMs": 100,
        "max": 300,
        "message": JSON.stringify({
            "result": "failed",
            "msg": "Request frequency too high"
        })
    });
    app.use(rateLimitRule);
    */

    app.use("/web/", ice.static(webDirectory));
    app.use("/", req => req.body = req.json());
    //app.use(bodyParser.json());

    app.post("/config/sso_url", requestHandlers.onRequest("getSsoUrl"));
    app.post("/config/site_title", requestHandlers.onRequest("getSiteTitle"));
    app.post("/config/service_id", requestHandlers.onRequest("getServiceId"));
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

    console.log("Listening on port " + resources.cfg.listenPort);
    app.listen("0.0.0.0:" + resources.cfg.listenPort);
}

run();
