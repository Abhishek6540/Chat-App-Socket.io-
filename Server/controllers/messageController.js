import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({ conversationId })
      .populate("sender", "name email avatar")
      .sort({ createdAt: 1 });

    const conversation = await Conversation.findById(conversationId).populate(
      "participants",
      "name email avatar isOnline lastSeen",
    );

    const otherUser = !conversation.isGroup
      ? conversation.participants.find(
          (user) => user._id.toString() !== req.user.id,
        )
      : null;

    res.status(200).json({
      success: true,
      data: {
        isGroup: conversation.type,
        memberCount: conversation.participants.length,
        user: !conversation.isGroup
          ? conversation.participants.find(
              (user) => user._id.toString() !== req.user.id,
            )
          : null,
        participants: conversation.participants,
        groupName: conversation.groupName,
        messages,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
