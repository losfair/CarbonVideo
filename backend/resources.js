const mongodb = require("mongodb").MongoClient;
const fs = require("fs");

let isInitialized = false;
let db;
let adminUserList;

async function init() {
    if(isInitialized) return;

    db = await mongodb.connect("mongodb://127.0.0.1:27017/HydroCloud_Xiaoti");
    module.exports.db = db;

    adminUserList = JSON.parse(fs.readFileSync("config/adminUserList.json", "utf-8"));
    module.exports.adminUserList = adminUserList;
    
    isInitialized = true;
}

module.exports.init = init;
module.exports.db = null;
module.exports.adminUserList = null;
