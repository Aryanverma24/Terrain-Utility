import mongoose from "mongoose";

const UserDocumentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    //  Overall status of all documents
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    //  WHO approved all documents (LAWYER)
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    //  Whether full KYC is approved
    isFullyApproved: {
      type: Boolean,
      default: false,
    },

    //  Individual Documents
    documents: [
      {
        type: {
          type: String,
          enum: [
            "Aadhaar",
            "PAN",
            "Passport",
            "VoterID",
            "DrivingLicense",
            "AddressProof",
            "ProfilePhoto",
          ],
          required: true,
        },

        file: {
          local: {
            type: String,
            required: true,
          },
          cloudinary: {
            type: String,
            default: null,
          },
        },

        // Individual doc status
        status: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },

        //  WHO reviewed this doc
        reviewedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },

        reviewedAt: {
          type: Date,
          default: null,
        },

        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("UserDocument", UserDocumentSchema);