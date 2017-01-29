const mongodb = require("mongodb").MongoClient;
const fs = require("fs");
const eventStreamSDK = require("event-stream-service-sdk");

let isInitialized = false;
let db;
let adminUserList;
let cfg;

async function init() {
    if(isInitialized) return;

    cfg = JSON.parse(fs.readFileSync("config/general.json", "utf-8"));
    module.exports.cfg = cfg;

    module.exports.eventStreamAPI = new eventStreamSDK.Context(cfg.serviceId, cfg.secretKey);

    db = await mongodb.connect(cfg.mongodbUrl);
    module.exports.db = db;

    adminUserList = JSON.parse(fs.readFileSync("config/adminUserList.json", "utf-8"));
    module.exports.adminUserList = adminUserList;

    isInitialized = true;
}

module.exports.init = init;
module.exports.db = null;
module.exports.adminUserList = null;
