const resources = require("./resources.js");
const uuid = require("uuid");

async function createVideo(username, title, url, desc) {
    let videoId = uuid.v4();
    let videoInfo = {
        "videoId": videoId,
        "videoCreatedBy": username,
        "videoTitle": title,
        "videoUrl": url,
        "videoDesc": desc
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
    return {
        "videoCreatedBy": result.videoCreatedBy,
        "videoTitle": result.videoTitle,
        "videoUrl": result.videoUrl,
        "videoDesc": result.videoDesc
    };
}

async function getVideoCount() {
    let count = await resources.db.collection("videos").count();
    return count;
}

module.exports.createVideo = createVideo;
module.exports.getVideoInfo = getVideoInfo;
module.exports.getVideoCount = getVideoCount;
