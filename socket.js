import { Server } from "socket.io";
import { isValidObjectId } from "mongoose";
import { Message } from "./src/db/models/message.model.js";
import { Company } from "./src/db/models/company.model.js";
import { User } from "./src/db/models/user.model.js";

const connectedUsers = {};

export const setupSocket = (server) => {
  const io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    console.log(" New client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log(" Client disconnected:", socket.id);
    });



    socket.on("sendMessage", async ({ senderId, receiverId, content }) => {
      if (!isValidObjectId(senderId) || !isValidObjectId(receiverId) || !content) {
        return socket.emit("error", "Invalid message data");
      }


      const sender = await User.findById(senderId);
      const receiver = await User.findById(receiverId);
      if (!sender || !receiver) return socket.emit("error", "User not found");


      const company = await Company.findOne({ $or: [{ createdBy: senderId }, { HRs: senderId }] });
      const isSenderAuthorized = company || sender.role === "Admin";
      const hasExistingChat = await Message.exists({ senderId: receiverId, receiverId: senderId });

      if (!isSenderAuthorized && !hasExistingChat) {
        return socket.emit("error", "Only HRs or company owners can start a conversation");
      }


      const newMessage = await Message.create({ senderId, receiverId, content });


      if (connectedUsers[receiverId]) {
        io.to(connectedUsers[receiverId]).emit("receiveMessage", newMessage);
      }
    });


    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      Object.keys(connectedUsers).forEach((userId) => {
        if (connectedUsers[userId] === socket.id) {
          delete connectedUsers[userId];
        }
      });
    });
  });

  return io;
};
