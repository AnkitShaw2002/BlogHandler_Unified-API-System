const express = require("express");
const userController = require('../controllers/userController');
const CheckAuth = require('../middlewares/checkAuth');
const uploadChecker=require('../middlewares/Uploadchecker');

const Router = express.Router();

Router.get("/profile", CheckAuth,userController.getProfile);
Router.put("/edit-profile",CheckAuth, uploadChecker.single("profilePicture"), userController.editProfile);

module.exports = Router;
