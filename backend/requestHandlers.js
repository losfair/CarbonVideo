const util = require("util");
const rp = require("request-promise");
const resources = require("./resources.js");
const constants = require("./constants.js");
const tokenManager = require("./tokenManager.js");
const videoManager = require("./videoManager.js");

function onGetSsoUrl(req, resp) {
    resp.send(constants.SSO_URL);
}

async function verifyRequest(req, resp, args, requireAuth) {
    let returnValueOnSuccess = true;

    if(!req.body) {
        resp.send(JSON.stringify({
            "result": "failed",
            "msg": "Bad request"
        }));
        return false;
    }

    if(requireAuth) {
        args.push({
            "name": "token",
            "type": "string"
        });
    }

    args.forEach((v) => {
        if(
               !req.body[v.name]
            || (v.type && typeof(req.body[v.name]) != v.type)
        ) {
            resp.send(JSON.stringify({
                "result": "failed",
                "msg": "Invalid parameters"
            }));
            return false;
        }
    });

    if(requireAuth) {
        let result = await tokenManager.checkToken(req.body.token);
        if(!result) {
            resp.send(JSON.stringify({
                "result": "failed",
                "msg": "Not logged in"
            }));
            return false;
        }
        returnValueOnSuccess = result;
    }

    return returnValueOnSuccess;
}

async function onUserAuthenticate(req, resp) {
    let result = await verifyRequest(req, resp, [
        {
            "name": "ssoToken",
            "type": "string"
        }
    ]);
    if(!result) return;

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
    let username = await verifyRequest(req, resp, [], true);
    if(!username) return;

    resp.send(JSON.stringify({
        "result": "success",
        "msg": "OK",
        "isLoggedIn": true,
        "username": username
    }));
}

async function onNewVideo(req, resp) {
    let username = await verifyRequest(req, resp, [
        {
            "name": "videoTitle",
            "type": "string"
        }, {
            "name": "videoUrl",
            "type": "string"
        }, {
            "name": "videoDesc",
            "type": "string"
        }
    ], true);
    if(!username) return;

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

async function onGetVideoInfo(req, resp) {
    let result = await verifyRequest(req, resp, [
        {
            "name": "videoId",
            "type": "string"
        }
    ]);
    if(!result) return;

    let videoInfo;
    try {
        videoInfo = await videoManager.getVideoInfo(req.body.videoId);
        if(!videoInfo) throw "No video info";
    } catch(e) {
        resp.send(JSON.stringify({
            "result": "failed",
            "msg": "Unable to get video info"
        }));
        return;
    }

    resp.send(JSON.stringify({
        "result": "success",
        "msg": "OK",
        "videoInfo": videoInfo
    }));
}

async function onGetVideoCount(req, resp) {
    let result = await verifyRequest(req, resp, []);

    if(!result) return;

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

async function onGetLatestVideos(req, resp) {
    let result = await verifyRequest(req, resp, [
        {
            "name": "count",
            "type": "number"
        }
    ]);
    if(!result) return;

    let videos;
    try {
        videos = await videoManager.getLatestVideos(req.body.count);
        if(!videos) throw "No videos";
    } catch(e) {
        resp.send(JSON.stringify({
            "result": "failed",
            "msg": "Unable to get latest videos"
        }));
        return;
    }
    resp.send(JSON.stringify({
        "result": "success",
        "msg": "OK",
        "latestVideos": videos
    }));
}

module.exports.onGetSsoUrl = onGetSsoUrl;
module.exports.onUserAuthenticate = onUserAuthenticate;
module.exports.onUserCheck = onUserCheck;
module.exports.onNewVideo = onNewVideo;
module.exports.onGetVideoInfo = onGetVideoInfo;
module.exports.onGetVideoCount = onGetVideoCount;
module.exports.onGetLatestVideos = onGetLatestVideos;
