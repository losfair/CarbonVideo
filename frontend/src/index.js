import "babel-polyfill";
import * as pageUtils from "./pageUtils.js";
import * as authUtils from "./authUtils.js";
import * as videoManager from "./videoManager.js";
import * as api from "./api.js";
import {getPageModuleUrl} from "./pageModules.js";

import {LatestVideos} from "./components/LatestVideos.js";
import {StatisticsInfo} from "./components/StatisticsInfo.js";
import {VideoView} from "./components/VideoView.js";
import {AdminPanel} from "./components/AdminPanel.js";
import React from "react";
import ReactDOM from "react-dom";

async function jumpToSsoLogin() {
    let url = await authUtils.getSsoUrl();
    window.location.replace(url + "identity/user/login?callback=" + encodeURIComponent(window.location.href.split("?")[0]));
}

async function getSiteTitle() {
    let result = await api.request("/config/site_title");
    if(!result || result.result != "success") return false;

    return result.siteTitle;
}

function doLogout() {
    delete localStorage.sessionToken;
    window.location.reload();
}

function initEventListeners() {
    pageUtils.bindActionById("logout-button", "click", doLogout);
}

async function updatePortalContent() {
    ReactDOM.render((
        <div>
            <StatisticsInfo />
            <LatestVideos />
        </div>
    ), document.getElementById("portal-content-container"));
}

function showAdminPanel() {
    ReactDOM.render((
        <AdminPanel />
    ), document.getElementById("admin-panel-container"));
}

function showVideoView(videoId) {
    if(!videoId) videoId = videoManager.getCurrentVideoId();
    if(!videoId) videoId = pageUtils.getParameterByName("videoId");
    ReactDOM.render((
        <VideoView videoId={videoId} />
    ), document.getElementById("video-view-container"));
}

function initGlobalExports() {
    window.loadPageModule = pageUtils.loadPageModule;
    window.onCreateVideo = videoManager.onCreateVideo;
    window.updatePortalContent = updatePortalContent;
    window.updateVideoView = videoManager.updateVideoView;
    window.onCreateComment = videoManager.onCreateComment;
    window.showWarningBox = pageUtils.showWarningBox;
    window.hideWarningBox = pageUtils.hideWarningBox;
    window.jumpToSsoLogin = jumpToSsoLogin;
    window.showVideoShareLink = videoManager.showVideoShareLink;
    window.setCurrentVideoId = videoManager.setCurrentVideoId;
    window.showVideoView = showVideoView;
    window.showAdminPanel = showAdminPanel;
}

function initUserStyles(isAdmin) {
    let cssElem = document.createElement("link");
    cssElem.rel="stylesheet";
    cssElem.href = "css/user-style.css";
    document.head.appendChild(cssElem);

    if(isAdmin) {
        cssElem = document.createElement("link");
        cssElem.rel="stylesheet";
        cssElem.href = "css/admin-style.css";
        document.head.appendChild(cssElem);
    }
}

async function initPage() {
    initEventListeners();
    initGlobalExports();

    let siteTitle = await getSiteTitle();

    if(siteTitle) {
        document.title = siteTitle;
        document.getElementById("navbar-site-title").innerHTML = siteTitle;
    }

    if(pageUtils.getParameterByName("client_token")) {
        let result = await authUtils.doSsoAuthenticate(pageUtils.getParameterByName("client_token"));
        if(!result) {
            alert("无法完成 SSO 认证。");
        }
        localStorage.sessionToken = result;
        window.location.replace(window.location.href.split("?")[0]);
        return;
    }

    if(localStorage.sessionToken) {
        authUtils.setSessionToken(localStorage.sessionToken);
    }

    let result = await authUtils.checkUserLoginStatus();
    if(result) {
        initUserStyles(authUtils.userIsAdmin());
        pageUtils.setElementInnerHtmlById("current-username-navbar", authUtils.getUsername());
    }

    if(pageUtils.getParameterByName("module")) {
        let targetModuleName = pageUtils.getParameterByName("module");
        if(await pageUtils.loadPageModule(targetModuleName)) {
            return;
        }
    }

    pageUtils.loadPageModule("portal");
}

if(document.body) {
    initPage();
} else {
    window.addEventListener("load", initPage);
}
