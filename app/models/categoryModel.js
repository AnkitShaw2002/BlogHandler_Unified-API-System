const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, "Category description is required"],
      maxlength: 500,
    },
   
  },
  { timestamps: true }
);


// Use PascalCase for the model name (Convention)
const CategoryModel = mongoose.model("Category", categorySchema);

module.exports = CategoryModel;