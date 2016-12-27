const resources = require("./resources.js");
const constants = require("./constants.js");
const randomstring = require("randomstring");

async function createToken(username) {
    let token = randomstring.generate(16);
    let tokenInfo = {
        "token": token,
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
           constants.TOKEN_EXPIRE_SECONDS
        && Date.now() - result.createTime > constants.TOKEN_EXPIRE_SECONDS * 1000
    ) {
        return false;
    }

    return result.username;
}

module.exports.createToken = createToken;
module.exports.checkToken = checkToken;
