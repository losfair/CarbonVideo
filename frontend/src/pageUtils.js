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