import jwt from "jsonwebtoken";

const jwtKey = process.env.JWT_SECRET_KEY || "mySuperSecretKey";
const refreshKey = process.env.JWT_REFRESH_SECRET_KEY || "myRefreshSecretKey";

// Access token
export const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id }, jwtKey, { expiresIn: "15m" });
};

// Refresh token
export const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, refreshKey, { expiresIn: "7d" });
};
