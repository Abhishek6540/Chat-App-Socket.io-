import express from "express";
import { getMessages } from "../controllers/messageController.js";
import { authMiddleware } from "../middleware/auth.js";

const messageRouter = express.Router();

messageRouter.get("/:conversationId", authMiddleware, getMessages);

export default messageRouter;
