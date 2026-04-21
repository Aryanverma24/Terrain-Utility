import mongoose from "mongoose";

const caseSchema = new mongoose.Schema(
  {
    landId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Land",
      required: true,
    },

    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    lawyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
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
  enum: ["deal_completed", "cancelled", "dispute", "expired", "other"],
  default: null,
},

closureReasonText: {
  type: String,
  default: "",
},
  },
  { timestamps: true }
);

export default mongoose.model("Case", caseSchema);