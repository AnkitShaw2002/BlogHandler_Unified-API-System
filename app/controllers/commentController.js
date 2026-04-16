const Comment = require("../models/commentModel");
const blogModel = require("../models/blogModel");
const mongoose = require("mongoose");


class commentController{
// 1. Create a Comment
async createComment(req, res)  {
  try {
    const { content, post, parentComment } = req.body;
    
    // Author is automatically linked from the authenticated user (req.user)
    const newComment = new Comment({
      content,
      post,
      author: req.user.id, 
      parentComment: parentComment || null
    });

    await newComment.save();
    res.status(201).json({ message: "Comment created successfully", data: newComment });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 2. Get Comments for a specific Post (Using Aggregation)
async getPostComments (req, res) {
  try {
    const { postId } = req.params;

    const comments = await Comment.aggregate([
      { 
        $match: { post: new mongoose.Types.ObjectId(postId) } 
      },
      // Manual Lookup for Author (Replaces .populate)
      {
        $lookup: {
          from: "users", // the collection name in MongoDB
          localField: "author",
          foreignField: "_id",
          as: "authorDetails"
        }
      },
      // Unwind the array created by lookup
      { $unwind: "$authorDetails" },
      // Project (Format) the output
      {
        $project: {
          content: 1,
          createdAt: 1,
          "authorDetails.email": 1,
          "authorDetails.profilePicture": 1,
          parentComment: 1
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Delete a Comment
async deleteComment  (req, res)  {
  try {
    const { id } = req.params;
    
    // Ensure only the author can delete the comment
    const comment = await Comment.findOneAndDelete({ 
      _id: id, 
      author: req.user.id 
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found or unauthorized" });
    }

    res.status(200).json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Update a Comment
async updateComment (req, res)  {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const updatedComment = await Comment.findOneAndUpdate(
      { _id: id, author: req.user.id },
      { content },
      { new: true, runValidators: true }
    );

    if (!updatedComment) {
      return res.status(404).json({ message: "Comment not found or unauthorized" });
    }

    res.status(200).json(updatedComment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}



async toggleLike(req, res, next) {
  try {
    const { id } = req.params; // Post ID
    const userId = req.user.id; // From CheckAuth middleware

    // 1. Validation
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: false, message: "Invalid Post ID" });
    }

    // 2. Check if post exists
    const post = await blogModel.findById(id);
    if (!post) {
      return res.status(404).json({ status: false, message: "Post not found" });
    }

    // 3. Check if user already liked the post
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      // UNLIKE: Remove userId from array
      await blogModel.findByIdAndUpdate(id, {
        $pull: { likes: userId },
      });
      return res.status(200).json({
        status: true,
        message: "Post unliked successfully",
      });
    } else {
      // LIKE: Add userId to array
      await blogModel.findByIdAndUpdate(id, {
        $addToSet: { likes: userId }, // addToSet prevents duplicates
      });
      return res.status(200).json({
        status: true,
        message: "Post liked successfully",
      });
    }
  } catch (error) {
    next(error);
  }
}





}

module.exports=new commentController();