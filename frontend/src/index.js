import "babel-polyfill";
import * as network from "./network.js";
import * as pageUtils from "./pageUtils.js";

let sessionToken = "";
let ssoUrl = "";
let currentUsername = "";

async function checkUserLoginStatus() {
    if(!sessionToken) return false;

    let resp;
    try {
        resp = await network.makeRequest(
            "POST",
            "/user/check",
            JSON.stringify({
                "token": sessionToken
            }), {
                "Content-Type": "application/json"
            }
        );
        resp = JSON.parse(resp);
    } catch(e) {
        return false;
    }
    if(resp.isLoggedIn) {
        currentUsername = resp.username;
        return true;
    }
    else return false;
}

async function doSsoAuthenticate(ssoToken) {
    let resp;
    try {
        resp = await network.makeRequest(
            "POST",
            "/user/authenticate",
            JSON.stringify({
                "ssoToken": ssoToken
            }), {
                "Content-Type": "application/json"
            }
        );
        resp = JSON.parse(resp);
    } catch(e) {
        return false;
    }
    if(!resp.result || resp.result != "success") {
        return false;
    }
    localStorage.sessionToken = resp.token;
    return true;
}

async function getSsoUrl() {
    let url = await network.makeRequest(
        "POST",
        "/config/sso_url"
    );
    return url;
}

async function tryLoadSsoUrl() {
    if(ssoUrl) return;
    ssoUrl = await getSsoUrl();
}

async function jumpToSsoLogin() {
    await tryLoadSsoUrl();
    window.location.replace(ssoUrl + "identity/user/login?callback=" + encodeURIComponent(window.location.href.split("?")[0]));
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
        let result = await doSsoAuthenticate(pageUtils.getParameterByName("client_token"));
        if(!result) {
            alert("无法完成 SSO 认证。");
        }
        window.location.replace(window.location.href.split("?")[0]);
        return;
    }

    if(localStorage.sessionToken) {
        sessionToken = localStorage.sessionToken;
    }

    let result = await checkUserLoginStatus();
    if(!result) {
        await jumpToSsoLogin();
        return;
    }

    pageUtils.setElementInnerHtmlById("current-username-navbar", currentUsername);
}

if(document.body) {
    initPage();
} else {
    window.addEventListener("load", initPage);
}
