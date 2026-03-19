// models/chatModel.js
import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  landId: { type: mongoose.Schema.Types.ObjectId, ref: "Land", required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  buyerName: { type: String },
ownerName: { type: String },
  lastMessageAt: { type: Date, default: Date.now },
  lastMessage: { type: String, default: "" },
}, { timestamps: true });

// 🔥 CRITICAL FIX
chatSchema.index({ landId: 1, buyerId: 1, ownerId: 1 }, { unique: true });

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
