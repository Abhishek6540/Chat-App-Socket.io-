import express from "express";
import {
  createPrivate,
  createGroup,
  getConversation,
} from "../controllers/conversationController.js";
import { authMiddleware } from "../middleware/auth.js";
const conversationRouter = express.Router();

conversationRouter.post("/private", authMiddleware, createPrivate);
conversationRouter.post("/group", authMiddleware, createGroup);
conversationRouter.get("/", authMiddleware, getConversation);

export default conversationRouter;
