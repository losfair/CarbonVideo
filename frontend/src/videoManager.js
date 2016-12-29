import * as pageUtils from "./pageUtils.js";
import * as authUtils from "./authUtils.js";
import * as network from "./network.js";

async function createVideo(title, url, desc) {
    let token = authUtils.getSessionToken();

    let result = await network.makeRequest(
        "POST",
        "/video/new",
        JSON.stringify({
            "token": token,
            "videoTitle": title,
            "videoUrl": url,
            "videoDesc": desc
        }), {
            "Content-Type": "application/json"
        }
    );
    if(!result) return false;
    try {
        result = JSON.parse(result);
    } catch(e) {
        return false;
    }

    if(result.result != "success") {
        return false;
    }

    return result.videoId;
}

export async function getVideoCount() {
    let token = authUtils.getSessionToken();

    let result = await network.makeRequest(
        "POST",
        "/video/count",
        JSON.stringify({
            "token": token
        }), {
            "Content-Type": "application/json"
        }
    );
    if(!result) return false;
    try {
        result = JSON.parse(result);
    } catch(e) {
        return false;
    }

    if(result.result != "success") {
        return false;
    }

    return result.videoCount;
}

export async function getVideoInfo(id) {
    let token = authUtils.getSessionToken();

    let result = await network.makeRequest(
        "POST",
        "/video/info",
        JSON.stringify({
            "token": token,
            "videoId": id
        }), {
            "Content-Type": "application/json"
        }
    );
    if(!result) return null;
    try {
        result = JSON.parse(result);
    } catch(e) {
        return null;
    }

    if(result.result != "success") {
        return null;
    }

    return result.videoInfo;
}

export async function updateVideoView() {
    let targetVideoId = pageUtils.getParameterByName("videoId");
    if(!targetVideoId) {
        pageUtils.showWarningBox("未提供目标视频 ID。");
        return;
    }
    let videoInfo = await getVideoInfo(targetVideoId);
    if(!videoInfo) {
        pageUtils.showWarningBox("无法加载目标视频信息。");
        return;
    }
    let titleElem = document.getElementById("video-title");
    titleElem.innerHTML = videoInfo.videoTitle;

    let contentElem = document.getElementById("current-video");
    contentElem.src = videoInfo.videoUrl;

    let descElem = document.getElementById("video-desc");
    descElem.innerHTML = videoInfo.videoDesc;
}

export async function onCreateVideo() {
    let title = document.getElementById("videoTitle").value;
    let url = document.getElementById("videoUrl").value;
    let desc = document.getElementById("videoDesc").value;
    let result = await createVideo(title, url, desc);
    if(!result) {
        pageUtils.showWarningBox("视频创建失败。");
    } else {
        pageUtils.showWarningBox("视频创建成功: " + result);
    }
}
