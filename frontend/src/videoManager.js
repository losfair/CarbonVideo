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

export async function onCreateVideo() {
    let title = document.getElementById("videoTitle").value;
    let url = document.getElementById("videoUrl").value;
    let desc = document.getElementById("videoDesc").value;
    let result = await createVideo(title, url, desc);
    if(!result) {
        alert("视频创建失败。");
    } else {
        alert("视频创建成功: " + result);
    }
}
