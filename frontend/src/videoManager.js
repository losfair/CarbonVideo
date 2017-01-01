import * as pageUtils from "./pageUtils.js";
import * as authUtils from "./authUtils.js";
import * as stringUtils from "./stringUtils.js";
import * as api from "./api.js";

import {LatestVideos} from "./components/LatestVideos.js";
import {VideoComments} from "./components/VideoComments.js";
import React from "react";
import ReactDOM from "react-dom";

let currentVideoId = "";

export function setCurrentVideoId(id) {
    currentVideoId = id;
}

export function getCurrentVideoId() {
    return currentVideoId;
}
