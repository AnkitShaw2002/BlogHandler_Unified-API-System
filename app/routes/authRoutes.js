const express = require("express");
const authController = require('../controllers/authController');
const CheckAuth = require('../middlewares/checkAuth');
const uploadChecker=require('../middlewares/Uploadchecker');
// const { upload } = require('../config/cloudinary');

const Router = express.Router();

Router.post('/register', authController.register);
Router.put('/verify/:token', authController.verifyAccount);
Router.post('/login', authController.login);
Router.get('/logout',authController.logout);


module.exports = Router;
