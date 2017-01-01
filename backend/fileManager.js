const qiniu = require("qiniu");
const fs = require("fs");
const util = require("util");
const uuid = require("uuid");
const resources = require("./resources.js");

let qnCfg = fs.readFileSync("config/qiniu.json", "utf-8");
qnCfg = JSON.parse(qnCfg);

qiniu.conf.ACCESS_KEY = qnCfg.accessKey;
qiniu.conf.SECRET_KEY = qnCfg.secretKey;

function validateKey(key) {
    if (
        !key
        || !util.isString(key)
        || key.length == 0
        || key.length > 128
    ) {
        return false;
    }

    for (let i = 0; i < key.length; i++) {
        let c = key[i];
        if (
            !(c >= '0' && c <= '9')
            && !(c >= 'a' && c <= 'z')
            && !(c >= 'A' && c <= 'Z')
            && c != '/'
            && c != '.'
            && c != '-'
            && c != '_'
        ) {
            return false;
        }
    }

    return true;
}

function validateExtName(extName) {
    if (
        !extName
        || !util.isString(extName)
        || extName.length == 0
        || extName.length > 16
    ) {
        return false;
    }
    
    for(let i = 0; i < extName.length; i++) {
        let c = extName[i];
        if (
            !(c >= '0' && c <= '9')
            && !(c >= 'a' && c <= 'z')
            && !(c >= 'A' && c <= 'Z')
        ) {
            return false;
        }
    }

    return true;
}

function generateUploadToken(bucket, key) {
    var putPolicy = new qiniu.rs.PutPolicy(bucket + ":" + key);
    return putPolicy.token();
}

function uploadFile(token, key, localFile) {
    return new Promise((resolve, reject) => {
        if (!validateKey(key)) {
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
    if (!validateKey(key)) return;
    let url = "http://" + qnCfg.domain + "/" + key;
    let policy = new qiniu.rs.GetPolicy();
    let downloadUrl = policy.makeRequest(url);
    return downloadUrl;
}

async function requestClientUpload(username, extName) {
    if(!qnCfg.prefix) {
        throw "Prefix not configured";
    }
    if (!username || resources.adminUserList.indexOf(username) < 0) {
        throw "User is not in admin list";
    }
    if(!validateExtName(extName)) {
        throw "Invalid extName";
    }
    let uploadId = uuid.v4();

    let uploadKey = qnCfg.prefix + uploadId + "." + extName;

    let uploadToken = generateUploadToken(qnCfg.bucket, uploadKey);

    /*await resources.db.collection("uploads").insertOne({
        "uploadId": uploadId,
        "extName": extName,
        "uploadToken": uploadToken,
        "username": username,
        "createTime": Date.now(),
        "done": false
    });*/

    return {
        "uploadKey": uploadKey,
        "uploadToken": uploadToken
    };
}

module.exports.validateKey = validateKey;
module.exports.generateUploadToken = generateUploadToken;
module.exports.uploadFile = uploadFile;
module.exports.getDownloadUrl = getDownloadUrl;
module.exports.requestClientUpload = requestClientUpload;
