const express = require("express");
const { registerCollaborator, convertClientToCollaborator, scheduleConversion, getCollaboratorInfo, collaboratorInfo, changeCollaboratorPass, getCollaboratorImage, getCollaborators } = require("../Controller/collaborator.controller");
const collaboratorRoute = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({storage});

collaboratorRoute.post("/register/Collaborator",registerCollaborator);
collaboratorRoute.get("/client/convert/collaborator/:id",convertClientToCollaborator);
collaboratorRoute.get('/schedule/conversion/:id', scheduleConversion);
collaboratorRoute.get("/collaboratorProfileImage/:id",getCollaboratorImage);
collaboratorRoute.patch("/collaboratorPersonalInfo/:id",upload.single("image"),collaboratorInfo);
collaboratorRoute.get("/get/collaboratorPersonalInfo/:id",getCollaboratorInfo)
collaboratorRoute.post("/change/collaborator/password/:id", changeCollaboratorPass);
collaboratorRoute.get("/get/collaborator", getCollaborators);
module.exports= collaboratorRoute ;