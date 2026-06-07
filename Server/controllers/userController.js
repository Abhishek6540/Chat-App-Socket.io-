import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import SendMail from "../config/nodeMailService.js";
import { registrationBody } from "../templates/userTemplate.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, avatar, isOnline, lastSeen } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({
        success: false,
        error: "Name, Email, Password are required!",
      });
    }

    const existUser = await User.findOne({ email });

    if (existUser) {
      return res.status(400).json({
        success: false,
        error: "Email already exists",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashPassword,
      avatar,
      isOnline,
      lastSeen,
    });

    const mailResponse = await SendMail(
      user.email,
      "Registration Successful",
      registrationBody(user.name),
    );

    if (!mailResponse.success) {
      return res.status(500).json({
        success: false,
        message: "User created but email failed",
        error: mailResponse.message,
      });
    }
    return res.status(201).json({
      success: true,
      message: "Register successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!email) {
      return res.status(400).json({
        success: false,
        error: "User not found",
      });
    }

    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
      return res.status(400).json({
        success: false,
        error: "Password incorrect",
      });
    }

    const access_token = generateAccessToken(user);
    const refresh_token = generateRefreshToken(user);

    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(201).json({
      success: true,
      message: "Login successfully!",
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isOnline: user.isOnline,
      lastSeen: user.lastSeen,
      access_token,
      refresh_token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const refreshToken = (req, res) => {
  const token = req.cookies.refresh_token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No refresh token",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET_KEY);

    const newAccessToken = jwt.sign({ id: decoded.id }, jwtKey, {
      expiresIn: "15m",
    });

    return res.status(200).json({
      success: true,
      access_token: newAccessToken,
    });
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: "Invalid refresh token",
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    res.status(201).json({
      success: true,
      message: "Logout successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const id = req.user.id;
    const user = await User.findById(id).select(
      "name email avatar isOnline lastSeen",
    );
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;

    const skip = (page - 1) * limit;

    const users = await User.find({
      _id: { $ne: req.user.id }, // current user ko exclude karo
    })
      .limit(limit)
      .skip(skip);

    res.status(200).json({
      data: { success: true, users },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id)
      .select("_id name email avatar isOnline lastSeen")
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
