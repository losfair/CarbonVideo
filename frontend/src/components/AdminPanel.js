import React from "react";
import ReactDOM from "react-dom";

import * as pageUtils from "../pageUtils.js";
import * as authUtils from "../authUtils.js";
import * as stringUtils from "../stringUtils.js";
import * as videoManager from "../videoManager.js";
import * as api from "../api.js";

async function createVideo(title, key, desc) {
    let token = authUtils.getSessionToken();

    let result = await api.request("/video/new", {
        "token": token,
        "videoTitle": title,
        "videoKey": key,
        "videoDesc": desc
    });
    if(!result || result.result != "success") return false;

    return result.videoId;
}

async function requestVideoUpload() {
    let token = authUtils.getSessionToken();

    let result = await api.request("/video/upload/request", {
        "token": token,
    });
    if(!result || result.result != "success") return false;

    return {
        "uploadId": result.uploadId,
        "uploadKey": result.uploadKey,
        "uploadToken": result.uploadToken
    };
}

export class AdminPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "uploadStatus": "未完成",
            "uploadButtonDisabled": false
        };
    }
    async onCreateVideo() {
        let title = document.getElementById("videoTitle").value;
        let key = document.getElementById("videoKey").value;
        let desc = document.getElementById("videoDesc").value;
        let result = await createVideo(title, key, desc);
        if(!result) {
            pageUtils.showWarningBox("视频创建失败。");
        } else {
            pageUtils.showWarningBox("视频创建成功: " + result);
        }
    }
    async updateUploadStatus() {
        let token = authUtils.getSessionToken();

        let result = await api.request("/video/upload/check", {
            "token": token,
            "uploadId": this.uploadId
        });
        if(result && result.result == "success") {
            clearInterval(this.uploadStatusUpdaterIntervalId);
            delete this.uploadStatusUpdaterIntervalId;
            this.setState({
                "uploadStatus": "已完成"
            });
            pageUtils.hideWarningBox();
        }
    }
    async onRequestVideoUpload() {
        let uploadInfo = await requestVideoUpload();
        if(!uploadInfo) {
            pageUtils.showWarningBox("上传请求失败。");
            return;
        }
        document.getElementById("videoKey").value = uploadInfo.uploadKey;
        pageUtils.showWarningBox("上传 Token: " + uploadInfo.uploadToken);
        this.uploadId = uploadInfo.uploadId;
        this.uploadStatusUpdaterIntervalId = setInterval(() => this.updateUploadStatus(), 5000);
        this.setState({
            "uploadButtonDisabled": true
        });
    }
    componentDidMount() {
    }
    componentWillUnmount() {
        if(this.uploadStatusUpdaterIntervalId) {
            clearInterval(this.uploadStatusUpdaterIntervalId);
            delete this.uploadStatusUpdaterIntervalId;
        }
    }
    render() {
        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title">
                        发布新视频
                    </h3>
                </div>
                <div className="panel-body">
                    <form role="form" action="javascript:;">
                        <div className="form-group">
                            <label for="videoTitle">
                                视频标题
                                </label>
                            <input type="text" className="form-control" id="videoTitle" />
                        </div>
                        <button className="btn btn-default" disabled={this.state.uploadButtonDisabled} onClick={() => this.onRequestVideoUpload()}>
                            上传视频
                            </button>
                            <span>{this.state.uploadStatus}</span>
                        <div className="form-group">
                            <label for="videoKey">
                                视频 Key
                                </label>
                            <input type="text" disabled className="form-control" id="videoKey" />
                        </div>
                        <div className="form-group">
                            <label for="videoDesc">
                                视频说明
                                </label>
                            <textarea className="form-control" id="videoDesc" rows="10"></textarea>
                        </div>
                        <button className="btn btn-default" onClick={() => this.onCreateVideo()}>
                            发布
                            </button>
                    </form>
                </div>
            </div>
        );
    }
}
