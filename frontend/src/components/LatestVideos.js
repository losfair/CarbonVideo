import React from "react";
import ReactDOM from "react-dom";

import * as pageUtils from "../pageUtils.js";
import * as authUtils from "../authUtils.js";
import * as api from "../api.js";
import * as stringUtils from "../stringUtils.js";
import * as videoManager from "../videoManager.js";
import * as pageRenderer from "../pageRenderer.js";

async function getLatestVideos(count) {
    let result = await api.request("/video/latest", {
        "count": count
    });
    if(!result || result.result != "success") {
        return null;
    }

    return result.latestVideos;
}

function onUpdateCurrentVideo(id) {
    return () => {
        videoManager.setCurrentVideoId(id);
        pageUtils.loadPageModule("videoView");
    };
}

export class LatestVideos extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "content": "正在获取最新视频"
        };
    }
    async updateContent() {
            let videos = await getLatestVideos(5);
            if(!videos) {
                this.setState({
                    "content": "获取失败。"
                });
                return;
            }
            let items = videos.map((v) => (
                <li key={v.videoId}>
                    <a href="javascript:;" onClick={onUpdateCurrentVideo(v.videoId)}>{v.videoTitle}</a>
                </li>
            ));
            let result = (
                <ul>
                    {items}
                </ul>
            );
            this.setState({
                "content": result
            });
    }
    componentDidMount() {
        this.updateContent();
    }
    render() {
        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title">
                        最新视频
                    </h3>
                </div>
                <div className="panel-body">
                    <div id="latest-videos">
                        {this.state.content}
                    </div>
                </div>
            </div>
        );
    }
}
