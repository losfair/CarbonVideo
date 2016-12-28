const util = require("util");
const rp = require("request-promise");
const resources = require("./resources.js");
const constants = require("./constants.js");
const tokenManager = require("./tokenManager.js");
const videoManager = require("./videoManager.js");

function onGetSsoUrl(req, resp) {
    resp.send(constants.SSO_URL);
}

async function onUserAuthenticate(req, resp) {
    if(
           !req.body
        || !util.isString(req.body.ssoToken)
    ) {
        resp.send(JSON.stringify({
            "result": "failed",
            "msg": "Bad request"
        }));
        return;
    }

    let data;
    try {
        data = await rp.post(
            constants.SSO_URL + "identity/verify/verify_client_token",
            {
                "form": {
                    "client_token": req.body.ssoToken
                }
            }
        );
        data = JSON.parse(data);
    } catch(e) {
        resp.send(JSON.stringify({
            "result": "failed",
            "msg": "Server request failed"
        }));
        return;
    }
    if(
           !data
        || data.err !== 0
        || !data.username
        || !util.isString(data.username)
        || (constants.DOMAIN && (!data.domain || data.domain != constants.DOMAIN))
    ) {
        resp.send(JSON.stringify({
            "result": "failed",
            "msg": "Authentication failed"
        }));
        return;
    }
    let newToken;
    try {
        newToken = await tokenManager.createToken(data.username);
    } catch(e) {
        resp.send(JSON.stringify({
            "result": "failed",
            "msg": "Unable to create token"
        }));
        return;
    }
    resp.send(JSON.stringify({
        "result": "success",
        "msg": "OK",
        "token": newToken
    }));
}

async function onUserCheck(req, resp) {
    if(
           !req.body
        || !util.isString(req.body.token)
    ) {
        resp.send(JSON.stringify({
            "result": "failed",
            "msg": "Bad request"
        }));
        return;
    }
    let result;
    try {
        result = await tokenManager.checkToken(req.body.token);
    } catch(e) {
        resp.send(JSON.stringify({
            "result": "failed",
            "msg": "Unable to check token"
        }));
        return;
    }
    if(!result) {
        resp.send(JSON.stringify({
            "result": "failed",
            "msg": "Not logged in",
            "isLoggedIn": false
        }));
        return;
    }

    resp.send(JSON.stringify({
        "result": "success",
        "msg": "OK",
        "isLoggedIn": true,
        "username": result
    }));
}

async function onNewVideo(req, resp) {
    if(
           !req.body
        || !util.isString(req.body.token)
        || !util.isString(req.body.videoTitle)
        || !util.isString(req.body.videoUrl)
        || !util.isString(req.body.videoDesc)
    ) {
        resp.send(JSON.stringify({
            "result": "failed",
            "msg": "Bad request"
        }));
        return;
    }
    let result = await tokenManager.checkToken(req.body.token);
    if(!result) {
        resp.send(JSON.stringify({
            "result": "failed",
            "msg": "Not logged in"
        }));
        return;
    }
    let username = result;
    let videoId;
    try {
        videoId = await videoManager.createVideo(username, req.body.videoTitle, req.body.videoUrl, req.body.videoDesc);
    } catch(e) {
        resp.send(JSON.stringify({
            "result": "failed",
            "msg": "Unable to create video"
        }));
        return;
    }
    resp.send(JSON.stringify({
        "result": "success",
        "msg": "OK",
        "videoId": videoId
    }));
}

async function onGetVideoCount(req, resp) {
    if(
           !req.body
        || !util.isString(req.body.token)
    ) {
        resp.send(JSON.stringify({
            "result": "failed",
            "msg": "Bad request"
        }));
        return;
    }
    let result = await tokenManager.checkToken(req.body.token);
    if(!result) {
        resp.send(JSON.stringify({
            "result": "failed",
            "msg": "Not logged in"
        }));
        return;
    }
    let videoCount;
    try {
        videoCount = await videoManager.getVideoCount();
    } catch(e) {
        resp.send(JSON.stringify({
            "result": "failed",
            "msg": "Unable to get video count"
        }));
        return;
    }
    resp.send(JSON.stringify({
        "result": "success",
        "msg": "OK",
        "videoCount": videoCount
    }));
}

module.exports.onGetSsoUrl = onGetSsoUrl;
module.exports.onUserAuthenticate = onUserAuthenticate;
module.exports.onUserCheck = onUserCheck;
module.exports.onNewVideo = onNewVideo;
module.exports.onGetVideoCount = onGetVideoCount;
