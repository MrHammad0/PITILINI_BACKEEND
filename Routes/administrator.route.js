// const express = require("express");
// const administratorRoute = express.Router();
// const multer = require('multer');
// const { registerAdministrator, getAdministratorImage, AdministratorInfo, getAdministratorInfo, changeAdministratorPass } = require("../Controller/administrator.controller");
// const storage = multer.memoryStorage();
// const upload = multer({storage});

// administratorRoute.post("/register/Administratorr",registerAdministrator);
// administratorRoute.get("/AdministratorProfileImage/:id",getAdministratorImage);
// administratorRoute.patch("/AdministratorPersonalInfo/:id",upload.single("image"),AdministratorInfo);
// administratorRoute.get("/get/AdministratorPersonalInfo/:id",getAdministratorInfo)
// administratorRoute.post("/change/Administrator/password/:id", changeAdministratorPass);
// module.exports= administratorRoute ;


const express = require("express");
const administratorRoute = express.Router();
const multer = require('multer');
const { getAdministratorImage, AdministratorInfo, getAdministratorInfo, changeAdministratorPass } = require("../Controller/administrator.controller");
const storage = multer.memoryStorage();
const upload = multer({storage});

// Remove the registration route since administrator should be manually added
// administratorRoute.post("/register/Administrator", registerAdministrator);

administratorRoute.get("/AdministratorProfileImage/:id", getAdministratorImage);
administratorRoute.patch("/AdministratorPersonalInfo/:id", upload.single("image"), AdministratorInfo);
administratorRoute.get("/get/AdministratorPersonalInfo/:id", getAdministratorInfo);
administratorRoute.post("/change/Administrator/password/:id", changeAdministratorPass);

module.exports = administratorRoute;
