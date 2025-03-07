import { Message } from "../../db/models/message.model.js";
import { asyncHandler } from "../../utils/index.js";

export const getChatHistory = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const authUserId = req.authUser._id;


  const Messages = await Message.find({
    $or: [
      { senderId: authUserId, receiverId: userId },
      { senderId: userId, receiverId: authUserId }
    ],
  }).sort({ createdAt: 1 });

  return res.json({ message: "Chat history retrieved successfully", Messages });
});
