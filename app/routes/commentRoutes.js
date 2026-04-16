const express = require('express');
const commentController = require('../controllers/commentController');
const CheckAuth = require('../middlewares/checkAuth');
const uploadChecker=require('../middlewares/Uploadchecker');

const Router = express.Router();

Router.post("/add",CheckAuth, commentController.createComment);
Router.get("/list/:postId", CheckAuth,commentController.getPostComments);
Router.put("/update-comment/:id",CheckAuth, commentController.updateComment);
Router.put("/delete/:id",CheckAuth, commentController.deleteComment);
Router.put("/like/:id", CheckAuth, commentController.toggleLike);

module.exports = Router;
