import mongoose from "mongoose";

const mutationSchema = new mongoose.Schema({

  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    required: true,
  },

  land: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Land",
    required: true,
  },

  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  registrar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Registrar",
    required: true,
  },

  mutationNumber: {
    type: String,
    unique: true,
  },

  registryReference: {
    type: String,
    default: "",
  },

  mutationStatus: {
    type: String,
    enum: [
      "initiated",
      "under_review",
      "approved",
      "rejected",
      "completed",
      "archived"
    ],
    default: "initiated",
  },
isArchived: {
  type: Boolean,
  default: false
},
  mutationDraft: {
    type: String,
    default: "",
  },
digitalSignature: {
  hash: String,
  signedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Registrar"
  },
  signedAt: Date
},

isLocked: {
  type: Boolean,
  default: false
},
  mutationPdf: {
    cloudinary: String,
    local: String,
  },

  remarks: {
    type: String,
    default: "",
  },

  initiatedAt: {
    type: Date,
    default: Date.now,
  },

  approvedAt: Date,

  completedAt: Date,

}, {
  timestamps: true,
});

export default mongoose.model("Mutation", mutationSchema);