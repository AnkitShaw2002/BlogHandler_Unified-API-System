const multer = require("multer");



// allowed image mime types
const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
  "image/webp": "webp",
};
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (FILE_TYPE_MAP[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const uploadChecker = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter,
});

module.exports = uploadChecker;