import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { Server } from "socket.io";
import { createServer } from "http";
import dbConnect from "./config/db.js";
import userRouter from "./routes/userRoutes.js";
import conversationRouter from "./routes/conversationRoutes.js";
import { socketHandler } from "./socket/socket.js";
import cors from "cors";
import messageRouter from "./routes/messageRoutes.js";
const PORT = 5000;
const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
    methods: ["GET", "POST"],
  },
});

dbConnect();
socketHandler(io);

app.use("/auth", userRouter);
app.use("/conversations", conversationRouter);
app.use("/messages", messageRouter);

app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

server.listen(PORT, () => {
  console.log(`Server runining on ${PORT}`);
});
