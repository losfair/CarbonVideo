const util = require("util");
const rp = require("request-promise");
const crypto = require("crypto");
const resources = require("./resources.js");
const tokenManager = require("./tokenManager.js");
const videoManager = require("./videoManager.js");
const commentManager = require("./commentManager.js");
const fileManager = require("./fileManager.js");

async function verifyRequest(req, resp, args, requireAuth) {
    let returnValueOnSuccess = true;

    if (!req.body) {
        resp.send(JSON.stringify({
            "result": "failed",
            "msg": "Bad request"
        }));
        return false;
    }

    if (requireAuth) {
        args.push({
            "name": "token",
            "type": "string"
        });
    }

    try {
        args.forEach((v) => {
            if (
                !req.body[v.name]
                || (v.type && typeof (req.body[v.name]) != v.type)
            ) {
                throw "Invalid parameters";
            }
        });
    } catch(e) {
        resp.send(JSON.stringify({
            "result": "failed",
            "msg": e.toString()
        }));
        return false;
    }

    if (requireAuth) {
        let result = await tokenManager.checkToken(req.body.token);
        if (!result) {
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

function onGetSsoUrl() {
    return {
        "ssoUrl": resources.cfg.ssoUrl
    };
}

async function onGetSiteTitle() {
    return {
        "siteTitle": resources.cfg.siteTitle
    };
}

async function onUserAuthenticate(args) {
    let data = await rp.post(
        resources.cfg.ssoUrl + "identity/verify/verify_client_token",
        {
            "form": {
                "client_token": args.ssoToken
            }
        }
    );
    data = JSON.parse(data);

    if (
        !data
        || data.err !== 0
        || !util.isString(data.username)
        || !util.isString(data.userId)
        || (resources.cfg.domain && (!data.domain || data.domain != resources.cfg.domain))
    ) {
        throw "Authentication failed";
    }

    let eventId;
    await resources.eventStreamAPI.addEvent(
        data.userId,
        "用户登录",
        "",
        Date.now()
    );

    let newToken = await tokenManager.createToken(data.userId, data.username);
    return {
        "token": newToken,
        "eventId": eventId
    };
}

async function onUserCheck(args, username) {
    let isAdmin = false;
    if (resources.adminUserList.indexOf(username) >= 0) isAdmin = true;

    return {
        "isLoggedIn": true,
        "username": username,
        "isAdmin": isAdmin
    }
}

async function onNewVideo(args, username, userId) {
    let videoId;
    videoId = await videoManager.createVideo(userId, username, args.videoTitle, args.videoKey, args.videoDesc);

    return {
        "videoId": videoId
    };
}

async function onRemoveVideo(args, username, userId) {
    let result = await videoManager.removeVideo(userId, username, args.videoId);
    if(!result) throw "Unable to remove video";
    return {};
}

async function onGetVideoInfo(args) {
    let videoInfo = await videoManager.getVideoInfo(args.videoId);
    if (!videoInfo) throw "No video info";

    return {
        "videoInfo": videoInfo
    };
}

async function onGetVideoCount(args) {
    let videoCount = await videoManager.getVideoCount();
    return {
        "videoCount": videoCount
    };
}

async function onGetLatestVideos(args) {
    let videos = await videoManager.getLatestVideos(args.count);
    if (!videos) throw "No videos";

    return {
        "latestVideos": videos
    };
}

async function onCreateComment(args, username) {
    let commentId = await commentManager.createComment(
        username,
        args.parentType,
        args.parentId,
        args.commentContent
    );
    if (!commentId) throw "Comment creation failed";

    return {
        "commentId": commentId
    };
}

async function onGetComments(args) {
    let comments = await commentManager.getComments(args.parentId);
    if (!comments) throw "Unable to get comments";

    return {
        "comments": comments
    };
}

async function onGetCommentCount(args) {
    let commentCount = await commentManager.getCommentCount();

    return {
        "commentCount": commentCount
    };
}

async function onCreateVideoLike(args, username) {
    let result = await videoManager.createVideoLike(username, args.videoId);
    if(!result) throw "Unable to create video like";
    return {
        "likeCount": result
    };
}

async function onGetVideoLikeCount(args) {
    let result = await videoManager.getVideoLikeCount(args.videoId);
    if(!result && result !== 0) throw "Unable to get video like count";
    return {
        "likeCount": result
    };
}

async function onRequestClientVideoUpload(args, username) {
    let result = await fileManager.requestClientUpload(username, "mp4");
    if(!result) throw "Unable to request client upload";
    return result;
}

async function onCheckClientVideoUpload(args, username) {
    let result = await fileManager.checkClientUpload(args.uploadId, username);
    if(!result) throw "Unable to check client upload";
    return {};
}

async function onGetServiceId(args) {
    return {
        "serviceId": resources.cfg.serviceId
    };
}

const handlers = {
    "getSsoUrl": {
        "requireAuth": false,
        "func": onGetSsoUrl,
        "args": []
    },
    "getSiteTitle": {
        "requireAuth": false,
        "func": onGetSiteTitle,
        "args": []
    },
    "userAuthenticate": {
        "requireAuth": false,
        "func": onUserAuthenticate,
        "args": [
            {
                "name": "ssoToken",
                "type": "string"
            }
        ]
    },
    "userCheck": {
        "requireAuth": true,
        "func": onUserCheck,
        "args": []
    },
    "newVideo": {
        "requireAuth": true,
        "func": onNewVideo,
        "args": [
            {
                "name": "videoTitle",
                "type": "string"
            }, {
                "name": "videoKey",
                "type": "string"
            }, {
                "name": "videoDesc",
                "type": "string"
            }
        ]
    },
    "removeVideo": {
        "requireAuth": true,
        "func": onRemoveVideo,
        "args": [
            {
                "name": "videoId",
                "type": "string"
            }
        ]
    },
    "getVideoInfo": {
        "requireAuth": false,
        "func": onGetVideoInfo,
        "args": [
            {
                "name": "videoId",
                "type": "string"
            }
        ]
    },
    "getVideoCount": {
        "requireAuth": false,
        "func": onGetVideoCount,
        "args": []
    },
    "getLatestVideos": {
        "requireAuth": false,
        "func": onGetLatestVideos,
        "args": [
            {
                "name": "count",
                "type": "number"
            }
        ]
    },
    "createComment": {
        "requireAuth": true,
        "func": onCreateComment,
        "args": [
            {
                "name": "commentContent",
                "type": "string"
            }, {
                "name": "parentType",
                "type": "string"
            }, {
                "name": "parentId",
                "type": "string"
            }
        ]
    },
    "getComments": {
        "requireAuth": false,
        "func": onGetComments,
        "args": [
            {
                "name": "parentId",
                "type": "string"
            }
        ]
    },
    "getCommentCount": {
        "requireAuth": false,
        "func": onGetCommentCount,
        "args": []
    },
    "createVideoLike": {
        "requireAuth": true,
        "func": onCreateVideoLike,
        "args": [
            {
                "name": "videoId",
                "type": "string"
            }
        ]
    },
    "getVideoLikeCount": {
        "requireAuth": false,
        "func": onGetVideoLikeCount,
        "args": [
            {
                "name": "videoId",
                "type": "string"
            }
        ]
    },
    "requestClientVideoUpload": {
        "requireAuth": true,
        "func": onRequestClientVideoUpload,
        "args": []
    },
    "checkClientVideoUpload": {
        "requireAuth": true,
        "func": onCheckClientVideoUpload,
        "args": [
            {
                "name": "uploadId",
                "type": "string"
            }
        ]
    },
    "getServiceId": {
        "requireAuth": false,
        "func": onGetServiceId,
        "args": []
    }
};

function onRequest(handlerName) {
    let targetHandler = handlers[handlerName];
    if (!targetHandler) throw "Handler not found: " + handlerName;

    return async function (req, resp) {
        let result = await verifyRequest(
            req,
            resp,
            targetHandler.args,
            targetHandler.requireAuth
        );
        if (!result) return;

        let username = "";
        let userId = "";
        if(targetHandler.requireAuth) {
            username = result.username;
            userId = result.userId;
        }

        try {
            result = await targetHandler.func(req.body, username, userId);
            if(!result) throw "Empty response from target handler";
            if(!util.isObject(result)) throw "Response is not an object";
        } catch(e) {
            resp.send(JSON.stringify({
                "result": "failed",
                "msg": e.toString()
            }));
            return;
        }

        result.result = "success";
        result.msg = "OK";

        resp.send(JSON.stringify(result));
    }
}

module.exports.onGetSsoUrl = onGetSsoUrl;
module.exports.onRequest = onRequest;
