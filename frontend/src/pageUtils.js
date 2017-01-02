import * as network from "./network.js";
import * as pageModules from "./pageModules.js";

let pageModuleCache = {};

export function getParameterByName(name, url) {
    if (!url) {
        url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

export function setElementInnerHtmlById(id, html) {
    let elem = document.getElementById(id);
    if(!elem) return;
    elem.innerHTML = html;
}

export function bindActionById(id, event, cb) {
    let elem = document.getElementById(id);
    if(!elem) return;
    elem.addEventListener(event, cb);
}

export function hideElementsByClassName(cn) {
    let allElements = document.getElementsByClassName(cn);
    for(let i = 0; i < allElements.length; i++) {
        let m = allElements[i];
        m.style.display = "none";
    }
}

export function showElementsByClassName(cn, displayStyle) {
    if(!displayStyle) displayStyle = "block";
    let allElements = document.getElementsByClassName(cn);
    for(let i = 0; i < allElements.length; i++) {
        let m = allElements[i];
        m.style.display = displayStyle;
    }
}

export function hideWarningBox() {
    let boxElem = document.getElementById("warning-box");
    if(!boxElem) return;

    let contentElem = document.getElementById("warning-box-content");
    if(!contentElem) return;

    contentElem.innerHTML = "";
    boxElem.style.display = "none";
}

export function showWarningBox(content) {
    let boxElem = document.getElementById("warning-box");
    if(!boxElem) return;

    let contentElem = document.getElementById("warning-box-content");
    if(!contentElem) return;

    contentElem.innerHTML = content;
    boxElem.style.display = "block";
}

export function loadPageModule(moduleName) {
    let target = pageModules.getPageModuleHandler(moduleName);
    if(!target) return;

    target();

    hideWarningBox();

    return true;
}
