import Conversation from "../models/Conversation.js";

export const createPrivate = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const userId = req.user.id;

    const existingConversation = await Conversation.findOne({
      type: "private",
      participants: {
        $all: [userId, receiverId],
      },
    });

    if (existingConversation) {
      return res.status(200).json({
        success: true,
        conversation: existingConversation,
      });
    }
    const conversation = await Conversation.create({
      type: "private",
      participants: [userId, receiverId],
      createdBy: userId,
      unread: [
        { user: userId, count: 0 },
        { user: receiverId, count: 0 },
      ],
    });

    res.status(201).json({
      data: { success: true, conversation },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const createGroup = async (req, res) => {
  try {
    const { groupName, participants } = req.body;
    const allUsers = [...new Set([req.user.id, ...participants])];

    const group = await Conversation.create({
      type: "group",
      groupName,
      participants: [...new Set([req.user.id, ...participants])],
      admin: req.user.id,
      createdBy: req.user.id,
      unread: allUsers.map((id) => ({
        user: id,
        count: 0,
      })),
    });

    res.status(201).json({
      success: true,
      data: group,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
export const getConversation = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id,
    })
      .populate("participants")
      .populate("lastMessage")
      .sort({
        updatedAt: -1,
      });

    res.status(200).json({
      data: {
        success: true,
        conversations,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
