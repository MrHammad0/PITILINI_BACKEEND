const mongoose = require("mongoose");
const collaboratorImageSchema = new mongoose.Schema({
    buffer:{type:Buffer}
})
const collaboratorImageModel = mongoose.model("PitikliniCollaboratorImage",collaboratorImageSchema);

module.exports = collaboratorImageModel