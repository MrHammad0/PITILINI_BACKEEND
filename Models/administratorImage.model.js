const mongoose = require("mongoose");
const collaboratorImageSchema = new mongoose.Schema({
    buffer:{type:Buffer}
})
const adminstratorImageModel = mongoose.model("PitikliniAdministratorImage",collaboratorImageSchema);

module.exports = adminstratorImageModel