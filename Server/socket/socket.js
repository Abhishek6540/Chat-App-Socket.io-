import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

const onlineUsers = new Map();

export const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("User Connected", socket.id);

    // User join
    socket.on("user:join", (userId) => {
      onlineUsers.set(userId, socket.id);

      // sab clients ko batao
      io.emit("user:online", userId);
    });
    // User online
    socket.on("user:online", (userId) => {
      onlineUsers.set(userId, socket.id);
    });
    //User offline
    socket.on("user:offline", (userId) => {
      onlineUsers.delete(userId);
      io.emit("user:offline", userId);
    });

    //conversation:join
    socket.on("conversation:join", (conversationId) => {
      //user room join karega private or group dono me use hoga
      socket.join(conversationId);
    });
    //conversation:leave
    socket.on("conversation:leave", (conversationId) => {
      //chat close
      socket.leave(conversationId);
    });

    // Message Send
    socket.on("message:send", async (data) => {
      try {
        const { conversationId, sender, content, type = "text" } = data;

        const message = await Message.create({
          conversationId,
          sender,
          content,
          type,
        });

        await Conversation.updateOne(
          { _id: conversationId },
          {
            $inc: {
              "unread.$[elem].count": 1,
            },
          },
          {
            arrayFilters: [{ "elem.user": { $ne: sender } }],
          },
        );

        const populatedMessage = await Message.findById(message._id).populate(
          "sender",
          "name avatar",
        );

        io.to(conversationId).emit("message:new", populatedMessage);
      } catch (error) {
        console.error(error);
      }
    });

    socket.on("message:read", async (data) => {
      try {
        const { conversationId, userId } = data;

        await Conversation.updateOne(
          { _id: conversationId },
          {
            $set: {
              "unread.$[elem].count": 0,
            },
          },
          {
            arrayFilters: [{ "elem.user": userId }],
          },
        );

        io.to(conversationId).emit("message:read", {
          conversationId,
          userId,
        });
      } catch (error) {
        console.error(error);
      }
    });

    // Typing Start
    socket.on("typing:start", ({ conversationId }) => {
      socket.to(conversationId).emit("typing:start", {
        conversationId,
      });
    });

    // Typing Stop
    socket.on("typing:stop", ({ conversationId }) => {
      socket.to(conversationId).emit("typing:stop", {
        conversationId,
      });
    });

    //group:created
    socket.on(
      "group:created",
      (group) => {
        io.emit("group:created", group);
      }, //Naya group sidebar me add.
    );
    socket.on("group:updated", (group) => {
      io.to(group._id).emit("group:updated", group);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected", socket.io);

      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          io.emit("user:offline", userId);
          break;
        }
      }
    });
  });
};
