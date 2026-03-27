import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    landId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Land",
      default: null,
    },

    chatType: {
      type: String,
      enum: ["normal", "legal"],
      default: "normal",
    },

    chatKey: {
      type: String,
      unique: true,
    },

    lastMessageAt: { type: Date, default: Date.now },
    lastMessage: { type: String, default: "" },
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;