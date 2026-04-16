const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    bio: {
      type: String,
      default: ""
    },
    role: {
      type: String,
      enum: ["user", "admin", "author"],
      default: "user",
    },
    profilePicture: {
      url: {
        type: String,
        default: "https://static.vecteezy.com/system/resources/thumbnails/029/271/062/small/avatar-profile-icon-in-flat-style-male-user-profile-illustration-on-isolated-background-man-profile-sign-business-concept-vector.jpg"
      },
      public_id: {
        type: String,
        default: null
      }
    },
    phone: {
      type: String,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: null,
    },
    secretKey: {
      type: String,
      default: null,
    },
  },
  { timestamps: true,
    versionKey: false
   }
);



const userModel = mongoose.model("user", userSchema);
module.exports = userModel;