import mongoose from 'mongoose';

const registrarSchema = new mongoose.Schema(
  {
    // =========================
    // IDENTITY
    // =========================
    registrarUniqueId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    officeCode: {
      type: String,
      required: true,
      unique: true,
    },

    registrarName: {
      type: String,
      required: true,
      trim: true,
    },

    designation: {
      type: String,
      default: 'Sub Registrar',
    },

    // =========================
    // OFFICE INFO
    // =========================
    officeName: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },

    district: {
      type: String,
      required: true,
    },

    officeAddress: {
      type: String,
      required: true,
    },

    jurisdiction: {
      cities: [String],
      pincodes: [Number],
    },

    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [lng, lat]
        index: '2dsphere',
      },
    },

    // =========================
    // CONTACT
    // =========================
    officialEmail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    phoneNumber: {
      type: String,
    },

    // =========================
    // AUTH / STATUS
    // =========================
    isActivated: {
      type: Boolean,
      default: false,
    },

    activatedAt: {
      type: Date,
    },

    password: {
      type: String,
    },

    lastLogin: {
      type: Date,
    },

    isVerifiedRegistrar: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },

    activationAttempts: {
      type: Number,
      default: 0,
    },

    lastActivationAttempt: {
      type: Date,
    },

    // =========================
    // SLOT SYSTEM (STATIC RULES)
    // =========================
    slotTemplate: [
      {
        time: {
          type: String, // "10:00-11:00"
          required: true,
        },
        capacity: {
          type: Number,
          default: 5,
        },
      },
    ],

    // =========================
    // APPOINTMENT SETTINGS (LIGHTWEIGHT)
    // =========================
    appointmentSettings: {
      autoAssign: {
        type: Boolean,
        default: true,
      },
      allowReschedule: {
        type: Boolean,
        default: true,
      },
    },

    // =========================
    // RELATIONS
    // =========================
    assignedTransactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LandTransaction',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// =========================
// INDEXES
// =========================
registrarSchema.index({ district: 1 });
registrarSchema.index({ registrarUniqueId: 1 });
registrarSchema.index({ officeCode: 1 });
registrarSchema.index({ location: '2dsphere' });

const Registrar = mongoose.model('Registrar', registrarSchema);

export default Registrar;