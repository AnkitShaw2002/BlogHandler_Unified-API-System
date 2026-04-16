const mongoose = require("mongoose");
require("dotenv").config();
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('MongoDB Connected');
  } catch (error) {
    console.log('MongoDB connection failed');
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
