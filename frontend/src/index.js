import "babel-polyfill";
import * as network from "./network.js";
import * as pageUtils from "./pageUtils.js";
import * as authUtils from "./authUtils.js";
import * as videoManager from "./videoManager.js";
import {getPageModuleUrl} from "./pageModules.js";

async function jumpToSsoLogin() {
    let url = await authUtils.getSsoUrl();
    window.location.replace(url + "identity/user/login?callback=" + encodeURIComponent(window.location.href.split("?")[0]));
}

function doLogout() {
    delete localStorage.sessionToken;
    window.location.reload();
}

function initEventListeners() {
    pageUtils.bindActionById("logout-button", "click", doLogout);
}

async function updatePortalContent() {
    pageUtils.setElementInnerHtmlById("video-count", await videoManager.getVideoCount());
}

function initGlobalExports() {
    window.loadPageModule = pageUtils.loadPageModule;
    window.onCreateVideo = videoManager.onCreateVideo;
    window.updatePortalContent = updatePortalContent;
    window.updateVideoView = videoManager.updateVideoView;
    window.showWarningBox = pageUtils.showWarningBox;
    window.hideWarningBox = pageUtils.hideWarningBox;
    window.jumpToSsoLogin = jumpToSsoLogin;
    window.showVideoShareLink = videoManager.showVideoShareLink;
}

async function initPage() {
    initEventListeners();
    initGlobalExports();

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
        pageUtils.setElementInnerHtmlById("current-username-navbar", authUtils.getUsername());
        pageUtils.hideElementsByClassName("dropdown-menu-not-logged-in");
        pageUtils.showElementsByClassName("dropdown-menu-logged-in");
    }

    if(pageUtils.getParameterByName("module")) {
        let targetModuleUrl = getPageModuleUrl(pageUtils.getParameterByName("module"));
        if(targetModuleUrl) {
            pageUtils.loadPageModule(null, targetModuleUrl);
            return;
        }
    }

    pageUtils.loadPageModule("portal-page", "portal.html");
}

if(document.body) {
    initPage();
} else {
    window.addEventListener("load", initPage);
}
