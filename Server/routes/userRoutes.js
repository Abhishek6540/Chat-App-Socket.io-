import express from "express";
import {
  register,
  getProfile,
  getUserById,
  getUsers,
  login,
  logout,
  refreshToken,
} from "../controllers/userController.js";
import { authMiddleware } from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.post("/logout", logout);
userRouter.post("/token", refreshToken);
userRouter.get("/profile", authMiddleware, getProfile);
userRouter.get("/users", authMiddleware, getUsers);
userRouter.get("/users/:id", getUserById);

export default userRouter;
