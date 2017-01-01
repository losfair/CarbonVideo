import React from "react";
import ReactDOM from "react-dom";

import * as pageUtils from "../pageUtils.js";
import * as authUtils from "../authUtils.js";
import * as network from "../network.js";
import * as stringUtils from "../stringUtils.js";
import * as videoManager from "../videoManager.js";

async function createVideoComment(videoId, content) {
    let token = authUtils.getSessionToken();

    let result = await network.makeRequest(
        "POST",
        "/comment/new",
        JSON.stringify({
            "token": token,
            "commentContent": content,
            "parentType": "video",
            "parentId": videoId
        }), {
            "Content-Type": "application/json"
        }
    );
    if(!result) return false;
    try {
        result = JSON.parse(result);
    } catch(e) {
        return false;
    }

    if(result.result != "success") {
        return false;
    }

    return result.commentId;
}

async function getVideoComments(id) {
    let token = authUtils.getSessionToken();

    let result = await network.makeRequest(
        "POST",
        "/comment/get",
        JSON.stringify({
            "token": token,
            "parentId": id
        }), {
            "Content-Type": "application/json"
        }
    );
    if(!result) return null;
    try {
        result = JSON.parse(result);
    } catch(e) {
        return null;
    }

    if(result.result != "success") {
        return null;
    }

    return result.comments;
}

export class VideoComments extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "videoComments": ""
        };
    }
    async updateVideoComments() {
        if(!this.props.videoId) return;
        let comments = await getVideoComments(this.props.videoId);
        if(comments) {
            let data = comments.map((v) => (
                <div key={v.commentId} className="video-comment">
                    {new Date(v.commentCreateTime).toLocaleString()}
                    <br />
                    {v.commentCreatedBy}
                    <br /><br />
                    <strong>{v.commentContent}</strong>
                </div>
            ));
            this.setState({
                "videoComments": data
            });
        }
    }
    async onCreateVideoComment() {
        if(!this.props.videoId) return;
        let content = document.getElementById("newCommentContent").value;
        let result = await createVideoComment(this.props.videoId, content);
        if(!result) {
            pageUtils.showWarningBox("评论创建失败。");
            return;
        }
        this.updateVideoComments();
    }
    componentDidMount() {
        this.updateVideoComments();
    }
    render() {
        return (
            <div>
                <form role="form" action="javascript:;">
                    <div className="form-group">
                        <label htmlFor="newCommentContent">
                                        写评论
                                    </label>
                        <textarea className="form-control" id="newCommentContent" rows="10"></textarea>
                    </div>
                    <button className="btn btn-default" onClick={() => this.onCreateVideoComment()}>
                                    发布
                                </button>
                </form><br />
                <div id="video-comments">{this.state.videoComments}</div>
            </div>
        );
    }
}
