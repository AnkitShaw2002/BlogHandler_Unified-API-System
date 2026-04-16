const blogModel = require("../models/blogModel");
const categoryModel = require('../models/categoryModel')
const userModel = require("../models/userModel");
const commentModel = require('../models/commentModel');
const mongoose = require("mongoose");


class blogController {
  async handleBlog(req, res) {

    const user = req.user;
    const method = req.method;
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // ========================
    // 🌍 PUBLIC ACCESS
    // ========================
    if (user) {
      const blogs = await blogModel.aggregate([
          { $match: { status: "published" } },
          {
            $lookup: {
              from: "categories",
              localField: "category",
              foreignField: "_id",
              as: "category"
            }
          },
          { $unwind: "$category" },
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: parseInt(limit) }
        ]);
      return res.status(200).json({
        status: true,
        total: blogs.length,
        data: blogs
      });
    }

    // ========================
    //  BLOCK NORMAL USER
    // ========================
    if (user.role === "user" && method === "POST") {
      return res.status(403).json({
        status: false,
        message: "You cannot access this action",
      });
    }

    if (user.role == "admin") {
      // GET → All blogs
      if (method === "GET") {
        const blogs = await blogModel.aggregate([
  // 1. Join Category data
  {
    $lookup: {
      from: "categories",
      localField: "category",
      foreignField: "_id",
      as: "categoryData"
    }
  },
  { $unwind: "$categoryData" },

  // 2. Join Author data
  {
    $lookup: {
      from: "users",
      localField: "author",
      foreignField: "_id",
      as: "authorData"
    }
  },
  { $unwind: "$authorData" },

  // 3. Optimized Sort (Apply before skip/limit for consistency)
  { $sort: { createdAt: -1 } },

  // 4. Pagination
  { $skip: skip },
  { $limit: parseInt(limit) },

  // 5. Final Optimized Projection (Inclusion only)
  {
    $project: {
      _id: 1,
      title: 1,
      content: 1,
      status: 1,
      createdAt: 1,
      tags: 1,
      coverImage: 1,
      // Select only specific category fields
      category: "$categoryData.name", 
      // Select only specific author fields (Avoids password/tokens naturally)
      author: {
        _id: "$authorData._id",
        name: "$authorData.name",
        email: "$authorData.email",
        profilePicture: "$authorData.profilePicture"
      }
    }
  }
]);
        return res.status(200).json({
          status: true,
          message: "get all blog",
          data: blogs,
        });
      }


      if (method === "PUT") {
        
        const blog = await blogModel.findByIdAndUpdate(req.body.blogId, {status:"published"});
        return res.json({
          status: true,
          message: "Approve success by admin",
          Approved_blog:blog});
      }

      // DELETE → Delete any blog
      if (method === "DELETE") {
        await Blog.findByIdAndDelete(req.body.blogId);
        return res.json({ msg: "Deleted by admin" });
      }
    }

