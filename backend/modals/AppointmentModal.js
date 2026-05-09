import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    // LINKS
    registrar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Registrar",
      required: true
    },

    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    land: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Land",
      required: true
    },

    // SCHEDULE
    date: {
      type: Date,
      required: true
    },

    timeSlot: {
      type: String,
      required: true
    },

    previousDate: Date,
    previousTimeSlot: String,

    rescheduledBy: {
      type: String,
      enum: ["registrar", "system", "user"]
    },

    rescheduleReason: String,

    status: {
      type: String,
      enum: [
        "requested",
        "auto_assigned",
        "confirmed",
        "rejected",
        "rescheduled",
        "cancelled",
        "completed",
        "archived"
      ],
      default: "requested"
    },
isArchived: {
  type: Boolean,
  default: false
},
    // AUTO SYSTEM SUPPORT
    assignedBySystem: {
      type: Boolean,
      default: true
    },

    // FLOW CONTROL
    notes: {
      type: String,
      default: ""
    },

    // =========================
    // REGISTRAR DECISION
    // =========================
  registrarDecision: {
  status: {
    type: String,
    enum: ["approved", "rejected", "pending"],
    default: "pending"
  },
  note: {
    type: String,
    default: ""
  },
  decidedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Registrar",
    default: null
  },
  decidedAt: {
    type: Date,
    default: null
  }
},
attendance: {
  type: String,
  enum: [
    "All Present",
    "Buyer Absent",
    "Seller Absent",
    "Witness Missing",
    "Adjournment Requested"
  ],
  default: "All Present"
},

    // =========================
    // EXECUTION FLOW (NEW)
    // =========================
    execution: {

      identity: {
        verified: {
          type: Boolean,
          default: false
        },
        verifiedAt: Date
      },

      biometric: {
        buyerPhoto: String,
        sellerPhoto: String,
        groupPhoto: String, // optional but useful
        verified: {
          type: Boolean,
          default: false
        },
        verifiedAt: Date
      },

      deed: {
        file: String,
        uploadedAt: Date,
        verified: {
          type: Boolean,
          default: false
        }
      },

      stamp: {
        registryDoc: String,
        stampProof: String,
        verified: {
          type: Boolean,
          default: false
        }
      }
    }

  },
  { timestamps: true }
);

export default mongoose.model("Appointment", appointmentSchema);