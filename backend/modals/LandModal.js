import mongoose from "mongoose";
import User from "./UserModal.js";
import OwnershipHistory from "./ownershipHistroyModal.js";
const ReviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const LandSchema = new mongoose.Schema(
  {
    landtype: { type: String, required: true },
    description: { type: String, default: "" },

    image: {
      cloudinary: { type: String, default: null },
      local: { type: String, required: true },
    },

    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: Number, required: true },

    // 🔥 CURRENT OWNER
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ownerName: { type: String, required: true },

    price: { type: Number, required: true },

    assignedLawyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    rejectionReason: { type: String },

    dimensions: {
      length: { type: Number, required: true },
      breadth: { type: Number, required: true },
    },

    dimensionsString: { type: String, required: true },

    reviews: [ReviewSchema],
    averageRating: { type: Number, default: 0 },

    // =========================
    // 🔥 UPDATED INTEREST SYSTEM
    // =========================
    interestedUsers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },

        status: {
          type: String,
          enum: ["pending", "accepted", "withdrawn"],
          default: "pending",
        },

        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    interestedUsersCount: {
      type: Number,
      default: 0,
    },

    // =========================
    // LAND STATUS
    // =========================
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    documents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Document" }],

    // =========================
    // 🔥 OWNERSHIP FEATURES
    // =========================
    ownershipHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "OwnershipHistory",
      },
    ],

    ownershipCount: {
      type: Number,
      default: 0,
    },

    lastTransferDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// 🔥 PERFORMANCE INDEXES
LandSchema.index({ ownershipCount: -1 });
LandSchema.index({ "interestedUsers.user": 1 });

export const Land = mongoose.model("Land", LandSchema);
export default Land;