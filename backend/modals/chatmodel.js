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
},

    lastMessageAt: { type: Date, default: Date.now },
    lastMessage: { type: String, default: "" },
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;