const userModel = require("../models/userModel");
const fs = require("fs");
const path = require("path");
const cloudinary=require('../config/cloudinary');
const uploadToCloudinary=require('../utils/Cloudinary_upload')

class userController {
  async getProfile(req, res) {
    try {
      const user = await userModel.findById(req.user.id).select(
        "-password -verificationToken"
      );

      if (!user) {
        return res.status(404).json({
          status: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        status: true,
        message: "Profile fetched successfully",
        data: user,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  };


  async editProfile(req, res) {
    try {
      const { bio ,phone} = req.body;

      const user = await userModel.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          status: false,
          message: "User not found",
        });
      }

      // If new profile picture uploaded, delete old one
      if (req.file) {
        if (user.profilePicture?.public_id) {
          await cloudinary.uploader.destroy(user.profilePicture.public_id);
          }
           const result = await uploadToCloudinary(req.file.buffer, "user_images");

        user.profilePicture = {
          url: result.secure_url,
          public_id: result.public_id,
        };
      }

      if (bio) user.bio = bio;
      if(phone) user.phone = phone;
      

      await user.save();

      return res.status(200).json({
        status: true,
        message: "Profile updated successfully",
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          bio: user.bio,
          phone: user.phone,
          profilePicture: user.profilePicture,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  };
}

module.exports = new userController();
