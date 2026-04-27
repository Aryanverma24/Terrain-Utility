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
      required: true // "10:00-11:00"
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
        "completed"
      ],
      default: "requested"
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
    }
  },
  { timestamps: true }
);

export default mongoose.model("Appointment", appointmentSchema);