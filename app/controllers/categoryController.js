const categoryModel = require("../models/categoryModel");
// const postModel = require("../models/postModel");
const mongoose = require("mongoose");

class categoryController {

  async addCategory(req, res) {
    try {
      console.log("controller");
      
      const { name, description } = req.body;
      const existing = await categoryModel.findOne({ 
            name: { $regex: new RegExp(`^${name}$`, "i") } 
        });
      if (existing) {
        return res.status(400).json({
          status: false,
          message: "Category already exists",
        });
      }

      const category = await categoryModel.create({ name, description });

      return res.status(201).json({
        status: true,
        message: "New Category added successfully",
        New_category_added: category,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  async getCategoriesWithPosts(req, res) {
    try {
      const categories = await categoryModel.aggregate([
        // Join with posts collection
        {
          $lookup: {
            from: "blogs",
            localField: "_id",
            foreignField: "category",
            as: "posts",
          },
        },
        // For each post, look up author details
        {
          $lookup: {
            from: "users",
            localField: "posts.author",
            foreignField: "_id",
            as: "postAuthors",
          },
        },
        // Add computed fields
        {
          $addFields: {
            totalPosts: { $size: "$posts" },
            posts: {
              $map: {
                input: "$posts",
                as: "post",
                in: {
                  _id: "$$post._id",
                  title: "$$post.title",
                  tags: "$$post.tags",
                  status: "$$post.status",
                  likesCount: { $size: "$$post.likes" },
                  createdAt: "$$post.createdAt",
                  author: {
                    $let: {
                      vars: {
                        authorDoc: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: "$postAuthors",
                                as: "a",
                                cond: { $eq: ["$$a._id", "$$post.author"] },
                              },
                            },
                            0,
                          ],
                        },
                      },
                      in: {
                        _id: "$$authorDoc._id",
                        name: "$$authorDoc.name",
                        email: "$$authorDoc.email",
                      },
                    },
                  },
                },
              },
            },
          },
        },
        {
          $project: {
            postAuthors: 0,
          },
        },
        { $sort: { name: 1 } },
      ])

      return res.status(200).json({
        status: true,
        message: "Categories fetched successfully",
        total: categories.length,
        data: categories,
      })
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: error.message,
      })
    }
  }



  async getCategoryById(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
         return res.status(400).json({
          status: false,
          message: "Category id invalid",
        });
      }

      const result = await categoryModel.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(id) } },
        {
          $lookup: {
            from: "blogs",
            localField: "_id",
            foreignField: "category",
            as: "posts",
          },
        },
        {
          $addFields: {
            totalPosts: { $size: "$posts" },
          },
        },
      ]);

      if (!result.length) return res.status(400).json({
          status: false,
          message: "no category to show",
        });

      return res.status(200).json({
        status: true,
        message: "Categories fetched successfully",
        total: result.length,
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }
}

module.exports = new categoryController();
