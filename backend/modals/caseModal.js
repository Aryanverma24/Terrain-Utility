import mongoose from "mongoose";

const caseSchema = new mongoose.Schema(
  {
    buyerChatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
ownerChatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    landId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Land",
      required: true,
    },

    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    lawyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
      index: true,
    },

    buyerLawyerChat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },

    ownerLawyerChat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },

    closedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    closedAt: {
      type: Date,
      default: null,
    },

    closureReasonType: {
      type: String,
      enum: ["deal_completed", "cancelled", "dispute", "expired","mutual_agreement",
    "closed_by_lawyer", "not_interested","other"],
      default: null,
    },

    closureReasonText: {
      type: String,
      default: "",
      maxlength: 500,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Case", caseSchema);