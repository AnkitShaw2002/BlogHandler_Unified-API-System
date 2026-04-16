const express = require('express');
const postController = require('../controllers/blogController');
// const CheckAuth = require('../middlewares/checkAuth');
// const uploadChecker=require('../middlewares/Uploadchecker');
const {gatewayGuard}=require('../middlewares/gatewayGuard');
const Router = express.Router();

Router.all("/blog",gatewayGuard,postController.handleBlog );


module.exports = Router;
