import "babel-polyfill";
import * as pageUtils from "./pageUtils.js";
import * as authUtils from "./authUtils.js";
import * as videoManager from "./videoManager.js";
import * as api from "./api.js";
import * as pageRenderer from "./pageRenderer.js";
import * as pageModules from "./pageModules.js";

async function jumpToSsoLogin() {
    let url = await authUtils.getSsoUrl();

    let serviceId = await api.request("/config/service_id");
    serviceId = serviceId.serviceId;

    window.location.replace(url + "web/?callback=" + encodeURIComponent(window.location.href.split("?")[0]) + "&serviceId=" + encodeURIComponent(serviceId) + "#auth");
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

function initGlobalExports() {
    window.loadPageModule = pageUtils.loadPageModule;
    window.onCreateVideo = videoManager.onCreateVideo;
    window.updatePortalContent = () => pageUtils.loadPageModule("portal");
    window.showWarningBox = pageUtils.showWarningBox;
    window.hideWarningBox = pageUtils.hideWarningBox;
    window.jumpToSsoLogin = jumpToSsoLogin;
    window.showVideoShareLink = videoManager.showVideoShareLink;
    window.setCurrentVideoId = videoManager.setCurrentVideoId;
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

    getSiteTitle().then(siteTitle => {
        if(siteTitle) {
            document.title = siteTitle;
            document.getElementById("navbar-site-title").innerHTML = siteTitle;
        }
    }).catch(e => console.log(e));

    if(pageUtils.getParameterByName("client_token")) {
        let result;
        try {
            result = await authUtils.doSsoAuthenticate(pageUtils.getParameterByName("client_token"));
        } catch(e) {
            e = e.toString();
            if(e == "Not authorized") {
                let serviceId = await api.request("/config/service_id");
                serviceId = serviceId.serviceId;
                window.history.pushState({}, null, window.location.href.split("?")[0]);
                pageUtils.showWarningBox("请在 <a href=\"https://hyperidentity.ifxor.com/web/\">HyperIdentity 个人中心</a>中授权本服务。(服务 ID: " + serviceId + " )")
            } else {
                pageUtils.showWarningBox("SSO 认证失败: " + e);
            }
            return;
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
        if(pageUtils.loadPageModule(targetModuleName)) return;
    }

    pageUtils.loadPageModule("portal");
}

if(document.body) {
    initPage();
} else {
    window.addEventListener("load", initPage);
}
