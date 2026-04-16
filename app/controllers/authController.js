const userModel = require("../models/userModel");
// const generateToken = require("../utils/generateToken");
// const { sendVerificationEmail } = require("../utils/sendEmail");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail  = require('../utils/sendEmail');

class authController {
  async register(req, res) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          status: false,
          message: "Please provide name, email and password",
        });
      }

      const userExists = await userModel.findOne({ email });
      if (userExists) {
        return res.status(400).json({
          status: false,
          message: "User already exists with this email",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationToken = crypto.randomBytes(32).toString('hex');


      const user = await userModel.create({
        name,
        email,
        password: hashedPassword,
        verificationToken,
      });

      await sendEmail(user);

      return res.status(201).json({
        status: true,
        message: "Registration successful! Please check your email to verify your account.",
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          isVerified: user.isVerified,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }


  async verifyAccount(req, res) {
    try {
      const { token } = req.params;

      const user = await userModel.findOne({ verificationToken: token });

      if (!user) {
        return res.status(400).json({
          status: false,
          message: "Invalid or expired verification token",
        });
      }

      user.isVerified = true;
      user.verificationToken = null;
      await user.save();

      return res.status(200).json({
        status: true,
        message: "Email verified successfully! You can now login.",
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }


  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          status: false,
          message: "Please provide email and password",
        });
      }

      const user = await userModel.findOne({ email });

      if (!user) {
        return res.status(400).json({
          status: false,
          message: "Invalid email or password",
        });
      }

      if (!user.isVerified) {
        return res.status(400).json({
          status: false,
          message: "Please verify your email before logging in",
        });
      }

      const isMatch = await bcrypt.compare(password,user.password);
      if (!isMatch) {
        return res.status(400).json({
          status: false,
          message: "Invalid email or password",
        });
      }



      const secretKey = crypto.randomBytes(32).toString("hex");
      user.secretKey = secretKey;
      await user.save();



      const token = jwt.sign(
                {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                process.env.JWT_SECRET_KEY ,
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );


            const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_SECRET, { expiresIn: '7d' });

    // Store refresh token in DB
    user.refreshToken = refreshToken;
    await user.save();

    // Set Refresh Token in httpOnly Cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true, // Set to true in production (HTTPS)
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

            res.cookie('token', token);

      return res.status(200).json({
        status: true,
        message: "Login successful",
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role:user.role,
          profilePicture: user.profilePicture,
          token,
          secretKey
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }


  async logout(req, res) {
        try {
            res.clearCookie('token');
            return res.status(200).json({ status: true, message: 'Logged out successfully' });
        } catch (error) {
            return res.status(500).json({ status: false, message: error.message });
        }
    }


}

module.exports =  new authController();
