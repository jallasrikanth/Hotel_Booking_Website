const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(() =>{
        console.log("Connectedd to DB");
    })
    .catch((err) =>{
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({}); //to delete existing data in DB in this case the previously entered our sample data
    initData.data = initData.data.map((obj) => ({...obj, owner: "6619180f46b04e80e132ea3d"}));
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
};

initDB();