    //author access
    if (user.role == "author") {
      if (method === "GET") {

        const authorObjectId = new mongoose.Types.ObjectId(req.user.id);
        // const { page = 1, limit = 10, status } = req.query;
        // const skip = (parseInt(page) - 1) * parseInt(limit);

        const matchStage = {};
        if (status) matchStage.status = status;

        const finalMatch = {
          ...matchStage,
          author: authorObjectId
        };


        const blogs = await blogModel.aggregate([
          { $match: finalMatch },


          {
            $lookup: {
              from: "categories",
              localField: "category",
              foreignField: "_id",
              as: "categoryDetails"
            }
          },
          { $unwind: "$categoryDetails" },


          {
            $lookup: {
              from: "users",
              localField: "author",
              foreignField: "_id",
              as: "authorDetails"
            }
          },
          { $unwind: "$authorDetails" },

          // Group by Category
          {
            $group: {
              _id: "$categoryDetails._id",
              categoryName: { $first: "$categoryDetails.name" },
              authorName: { $first: "$authorDetails.name" },
              authorEmail: { $first: "$authorDetails.email" },
              blogs: {
                $push: {
                  _id: "$_id",
                  title: "$title",
                  content: "$content",
                  status: "$status",
                  createdAt: "$createdAt",
                  coverImage: "$coverImage",
                  likesCount: { $size: { $ifNull: ["$likes", []] } }
                }
              },
              totalCategoryLikes: { $sum: { $size: { $ifNull: ["$likes", []] } } },
              blogCount: { $sum: 1 }
            }
          },


          {
            $project: {
              _id: 1,
              authorName: 1,
              authorEmail: 1,
              categoryName: 1,
              blogCount: 1,
              blogs: 1
            }
          },

          // Sort and Paginate
          { $sort: { totalCategoryLikes: -1, _id: 1 } },
          { $skip: skip },
          { $limit: parseInt(limit) }
        ]);

        // Total count for pagination
        const totalResult = await blogModel.aggregate([
          { $match: matchStage },
          { $count: "total" },
        ]);
        const total = totalResult[0]?.total || 0;

        return res.status(200).json({
          status: true,
          message: "Posts retrieved successfully.",
          blogs,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit))
          },
        });
      }

      if (method === "PUT") {
  const { blogId, title, content, tags, coverImage, category } = req.body;

  
  if (!blogId) {
    return res.status(400).json({ status: false, message: "Blog ID is required" });
  }

  
  const updatedBlog = await blogModel.findOneAndUpdate(
    { _id: blogId, author: user.id }, 
    { 
      $set: { 
        title, 
        content, 
        tags, 
        coverImage, 
        category,
        status: "draft" // Optional: Revert to draft if edited, requiring re-approval
      } 
    },
    { returnDocument: 'after', runValidators: true } // Returns the updated doc & runs Schema checks
  );

  // 3. Handle cases where blog doesn't exist or doesn't belong to the user
  if (!updatedBlog) {
    return res.status(403).json({ 
      status: false, 
      message: "Update failed: Blog not found or you are not authorized" 
    });
  }

  return res.status(200).json({ 
    status: true, 
    message: "Blog updated successfully", 
    data: updatedBlog 
  });
}

      if (method === "DELETE") {
        const result = await blogModel.findOneAndDelete({ _id: req.body.blogId, author: user.id });
        if (!result) return res.status(403).json({ message: "Unauthorized delete" });
        return res.json({ status: true, message: "Own blog deleted" });
      }
    }


    if (method === "POST" && (user.role === "admin" || user.role === "author")) {
     
        const { title, content, category, tags, status } = req.body;

        // Validate category exists
        if (!mongoose.Types.ObjectId.isValid(category)) {
          return res.status(400).json({
            status: false,
            message: " invalid Category id",
          });
        }
        const categoryDoc = await categoryModel.findById(category);
        if (!categoryDoc) return res.status(404).json({
          status: false,
          message: "Category not exists",
        });

        const blog = await blogModel.create({
          title,
          content,
          category,
          tags: tags || [],
          status: status || "draft",
          author: req.user.id, // Auto-linked from authenticated user
        });

        // Return enriched post via aggregation
        const result = await blogModel.aggregate([
          { $match: { _id: blog._id } },
          {
            $lookup: {
              from: "users",
              localField: "author",
              foreignField: "_id",
              as: "authorInfo",
            },
          },
          {
            $lookup: {
              from: "categories",
              localField: "category",
              foreignField: "_id",
              as: "categoryInfo",
            },
          },
          {
            $lookup: {
              from: "comments",
              localField: "_id",
              foreignField: "blog",
              as: "comments",
            },
          },
          {
            $addFields: {
              author: { $arrayElemAt: ["$authorInfo", 0] },
              category: { $arrayElemAt: ["$categoryInfo", 0] },
              likesCount: { $size: "$likes" },
              commentsCount: { $size: "$comments" },
            },
          },
          {
            $project: {
              authorInfo: 0,
              categoryInfo: 0,
              comments: 0,
              likes: 0,
              "author.password": 0,
              "author.verificationToken": 0,
              "author.verificationTokenExpiry": 0,
            },
          },
        ]);


        return res.status(201).json({
          status: true,
          message: "data create successfully",
          data: result,
        });
      }
    }
  }




module.exports = new blogController();
