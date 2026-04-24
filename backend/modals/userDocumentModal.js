import mongoose from 'mongoose';

const UserDocumentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // =========================
    // USER DECLARATION (KYC)
    // =========================
    userDeclaration: {
      accepted: {
        type: Boolean,
        default: false,
      },
      acceptedAt: {
        type: Date,
        default: null,
      },
      ipAddress: {
        type: String,
        default: null,
      },
      userAgent: {
        type: String,
        default: null,
      },
    },

    // =========================
    // LAWYER DECLARATION (KYC)
    // =========================
    lawyerDeclaration: {
      accepted: {
        type: Boolean,
        default: false,
      },
      acceptedAt: {
        type: Date,
        default: null,
      },
      lawyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
    },

    // =========================
    // OVERALL STATUS
    // =========================
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    isFullyApproved: {
      type: Boolean,
      default: false,
    },

    // =========================
    // DOCUMENTS
    // =========================
    documents: [
      {
        type: {
          type: String,
          enum: [
            'Aadhaar',
            'PAN',
            'Passport',
            'VoterID',
            'DrivingLicense',
            'AddressProof',
            'ProfilePhoto',
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

        status: {
          type: String,
          enum: ['pending', 'approved', 'rejected'],
          default: 'pending',
        },

        reviewedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          default: null,
        },

        reviewedAt: {
          type: Date,
          default: null,
        },

        // 🔥 (NEW - optional but powerful)
        reviewNote: {
          type: String,
          default: '',
        },

        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model('UserDocument', UserDocumentSchema);
