const express = require("express");
const userRoute = express.Router();
const { registerUser, loginUser, changePass, getImage, userInfo, getUserInfo, queryController, forget, forgetPassword, getUser, getUsers } = require("../Controller/user.controller");
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({storage});

userRoute.post("/register/User", registerUser);
userRoute.post("/login/User", loginUser);
userRoute.post("/change-password/:id", changePass);
userRoute.get("/userProfileImage/:id",getImage);
userRoute.patch("/userPersonalInfo/:id",upload.single("image"),userInfo);
userRoute.get("/get/userPersonalInfo/:id",getUserInfo)
userRoute.post("/query/send",queryController);
userRoute.post("/forgetpass/:token",forget);
userRoute.post("/forgetpassword/:token",forgetPassword);
userRoute.get("/get/users",getUsers);
module.exports = userRoute;
