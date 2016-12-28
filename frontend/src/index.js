import "babel-polyfill";
import * as network from "./network.js";
import * as pageUtils from "./pageUtils.js";
import * as authUtils from "./authUtils.js";

async function jumpToSsoLogin() {
    let url = await authUtils.getSsoUrl();
    window.location.replace(url + "identity/user/login?callback=" + encodeURIComponent(window.location.href.split("?")[0]));
}

function doLogout() {
    delete localStorage.sessionToken;
    location.reload();
}

function initEventListeners() {
    pageUtils.bindActionById("logout-button", "click", doLogout);
}

async function initPage() {
    initEventListeners();
    if(pageUtils.getParameterByName("client_token")) {
        let result = await authUtils.doSsoAuthenticate(pageUtils.getParameterByName("client_token"));
        if(!result) {
            alert("无法完成 SSO 认证。");
        }
        localStorage.sessionToken = result;
        window.location.replace(window.location.href.split("?")[0]);
        window.location.reload();
        return;
    }

    if(localStorage.sessionToken) {
        authUtils.setSessionToken(localStorage.sessionToken);
    }

    let result = await authUtils.checkUserLoginStatus();
    if(!result) {
        await jumpToSsoLogin();
        return;
    }

    pageUtils.setElementInnerHtmlById("current-username-navbar", authUtils.getUsername());
}

if(document.body) {
    initPage();
} else {
    window.addEventListener("load", initPage);
}
