import mongoose from "mongoose";

const registrarSchema = new mongoose.Schema(
{
    // Official Preloaded Identity
    registrarUniqueId: {
        type: String,
        required: true,
        unique: true, // e.g REG-UK-HRD-00127
        index: true
    },

    officeCode: {
        type: String,
        required: true,
        unique: true
    },

    registrarName: {
        type: String,
        required: true,
        trim: true
    },

    designation: {
        type: String,
        default: "Sub Registrar"
        // later can support Patwari, District Registrar etc
    },

    // Office Information
    officeName: {
        type: String,
        required: true
    },

    state: {
        type: String,
        required: true
    },

    district: {
        type: String,
        required: true
    },

    officeAddress: {
        type: String,
        required: true
    },

    // Preloaded official email
    officialEmail: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },

    phoneNumber: {
        type: String
    },

    // Activation Flow
    isActivated: {
        type: Boolean,
        default: false
    },

    activatedAt: {
        type: Date
    },

    password: {
        type: String
        // required only after activation
    },

    lastLogin: {
        type: Date
    },

    // Role Verification
    isVerifiedRegistrar: {
        type: Boolean,
        default: true
        // preloaded government records assumed verified
    },

    status: {
        type: String,
        enum: [
            "active",
            "inactive",
            "suspended"
        ],
        default: "active"
    },

    // Appointment handling
    availableSlots: [
        {
            date: Date,
            slots: [
                {
                    time: String,
                    isBooked: {
                        type: Boolean,
                        default: false
                    }
                }
            ]
        }
    ],

    // References to transactions
    assignedTransactions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "LandTransaction"
        }
    ],

    // Audit / Security
    activationAttempts: {
        type: Number,
        default: 0
    },

    lastActivationAttempt: {
        type: Date
    }
},
{
    timestamps: true
}
);


// Useful indexes
registrarSchema.index({ district: 1 });
registrarSchema.index({ registrarUniqueId: 1 });
registrarSchema.index({ officeCode: 1 });

const Registrar = mongoose.model(
    "Registrar",
    registrarSchema
);

export default Registrar;