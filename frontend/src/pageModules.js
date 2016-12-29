const pageModules = {
    "portal": "portal.html",
    "admin": "admin.html",
    "videoView": "videoView.html"
};

export function getPageModuleUrl(name) {
    let url = pageModules[name];
    if(!url) return null;
    return url;
}
