import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true, // 🔥 fast lookup by user
      },
    ],

    landId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Land",
      default: null,
    },

    caseId: {   // 🔥 IMPORTANT (NEW)
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
      default: null,
      index: true,
    },

    chatType: {
      type: String,
      enum: ["normal", "consultation", "legal"],
      default: "normal",
    },

    chatKey: {
      type: String,
      unique: true,
    },

    status: {
      type: String,
      enum: ["active", "terminated"],
      default: "active",
      index: true,
    },

    terminatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    terminatedAt: {
      type: Date,
      default: null,
    },

    terminationReasonType: {
      type: String,
      enum: ["deal_completed", "not_interested", "no_response", "spam", "other"],
      default: null,
    },

    terminationReasonText: {
      type: String,
      default: "",
      maxlength: 500, // 🔥 prevent abuse
    },

    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    lastMessage: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;