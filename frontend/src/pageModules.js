import * as pageRenderer from "./pageRenderer.js";

const handlers = {
    "portal": pageRenderer.showPortal,
    "admin": pageRenderer.showAdminPanel,
    "videoView": pageRenderer.showVideoView
}

export function getPageModuleHandler(name) {
    if(!name) return;
    return handlers[name];
}
