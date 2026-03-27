// models/messageModel.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  senderName: { type: String, required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiverName: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  
  isRead: { type: Boolean, default: false },
delivered: { type: Boolean, default: true }, // ✅ ADD
});

const Message = mongoose.model("Message", messageSchema);
export default Message;
