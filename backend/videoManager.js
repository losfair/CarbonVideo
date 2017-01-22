const resources = require("./resources.js");
const uuid = require("uuid");
const fileManager = require("./fileManager.js");
const eventStreamAPI = require("event-stream-service-sdk");
const crypto = require("crypto");

async function createVideo(username, title, key, desc) {
    if(resources.adminUserList.indexOf(username) < 0) {
        return null;
    }

    if(!fileManager.validateKey(key)) {
        return null;
    }

    let videoId = uuid.v4();
    let videoInfo = {
        "videoId": videoId,
        "videoCreatedBy": username,
        "videoTitle": title,
        "videoKey": key,
        "videoDesc": desc,
        "videoCreateTime": Date.now()
    };
    await resources.db.collection("videos").insertOne(videoInfo);
    await eventStreamAPI.addEvent(
        crypto.createHash("md5").update(username).digest("hex"),
        resources.cfg.siteTitle + ": 创建视频",
        "创建视频: " + title,
        Date.now()
    );
    return videoId;
}

async function removeVideo(username, videoId) {
    if(resources.adminUserList.indexOf(username) < 0) {
        return null;
    }

    let result = await resources.db.collection("videos").find({
        "videoId": videoId
    }).toArray();

    if(!result || !result.length) {
        return null;
    }

    result = result[0];

    await resources.db.collection("videos").remove({
        "_id": result._id
    });

    await eventStreamAPI.addEvent(
        crypto.createHash("md5").update(username).digest("hex"),
        resources.cfg.siteTitle + ": 移除视频",
        "移除视频: " + result.videoTitle,
        Date.now()
    );

    await resources.db.collection("removedVideos").insertOne(result);

    return true;
}

async function getVideoInfo(id) {
    let result = await resources.db.collection("videos").find({
        "videoId": id
    }).limit(1).toArray();

    if(!result || !result.length) {
        return null;
    }

    result = result[0];

    let videoUrl = "";
    let videoKey = result.videoKey;
    if(!videoKey) videoUrl = result.videoUrl;
    else {
        videoUrl = fileManager.getDownloadUrl(videoKey);
    }

    return {
        "videoCreatedBy": result.videoCreatedBy,
        "videoTitle": result.videoTitle,
        "videoUrl": videoUrl,
        "videoDesc": result.videoDesc,
        "videoCreateTime": result.videoCreateTime
    };
}

async function getVideoCount() {
    let count = await resources.db.collection("videos").count();
    return count;
}

async function getLatestVideos(count) {
    if(count < 1 || count > 10) return null;
    let result = await resources.db.collection("videos")
        .find({})
        .sort({
            "videoCreateTime": -1
        })
        .limit(count)
        .toArray();
    if(!result || !result.length) {
        return null;
    }

    let ret = [];
    result.forEach((v) => {
        ret.push({
            "videoId": v.videoId,
            "videoCreatedBy": v.videoCreatedBy,
            "videoTitle": v.videoTitle,
            "videoCreateTime": v.videoCreateTime
        });
    });
    return ret;
}

async function createVideoLike(username, id) {
    let currentVideo = await resources.db.collection("videos")
        .find({
            "videoId": id
        })
        .limit(1)
        .toArray();
    
    if(!currentVideo || !currentVideo.length) {
        return null;
    }

    currentVideo = currentVideo[0];

    let currentLikeCount = currentVideo.likeCount;
    if(!currentLikeCount) currentLikeCount = 0;

    let result = await resources.db.collection("likes")
        .find({
            "username": username,
            "parentId": id
        })
        .limit(1)
        .toArray();

    if(result && result.length) {
        return null;
    }

    let likeId = uuid.v4();

    await resources.db.collection("likes")
        .insert({
            "likeId": likeId,
            "username": username,
            "parentId": id
        });
    
    await resources.db.collection("videos")
        .update({
            "_id": currentVideo._id
        }, {
            "$set": {
                "likeCount": currentLikeCount + 1
            }
        });
    
    return currentLikeCount + 1;
}

async function getVideoLikeCount(id) {
    let currentVideo = await resources.db.collection("videos")
        .find({
            "videoId": id
        })
        .limit(1)
        .toArray();
    
    if(!currentVideo || !currentVideo.length) return null;

    currentVideo = currentVideo[0];

    let currentLikeCount = currentVideo.likeCount;
    if(!currentLikeCount) currentLikeCount = 0;

    return currentLikeCount;
}

module.exports.createVideo = createVideo;
module.exports.removeVideo = removeVideo;
module.exports.getVideoInfo = getVideoInfo;
module.exports.getVideoCount = getVideoCount;
module.exports.getLatestVideos = getLatestVideos;
module.exports.createVideoLike = createVideoLike;
module.exports.getVideoLikeCount = getVideoLikeCount;
