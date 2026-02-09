import mongoose from "mongoose";
import Land from "./LandModal.js";
import User from "./UserModal.js";

const DocumentSchema = new mongoose.Schema({
  land: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Land,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
    required: true,
  },
  status: {  // Overall status for document collection (optional)
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  documents: [
    {
      type: {
        type: String,
        enum: [
          "Aadhaar",
          "Pan",
          "PAN",
          "SaleDeed",
          "LandRegistry",
          "EncumbranceCertificate",
          "PropertyTax",
          "Khata",
          "SurveyMap",
          "LandPhotos",
          "Noc",
          "NOC",
          "Bills",
          "Ownerphoto",
          "OwnerPhoto"
        ],
        required: true,
      },
      file: {
        type: String, // filename or path
        required: true,
      },
      status: {  // Individual document approval status
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
}, {
  timestamps: true,
});

const Document = mongoose.model("Document", DocumentSchema);
export default Document;
