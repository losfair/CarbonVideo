const resources = require("./resources.js");
const uuid = require("uuid");
const fileManager = require("./fileManager.js");

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
    return videoId;
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

module.exports.createVideo = createVideo;
module.exports.getVideoInfo = getVideoInfo;
module.exports.getVideoCount = getVideoCount;
module.exports.getLatestVideos = getLatestVideos;
