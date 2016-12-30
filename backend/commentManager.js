const resources = require("./resources.js");
const uuid = require("uuid");

const parentTypeInfos = {
    "video": {
        "collectionName": "videos",
        "parentIdFieldName": "videoId"
    }
};

async function createComment(username, parentType, parentId, content) {
    let parentTypeInfo = parentTypeInfos[parentType];
    if(!parentTypeInfo) {
        return false;
    }

    let commentId = uuid.v4();

    let findConditions = {};
    findConditions[parentTypeInfo.parentIdFieldName] = parentId;

    let result = await resources.db.collection(parentTypeInfo.collectionName)
        .find(findConditions)
        .limit(1)
        .toArray();
    
    if(!result || !result.length) {
        return false;
    }

    await resources.db.collection("comments").insertOne({
        "commentId": commentId,
        "commentContent": content,
        "parentType": parentType,
        "parentId": parentId,
        "commentCreatedBy": username,
        "commentCreateTime": Date.now()
    });

    return commentId;
}

async function getComments(parentId) {
    let result = await resources.db.collection("comments")
        .find({
            "parentId": parentId
        })
        .sort({
            "commentCreateTime": -1
        })
        .toArray();
    
    if(!result || !result.length) return false;

    let ret = [];
    result.forEach((v) => {
        ret.push({
            "commentId": v.commentId,
            "commentContent": v.commentContent,
            "commentCreatedBy": v.commentCreatedBy,
            "commentCreateTime": v.commentCreateTime
        });
    });

    return ret;
}

module.exports.createComment = createComment;
module.exports.getComments = getComments;
