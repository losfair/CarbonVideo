import * as network from "./network.js";

let sessionToken = "";
let ssoUrl = "";
let username = "";

export async function checkUserLoginStatus() {
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
        username = resp.username;
        return true;
    }
    else return false;
}

export async function doSsoAuthenticate(ssoToken) {
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
    return resp.token;
}

export async function getSsoUrl() {
    if(ssoUrl) return ssoUrl;
    
    let url = await network.makeRequest(
        "POST",
        "/config/sso_url"
    );
    ssoUrl = url;
    return url;
}

export function getUsername() {
    return username;
}

export function getSessionToken() {
    return sessionToken;
}

export function setSessionToken(newToken) {
    sessionToken = newToken;
}
