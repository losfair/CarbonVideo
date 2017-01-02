import React from "react";
import ReactDOM from "react-dom";

import * as pageUtils from "./pageUtils.js";
import * as videoManager from "./videoManager.js";

import {LatestVideos} from "./components/LatestVideos.js";
import {StatisticsInfo} from "./components/StatisticsInfo.js";
import {VideoView} from "./components/VideoView.js";
import {AdminPanel} from "./components/AdminPanel.js";

export function showPortal() {
    ReactDOM.render((
        <div>
            <StatisticsInfo />
            <LatestVideos />
        </div>
    ), document.getElementById("current-module"));
}

export function showAdminPanel() {
    ReactDOM.render((
        <AdminPanel />
    ), document.getElementById("current-module"));
}

export function showVideoView(videoId) {
    if(!videoId) videoId = videoManager.getCurrentVideoId();
    if(!videoId) videoId = pageUtils.getParameterByName("videoId");
    ReactDOM.render((
        <VideoView videoId={videoId} />
    ), document.getElementById("current-module"));
}
