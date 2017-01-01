import * as pageUtils from "./pageUtils.js";
import * as authUtils from "./authUtils.js";
import * as stringUtils from "./stringUtils.js";
import * as api from "./api.js";

import {LatestVideos} from "./components/LatestVideos.js";
import {VideoComments} from "./components/VideoComments.js";
import React from "react";
import ReactDOM from "react-dom";

let currentVideoId = "";

async function createVideo(title, key, desc) {
    let token = authUtils.getSessionToken();

    let result = await api.request("/video/new", {
        "token": token,
        "videoTitle": title,
        "videoKey": key,
        "videoDesc": desc
    });
    if(!result || result.result != "success") return false;

    return result.videoId;
}

export function setCurrentVideoId(id) {
    currentVideoId = id;
}

export function getCurrentVideoId() {
    return currentVideoId;
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
