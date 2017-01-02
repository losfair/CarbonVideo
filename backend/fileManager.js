const qiniu = require("qiniu");
const fs = require("fs");
const util = require("util");
const uuid = require("uuid");
const resources = require("./resources.js");
const helper = require("carbonvideo-backend-helper");

let qnCfg = fs.readFileSync("config/qiniu.json", "utf-8");
qnCfg = JSON.parse(qnCfg);

qiniu.conf.ACCESS_KEY = qnCfg.accessKey;
qiniu.conf.SECRET_KEY = qnCfg.secretKey;

function generateUploadToken(bucket, key) {
    var putPolicy = new qiniu.rs.PutPolicy(bucket + ":" + key);
    return putPolicy.token();
}

function uploadFile(token, key, localFile) {
    return new Promise((resolve, reject) => {
        if (!helper.validateStorageKey(key)) {
            reject("Invalid key");
            return;
        }
        qiniu.io.putFile(token, key, localFile, null, (err, ret) => {
            if (!err) {
                resolve(ret);
            } else {
                reject(err);
            }
        });
    });
}

function getDownloadUrl(key) {
    if (!helper.validateStorageKey(key)) return;
    let url = "http://" + qnCfg.domain + "/" + key;
    let policy = new qiniu.rs.GetPolicy();
    let downloadUrl = policy.makeRequest(url);
    return downloadUrl;
}

function getFileInfo(key) {
    return new Promise((resolve, reject) => {
        if(!helper.validateStorageKey(key)) {
            reject("Invalid key");
            return;
        }
        let client = new qiniu.rs.Client();
        client.stat(qnCfg.bucket, key, (err, info) => {
            if(!err) {
                resolve(info);
            } else {
                reject(err);
            }
        });
    });
}

async function checkClientUpload(uploadId, username) {
    let findConditions = {
        "uploadId": uploadId
    };
    if(username) findConditions.username = username;

    let uploadInfo = await resources.db.collection("uploads")
        .find(findConditions)
        .toArray();

    if(!uploadInfo || !uploadInfo.length) {
        throw "Upload not found";
    }

    uploadInfo = uploadInfo[0];

    if(uploadInfo.done) {
        throw "Upload already confirmed";
    }

    if(Date.now() - uploadInfo.lastCheckTime < 3000) {
        throw "Try again later";
    }

    await resources.db.collection("uploads").update({
        "_id": uploadInfo._id
    }, {
        "$set": {
            "lastCheckTime": Date.now()
        }
    });

    let fileInfo;
    try {
        fileInfo = await getFileInfo(uploadInfo.uploadKey);
    } catch(e) {
        throw "Unable to get file info";
    }

    await resources.db.collection("uploads").update({
        "_id": uploadInfo._id
    }, {
        "$set": {
            "done": true
        }
    });

    return true;
}

let lastClientUploadAutoRemoveTime = 0;

async function removeOldClientUploadedFiles() {
    let currentTime = Date.now();

    if(currentTime - lastClientUploadAutoRemoveTime < 600000) return;
    lastClientUploadAutoRemoveTime = currentTime;

    await resources.db.collection("uploads").remove({
        "createTime": {
            "$lt": currentTime - 3600000
        }
    });
}

async function requestClientUpload(username, extName) {
    if(!qnCfg.prefix) {
        throw "Prefix not configured";
    }
    if (!username || resources.adminUserList.indexOf(username) < 0) {
        throw "User is not in admin list";
    }
    if(!helper.validateExtName(extName)) {
        throw "Invalid extName";
    }
    let uploadId = uuid.v4();

    let uploadKey = qnCfg.prefix + uploadId + "." + extName;

    let uploadToken = generateUploadToken(qnCfg.bucket, uploadKey);

    // This can be async so no need to await.
    removeOldClientUploadedFiles();

    await resources.db.collection("uploads").insertOne({
        "uploadId": uploadId,
        "uploadKey": uploadKey,
        "extName": extName,
        "uploadToken": uploadToken,
        "username": username,
        "createTime": Date.now(),
        "lastCheckTime": 0,
        "done": false
    });

    return {
        "uploadId": uploadId,
        "uploadKey": uploadKey,
        "uploadToken": uploadToken
    };
}

module.exports.validateKey = helper.validateStorageKey;
module.exports.generateUploadToken = generateUploadToken;
module.exports.uploadFile = uploadFile;
module.exports.getDownloadUrl = getDownloadUrl;
module.exports.requestClientUpload = requestClientUpload;
module.exports.checkClientUpload = checkClientUpload;
