const mongoose = require("mongoose");
const imageSchema = new mongoose.Schema({
    buffer:{type:Buffer}
})
const imageModel = mongoose.model("PitikliniUserImage",imageSchema);

module.exports = imageModel