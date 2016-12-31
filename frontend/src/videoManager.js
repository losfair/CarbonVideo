import * as pageUtils from "./pageUtils.js";
import * as authUtils from "./authUtils.js";
import * as network from "./network.js";
import * as stringUtils from "./stringUtils.js";

let currentVideoId = "";

async function createVideo(title, key, desc) {
    let token = authUtils.getSessionToken();

    let result = await network.makeRequest(
        "POST",
        "/video/new",
        JSON.stringify({
            "token": token,
            "videoTitle": title,
            "videoKey": key,
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

export async function getLatestVideos(count) {
    let token = authUtils.getSessionToken();

    let result = await network.makeRequest(
        "POST",
        "/video/latest",
        JSON.stringify({
            "token": token,
            "count": count
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

    return result.latestVideos;
}

async function createVideoComment(content) {
    let token = authUtils.getSessionToken();

    let result = await network.makeRequest(
        "POST",
        "/comment/new",
        JSON.stringify({
            "token": token,
            "commentContent": content,
            "parentType": "video",
            "parentId": currentVideoId
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

    return result.commentId;
}

async function getVideoComments(id) {
    let token = authUtils.getSessionToken();

    let result = await network.makeRequest(
        "POST",
        "/comment/get",
        JSON.stringify({
            "token": token,
            "parentId": id
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

    return result.comments;
}

export function setCurrentVideoId(id) {
    currentVideoId = id;
}

export async function showLatestVideos() {
    let videos = await getLatestVideos(5);
    if(!videos) {
        pageUtils.showWarningBox("无法获取最新视频。");
        return "";
    }
    let result = "<ul>";
    videos.forEach((v) => {
        result += "<li><a href=\"javascript:;\" onclick=\"setCurrentVideoId('"
            + v.videoId
            + "');loadPageModule('videoView')\">"
            + v.videoTitle
            + "</a></li>";
    });
    result += "</ul>";
    return result;
}

function appendComment(info) {
    let parentElem = document.getElementById("video-comments");
    if(!parentElem) return;

    let newElem = document.createElement("div");
    newElem.className = "video-comment";
    newElem.innerHTML = new Date(info.commentCreateTime).toLocaleString()
        + "<br>用户: "
        + stringUtils.escapeStringForHtml(info.commentCreatedBy)
        + "<br><br><strong>"
        + stringUtils.escapeStringForHtml(info.commentContent)
        + "</strong>";
    parentElem.appendChild(newElem);
}

function clearComments() {
    let parentElem = document.getElementById("video-comments");
    if(!parentElem) return;
    
    parentElem.innerHTML = "";
}

export async function updateVideoComments() {
    clearComments();

    let comments = await getVideoComments(currentVideoId);
    if(comments) {
        comments.forEach((v) => {
            appendComment(v);
        });
    }
}

export async function updateVideoView(targetVideoId) {
    if(!targetVideoId) targetVideoId = pageUtils.getParameterByName("videoId");
    if(!targetVideoId) targetVideoId = currentVideoId;
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
    titleElem.innerHTML = stringUtils.escapeStringForHtml(videoInfo.videoTitle);

    let createdByElem = document.getElementById("video-created-by");
    createdByElem.innerHTML = stringUtils.escapeStringForHtml(videoInfo.videoCreatedBy);

    let contentElem = document.getElementById("current-video");
    contentElem.src = videoInfo.videoUrl;

    let descElem = document.getElementById("video-desc");
    descElem.innerHTML = stringUtils.escapeStringForHtml(videoInfo.videoDesc);

    currentVideoId = targetVideoId;

    updateVideoComments();
}

export function createVideoShareLink(targetVideoId) {
    if(!targetVideoId) targetVideoId = currentVideoId;

    let result = window.location.href.split("?")[0]
        + "?"
        + "module=videoView&videoId="
        + encodeURIComponent(targetVideoId);
    return result;
}

export function showVideoShareLink() {
    pageUtils.showWarningBox("当前视频链接: " + createVideoShareLink());
}

export async function onCreateVideo() {
    let title = document.getElementById("videoTitle").value;
    let key = document.getElementById("videoKey").value;
    let desc = document.getElementById("videoDesc").value;
    let result = await createVideo(title, key, desc);
    if(!result) {
        pageUtils.showWarningBox("视频创建失败。");
    } else {
        pageUtils.showWarningBox("视频创建成功: " + result);
    }
}

export async function onCreateComment() {
    let content = document.getElementById("newCommentContent").value;
    let result = await createVideoComment(content);
    if(!result) {
        showWarningBox("评论创建失败。");
        return;
    }
    updateVideoComments();
}
