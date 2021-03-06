const resources = require("./resources.js");
const randomstring = require("randomstring");

async function createToken(userId, username) {
    let token = randomstring.generate(16);
    let tokenInfo = {
        "token": token,
        "userId": userId,
        "username": username,
        "createTime": Date.now()
    };
    await resources.db.collection("tokens").insertOne(tokenInfo);
    return token;
}

async function checkToken(token) {
    let result = await resources.db.collection("tokens").find({
        "token": token
    }).limit(1).toArray();

    if(!result || !result.length) return false;

    result = result[0];
    if(
           resources.cfg.tokenExpireSeconds
        && Date.now() - result.createTime > resources.cfg.tokenExpireSeconds * 1000
    ) {
        return false;
    }

    return result;
}

module.exports.createToken = createToken;
module.exports.checkToken = checkToken;
