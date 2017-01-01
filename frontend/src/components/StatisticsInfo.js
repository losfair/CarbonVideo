import React from "react";
import ReactDOM from "react-dom";

import * as pageUtils from "../pageUtils.js";
import * as authUtils from "../authUtils.js";
import * as api from "../api.js";
import * as stringUtils from "../stringUtils.js";
import * as videoManager from "../videoManager.js";

async function getVideoCount() {
    let result = await api.request("/video/count");
    if(!result || result.result != "success") {
        return false;
    }

    return result.videoCount;
}

async function getCommentCount() {
    let result = await api.request("/comment/count");
    if(!result || result.result != "success") {
        return null;
    }

    return result.commentCount;
}

export class StatisticsInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "videoCount": "?",
            "commentCount": "?"
        };
    }
    async updateContent() {
        this.setState({
            "videoCount": await getVideoCount(),
            "commentCount": await getCommentCount()
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
                        统计
                    </h3>
                </div>
                <div className="panel-body">
                    <p>
                        目前已有 {this.state.videoCount} 个视频， {this.state.commentCount} 条评论。
                    </p>
                </div>
            </div>
        );
    }
}
