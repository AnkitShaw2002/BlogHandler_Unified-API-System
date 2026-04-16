const express = require('express');
const categoryController = require('../controllers/categoryController');
const CheckAuth = require('../middlewares/checkAuth');
const uploadChecker = require('../middlewares/Uploadchecker');

const Router = express.Router();

Router.post("/add", CheckAuth,categoryController.addCategory);
Router.get("/list", CheckAuth,categoryController.getCategoriesWithPosts);
Router.get("/single-category/:id", CheckAuth,categoryController.getCategoryById);

module.exports = Router;
