import React from "react";
import ReactDOM from "react-dom";

import * as pageUtils from "../pageUtils.js";
import * as authUtils from "../authUtils.js";
import * as api from "../api.js";
import * as stringUtils from "../stringUtils.js";
import * as videoManager from "../videoManager.js";

import { LatestVideos } from "./LatestVideos.js";
import { VideoComments } from "./VideoComments.js";

async function getVideoInfo(id) {
    let result = await api.request("/video/info", {
        "videoId": id
    });
    if (!result || result.result != "success") {
        return null;
    }

    return result.videoInfo;
}

async function createVideoLike(id) {
    let token = authUtils.getSessionToken();

    let result = await api.request("/video/like/new", {
        "token": token,
        "videoId": id
    });
    if (!result || result.result != "success") {
        return null;
    }

    return result.likeCount;
}

async function getVideoLikeCount(id) {
    let result = await api.request("/video/like/count", {
        "videoId": id
    });
    if (!result || result.result != "success") {
        return null;
    }

    return result.likeCount;
}

function createVideoShareLink(targetVideoId) {
    let result = window.location.href.split("?")[0]
        + "?"
        + "module=videoView&videoId="
        + encodeURIComponent(targetVideoId);
    return result;
}

export class VideoView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "videoTitle": "",
            "videoCreatedBy": "",
            "videoUrl": "",
            "videoLikeCount": "",
            "videoDesc": "",
            "videoCreateTime": ""
        };
    }
    onShowVideoShareLink() {
        pageUtils.showWarningBox("当前视频链接: " + createVideoShareLink(this.props.videoId));
    }
    async onCreateVideoLike() {
        if (!this.props.videoId) return;
        let newLikeCount = await createVideoLike(this.props.videoId);
        if (newLikeCount) this.setState({
            "videoLikeCount": newLikeCount
        });
    }
    async updateVideoView() {
        let targetVideoId = this.props.videoId;
        if (!targetVideoId) {
            pageUtils.showWarningBox("未提供目标视频 ID。");
            return;
        }
        let videoInfo = await getVideoInfo(targetVideoId);
        if (!videoInfo) {
            pageUtils.showWarningBox("无法加载目标视频信息。");
            return;
        }
        this.setState({
            "videoTitle": videoInfo.videoTitle,
            "videoCreatedBy": videoInfo.videoCreatedBy,
            "videoUrl": videoInfo.videoUrl,
            "videoLikeCount": await getVideoLikeCount(targetVideoId),
            "videoDesc": videoInfo.videoDesc,
            "videoCreateTime": new Date(videoInfo.videoCreateTime).toLocaleString()
        });
    }
    componentDidMount() {
        this.updateVideoView();
    }
    render() {
        return (
            <div>
                <div id="video-title">{this.state.videoTitle}</div>
                <video id="current-video" src={this.state.videoUrl} controls></video>
                <div id="video-operations">
                    <i className="fa fa-thumbs-up video-operation-icon" id="video-like-button" onClick={() => this.onCreateVideoLike()} aria-hidden="true"></i>
                    <span id="video-like-count">{this.state.videoLikeCount}</span>
                    <div className="video-operation-placeholder"></div>
                    <i className="fa fa-plus video-operation-icon" aria-hidden="true"></i>
                    <div className="video-operation-placeholder"></div>
                    <i className="fa fa-share-alt video-operation-icon" aria-hidden="true" onClick={() => this.onShowVideoShareLink()}></i>
                </div>
                <div className="jumbotron" id="video-info">
                    <h3>视频信息</h3>
                    <p>
                        <span>创建者: {this.state.videoCreatedBy}</span><br />
                        <span>创建时间: {this.state.videoCreateTime}</span>
                    </p>
                </div>
                <p id="video-desc">{this.state.videoDesc}</p>

                <VideoComments videoId={this.props.videoId} />
                <LatestVideos />
            </div>
        );
    }
}