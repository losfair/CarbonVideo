import * as network from "./network.js";

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

export async function loadPageModule(elem, url) {
    let allModules = document.getElementsByClassName("page-module");
    for(let i = 0; i < allModules.length; i++) {
        let m = allModules[i];
        m.style.display = "none";
        m.innerHTML = "";
    }
    if(typeof(elem) == "string") elem = document.getElementById(elem);
    if(!elem) return;

    let pageModuleContent = "";

    let contentCache = pageModuleCache[url];
    if(contentCache) pageModuleContent = contentCache;
    else {
        pageModuleContent = await network.makeRequest(
            "GET",
            url
        );
        pageModuleCache[url] = pageModuleContent;
    }
    elem.innerHTML = pageModuleContent;

    let scripts = elem.getElementsByTagName("script");
    for(let i = 0; i < scripts.length; i++) {
        let scriptElem = document.createElement("script");
        if(scripts[i].src) scriptElem.src = scripts[i].src;
        else scriptElem.innerHTML = scripts[i].innerHTML;
        document.body.appendChild(scriptElem);
        document.body.removeChild(scriptElem);
    }

    elem.style.display = "block";
}
