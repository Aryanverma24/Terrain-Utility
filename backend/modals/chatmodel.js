// models/chatModel.js
import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  landId: { type: mongoose.Schema.Types.ObjectId, ref: "Land", required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  lastMessageAt: { type: Date, default: Date.now }, // For ordering chats
}, { timestamps: true });

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
