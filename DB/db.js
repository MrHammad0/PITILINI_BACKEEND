const mongoose = require("mongoose");

const connectDb= async ()=>{
    try {
       await mongoose.connect(`${process.env.MONGO_URI}`)
        console.log("MongoDb is connected");
    } catch (error) {
        console.log("Connection Error");
    }
}

module.exports = connectDb