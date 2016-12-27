const mongodb = require("mongodb").MongoClient;

let isInitialized = false;
let db;

async function init() {
    if(isInitialized) return;
    db = await mongodb.connect("mongodb://127.0.0.1:27017/HydroCloud_Xiaoti");
    module.exports.db = db;
    isInitialized = true;
}

module.exports.init = init;
module.exports.db = null;
