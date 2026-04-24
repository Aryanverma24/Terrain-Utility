import mongoose from 'mongoose';

const OwnershipHistorySchema = new mongoose.Schema(
  {
    landId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Land',
      required: true,
      index: true,
    },

    fromOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    fromOwnerName: {
      type: String,
      required: true,
    },

    toOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    toOwnerName: {
      type: String,
      required: true,
    },

    transferType: {
      type: String,
      enum: ['sale', 'inheritance', 'gift'],
      default: 'sale',
    },

    price: {
      type: Number,
      default: 0,
    },

    dateOfTransfer: {
      type: Date,
      default: Date.now,
    },

    documents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
      },
    ],

    // 🌍 GEO SNAPSHOT (future-ready)
    geoSnapshot: {
      coordinates: {
        type: [Number], // [lat, lng]
        default: [],
      },
      address: { type: String, default: '' },
      area: { type: String, default: '' },
    },

    // 🔐 BLOCKCHAIN-LIKE FIELDS
    previousHash: {
      type: String,
      required: true,
    },

    currentHash: {
      type: String,
      required: true,
    },

    // 🔢 OPTIONAL BLOCK NUMBER
    blockNumber: {
      type: Number,
      default: 0,
    },

    // ✅ VERIFICATION
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// 🔥 Important Index
OwnershipHistorySchema.index({ landId: 1, createdAt: -1 });

export const OwnershipHistory = mongoose.model(
  'OwnershipHistory',
  OwnershipHistorySchema,
);

export default OwnershipHistory;
