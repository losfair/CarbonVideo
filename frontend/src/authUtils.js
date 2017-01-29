import * as api from "./api.js";

let sessionToken = "";
let ssoUrl = "";
let username = "";
let isAdmin = false;

export async function checkUserLoginStatus() {
    if(!sessionToken) return false;

    let resp = await api.request("/user/check", {
        "token": sessionToken
    });
    if(!resp) return false;

    if(resp.isLoggedIn) {
        username = resp.username;
        isAdmin = resp.isAdmin;
        return true;
    }
    else return false;
}

export async function doSsoAuthenticate(ssoToken) {
    let resp = await api.request("/user/authenticate", {
        "ssoToken": ssoToken
    });

    if(!resp || !resp.result || resp.result != "success") {
        throw resp.msg;
    }
    
    return resp.token;
}

export async function getSsoUrl() {
    if(ssoUrl) return ssoUrl;
    
    let url = await api.request("/config/sso_url");

    ssoUrl = url.ssoUrl;
    return ssoUrl;
}

export function getUsername() {
    return username;
}

export function userIsAdmin() {
    return isAdmin;
}

export function getSessionToken() {
    return sessionToken;
}

export function setSessionToken(newToken) {
    sessionToken = newToken;
}
