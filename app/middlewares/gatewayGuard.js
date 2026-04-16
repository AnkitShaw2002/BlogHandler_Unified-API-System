const jwt = require("jsonwebtoken");
const User = require("../models/userModel");


exports.gatewayGuard = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    const refreshToken = req.cookies.refreshToken;
    const secretKey = req.headers["x-secret-key"];

    // 1. PUBLIC ACCESS
    if (!token && !secretKey) {
      req.user = null;
      return next();
    }

    // 2. CHECK FOR MISSING PIECES
    if (!token && !refreshToken) {
      return res.status(401).json({ msg: "Token required, please login" });
    }

    if (!secretKey) {
      return res.status(401).json({ msg: "Secret Key required" });
    }

    let decoded;

    try {
      
      if (token) {
        decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      } else if (refreshToken) {
        decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
      }
    } catch (verifyErr) {
      return res.status(401).json({ msg: "Invalid or expired token" });
    }

   
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // 5. VALIDATE SECRET KEY
    if (user.secretKey !== secretKey) {
      return res.status(403).json({ msg: "Invalid Secret Key" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      msg: "Unauthorized",
      error: err.message
    });
  }
};
