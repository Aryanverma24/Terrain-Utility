import Appointment from "../modals/AppointmentModal.js";
import Land from "../modals/LandModal.js";
import Registrar from "../modals/registrarModal.js";
import asyncHandler from "../middlerwares/asyncHandler.js";
import Notification from "../modals/NotificationModal.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import Mutation from "../modals/mutationModal.js";
import { addAuditLog } from "../utils/Auditlog.js";
export const createAppointment = async (req, res) => {
  try {
    const { landId, date } = req.body;
    const userId = req.user._id;

    const land = await Land.findById(landId);

    if (!land || !land.assignedRegistrar) {
      return res.status(400).json({
        success: false,
        msg: "Registrar not assigned",
      });
    }

    const registrar = await Registrar.findById(land.assignedRegistrar);
console.log("CREATING APPOINTMENT FOR REG:", registrar._id);
console.log("LAND ASSIGNED REG:", land.assignedRegistrar);
    // SLOT GENERATION LOGIC (simple rotation)
    const slots = registrar.slotTemplate;

    const todayAppointments = await Appointment.find({
      registrar: registrar._id,
      date: new Date(date),
    });

    let assignedSlot = null;

    for (let slot of slots) {
      const count = todayAppointments.filter(
        (a) => a.timeSlot === slot.time
      ).length;

      if (count < slot.capacity) {
        assignedSlot = slot.time;
        break;
      }
    }

    if (!assignedSlot) {
      return res.status(400).json({
        success: false,
        msg: "No slots available for selected date",
      });
    }
const existing = await Appointment.findOne({ land: landId });

if (existing) {
  return res.status(400).json({
    success: false,
    msg: "Appointment already exists and is locked",
  });
}
    const appointment = await Appointment.create({
      registrar: registrar._id,
      buyer: userId,
      land: landId,
      date,
      timeSlot: assignedSlot,
      status: "confirmed",
      assignedBySystem: true,
    });

    // update land status
    land.transferStatus = "appointment_booked";
    await land.save();
await addAuditLog({
  landId: land._id,
  action: "Appointment Created",
  description: `Registration appointment booked for ${date} at ${assignedSlot}`,
  user: req.user,
});
    return res.json({
      success: true,
      appointment,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      msg: "Server error",
    });
  }
};
//to get the appointment by land 
export const getAppointmentByLand = async (req, res) => {
  try {

    const { landId } = req.params;

    /* =====================================
       FETCH ONLY ACTIVE APPOINTMENT
    ===================================== */

    const appointment = await Appointment.findOne({
      land: landId,
      isArchived: { $ne: true },
      lifecycleStatus: { $ne: "archived" }
    })
      .sort({ createdAt: -1 })
      .populate("registrar")
      .populate("buyer")
      .populate("land");

    /* =====================================
       IF NOT FOUND
    ===================================== */

    if (!appointment) {
      return res.json({
        success: true,
        appointment: null,
      });
    }

    /* =====================================
       RESPONSE
    ===================================== */

    return res.json({
      success: true,
      appointment,
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      msg: "Server error",
      error: err.message,
    });

  }
};

//api to get regsitrar appointments
export const getRegistrarAppointments = async (req, res) => {
  try {

    const registrarId = req.registrar?._id;

    console.log("REGISTRAR ID FROM AUTH:", registrarId);

    if (!registrarId) {
      return res.status(401).json({
        message: "Registrar only"
      });
    }

    /* =====================================
       FETCH APPOINTMENTS
    ====================================== */

    const appointments = await Appointment.find({
      registrar: registrarId,
    })
      .populate("buyer", "username email")
      
      .populate(
        "land",
        `
          landtype
          location
          transferStatus
          owner
          ownerName
          price
          city
          state
        `
      )
      .sort({ date: 1 });

    /* =====================================
       FORMAT RESPONSE
    ====================================== */

    const formatted = appointments.map((a) => ({

      _id: a._id,

      buyer: {
        _id: a.buyer?._id,
        name: a.buyer?.username,
        email: a.buyer?.email,
      },

      land: {
        _id: a.land?._id,
        landtype: a.land?.landtype,
        location: a.land?.location,

        transferStatus: a.land?.transferStatus,

        owner: a.land?.owner,
        ownerName: a.land?.ownerName,
        city: a.land?.city,
        state: a.land?.state,
        price: a.land?.price,
      },

      registrar: registrarId,

      date: a.date,
      timeSlot: a.timeSlot,
      status: a.status,

      reschedule: {
        previousDate: a.previousDate || null,
        previousTimeSlot: a.previousTimeSlot || null,
        rescheduledBy: a.rescheduledBy || null,
        rescheduleReason: a.rescheduleReason || null,
      },

      notes: a.notes || "",

      execution: a.execution || {
        identity: { verified: false },
        biometric: { verified: false },
        deed: { verified: false },
        stamp: { verified: false }
      },
attendance: a.attendance || "All Present",  
      registrarDecision: a.registrarDecision || {
        status: "pending",
        note: "",
        decidedBy: null,
        decidedAt: null,
      },

      createdAt: a.createdAt,

    }));


    /* =====================================
       FILTER WORKFLOW QUEUES
    ====================================== */

    const activeAppointments = formatted.filter(
      (a) =>
        a.land &&
        [
          "appointment_booked",
          "under_registration"
        ].includes(a.land.transferStatus)
    );


    const mutationQueue = formatted.filter(
      (a) =>
        a.land &&
        a.land.transferStatus === "mutation_pending"
    );


    const completedTransfers = formatted.filter(
      (a) =>
        a.land &&
        a.land.transferStatus === "transferred"
    );


    /* =====================================
       TODAY / UPCOMING (ONLY ACTIVE)
    ====================================== */

    const today = new Date().toDateString();

    const todayAppointments = activeAppointments.filter(
      (a) =>
        new Date(a.date).toDateString() === today
    );

    const upcomingAppointments = activeAppointments.filter(
      (a) =>
        new Date(a.date).toDateString() !== today
    );


    /* =====================================
       RESPONSE
    ====================================== */

    return res.json({
      success: true,

      today: todayAppointments,
      upcoming: upcomingAppointments,

      activeAppointments,
      mutationQueue,
      completedTransfers,

      all: formatted,
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};
// complte registrar appointment 
export const completeAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        msg: "Appointment not found",
      });
    }

    appointment.status = "completed";
    await appointment.save();

    // update land stage forward
    await Land.findByIdAndUpdate(appointment.land, {
      transferStatus: "registration_started",
    });

    return res.json({
      success: true,
      appointment,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: "Server error",
    });
  }
};
//to update the appointment
export const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate("land");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
const oldDate = appointment.date;
const oldSlot = appointment.timeSlot;

// save previous
appointment.previousDate = oldDate;
appointment.previousTimeSlot = oldSlot;

appointment.rescheduledBy = "registrar";
    appointment.date = req.body.date || appointment.date;
    appointment.timeSlot = req.body.timeSlot || appointment.timeSlot;

    await appointment.save();
    await addAuditLog({
  landId: appointment.land._id,
  action: "Appointment Rescheduled",
  description: `Appointment moved to ${appointment.date} (${appointment.timeSlot})`,
  user: req.user,
});
// Notify BUYER
await Notification.create({
  userId: appointment.buyer,
  title: "Appointment Updated by Registrar",
  message: `
Appointment Confirmed & Updated

Date: ${appointment.date}
Time Slot: ${appointment.timeSlot}

Registrar Office:
Name: ${appointment.registrar?.name || "Registrar"}
Office: ${appointment.registrar?.officeName || ""}
`,
  targetRole: "buyer",
});

// Notify LAND OWNER
const ownerId = appointment.land?.owner;

if (ownerId) {
  await Notification.create({
    userId: ownerId,
    title: "Land Transaction Update",
    targetRole: "owner",
    message: `
A registration appointment for your land has been updated by the registrar.

New Slot:
Date: ${appointment.date}
Time: ${appointment.timeSlot}
`,
  });
}
    return res.json({
      success: true,
      appointment,
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
//approve the appointment by registrar
export const approveAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id; // FIXED

    const appointment = await Appointment.findById(appointmentId)
      .populate("buyer land registrar");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.status = "approved";
    await appointment.save();

    await Notification.create({
      userId: appointment.buyer._id,
      message: `Your appointment is approved for ${appointment.date} ${appointment.timeSlot}`,
    });

    await Notification.create({
      userId: appointment.land.owner,
      message: `Appointment approved for your land transfer`,
    });

    res.json({
      success: true,
      message: "Appointment approved",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
//to get the avialbale slot info
export const getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;

    const TIME_SLOTS = [
      "09:00-10:00",
      "10:00-11:00",
      "11:00-12:00",
      "12:00-01:00",
      "02:00-03:00",
      "03:00-04:00",
      "04:00-05:00",
    ];

    const CAPACITY = 5;

    const appointments = await Appointment.find({ date });

    // count bookings per slot
    const slotMap = {};

    appointments.forEach((a) => {
      slotMap[a.timeSlot] = (slotMap[a.timeSlot] || 0) + 1;
    });

    // filter available slots
    const availableSlots = TIME_SLOTS.filter((slot) => {
      return (slotMap[slot] || 0) < CAPACITY;
    });

    res.json({ availableSlots });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
//to now handle teh attedance of aprties 
export const updateAttendance = async (req, res) => {
  try {

    const { attendance } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    appointment.set("attendance", attendance);
await appointment.save();
await addAuditLog({
  landId: appointment.land,
  action: "Attendance Marked",
  description: `Attendance updated: ${attendance}`,
  user: req.registrar,
});
    return res.json({
      success: true,
      appointment
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
//the decison on the docuemnts verification
export const decideAppointment = async (req, res) => {
  try {
    const { status, note } = req.body;

    const registrarId = req.registrar?._id;

    console.log("BODY:", req.body);
    console.log("REGISTRAR:", registrarId);

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid decision status" });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // ensure default object exists
    if (!appointment.registrarDecision) {
      appointment.registrarDecision = {
        status: "pending",
        note: "",
        decidedBy: null,
        decidedAt: null
      };
    }

    // ownership check
    if (appointment.registrar.toString() !== registrarId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // prevent re-decision
    if (appointment.registrarDecision.status !== "pending") {
      return res.status(400).json({ message: "Decision already made" });
    }

    // store decision
    appointment.registrarDecision = {
      status,
      note: note || "",
      decidedBy: registrarId,
      decidedAt: new Date()
    };

    // sync status
    appointment.status = status === "approved" ? "confirmed" : "rejected";

    await appointment.save();
await addAuditLog({
  landId: appointment.land,
  action:
    status === "approved"
      ? "Appointment Approved"
      : "Appointment Rejected",
  description:
    note || `Registrar marked appointment as ${status}`,
  user: req.registrar,
});
    // IMPORTANT: return fresh object
    const updated = await Appointment.findById(req.params.id)
      .populate("buyer")
      .populate("land")
      .populate("registrar");

    return res.json({
      message: `Appointment ${status}`,
      appointment: updated
    });

  } catch (err) {
    console.error("DECISION ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};
//identity verify
export const verifyIdentity = async (req, res) => {
  try {
    console.log("📥 ROUTE HIT");
    console.log("🆔 PARAM ID:", req.params.id);
    console.log("🔐 USER:", req.registrar?._id);

    const appointment = await Appointment.findById(req.params.id);

    console.log("📦 BEFORE UPDATE:", appointment?.execution);

    if (!appointment) {
      console.log("❌ NOT FOUND");
      return res.status(404).json({ message: "Not found" });
    }

    if (appointment.registrarDecision?.status !== "approved") {
      console.log("❌ NOT APPROVED:", appointment.registrarDecision);
      throw new Error("Registrar approval required");
    }

    appointment.execution.identity.verified = true;
    appointment.execution.identity.verifiedAt = new Date();

    console.log("✏️ AFTER UPDATE (before save):", appointment.execution);

    await appointment.save();
await addAuditLog({
  landId: appointment.land,
  action: "Identity Verification Completed",
  description:
    "Buyer and seller identity verification completed",
  user: req.registrar,
});
    const updated = await Appointment.findById(req.params.id);

    console.log("💾 AFTER SAVE FROM DB:", updated.execution);

    res.json({
      message: "Identity verified",
      appointment: updated
    });

  } catch (err) {
    console.log("🔥 BACKEND ERROR:", err.message);
    res.status(400).json({ message: err.message });
  }
};
//biometric upload for the photos 

export const uploadBiometric = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Not found" });
    }

    if (appointment.registrarDecision?.status !== "approved") {
      return res.status(400).json({ message: "Approval required" });
    }

  const files = req.files;

console.log("📁 FILES:", files);

if (!files?.buyerPhoto || !files?.sellerPhoto) {
  return res.status(400).json({
    message: "Buyer & Seller photos required"
  });
}


    //  UPLOAD BASE64 TO CLOUDINARY
   if (files?.buyerPhoto) {
  const uploaded = await uploadToCloudinary(files.buyerPhoto[0].path);
  appointment.execution.biometric.buyerPhoto = uploaded;
}

if (files?.sellerPhoto) {
  const uploaded = await uploadToCloudinary(files.sellerPhoto[0].path);
  appointment.execution.biometric.sellerPhoto = uploaded;
}

if (files?.groupPhoto) {
  const uploaded = await uploadToCloudinary(files.groupPhoto[0].path);
  appointment.execution.biometric.groupPhoto = uploaded;
}
    appointment.execution.biometric.verified = true;
    appointment.execution.biometric.verifiedAt = new Date();

    await appointment.save();
await addAuditLog({
  landId: appointment.land,
  action: "Biometric Verification Completed",
  description:
    "Biometric and photo verification uploaded",
  user: req.registrar,
});
    res.json({
      message: "Biometric uploaded successfully",
      appointment
    });

  } catch (err) {
    console.error("BIOMETRIC ERROR:", err);
    res.status(400).json({ message: err.message });
  }
};
//deed upload 
export const uploadDeed = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // ✅ INLINE APPROVAL CHECK (remove checkApproval dependency)
    if (appointment.registrarDecision?.status !== "approved") {
      return res.status(400).json({
        message: "Registrar approval required before uploading deed"
      });
    }

    // ✅ FILE VALIDATION
    if (!req.file) {
      return res.status(400).json({
        message: "Deed file is required"
      });
    }

    // ✅ UPLOAD TO CLOUDINARY
    const filePath = req.file.path;

    const uploadedUrl = await uploadToCloudinary(filePath, "deeds");

    if (!uploadedUrl) {
      return res.status(500).json({
        message: "Cloud upload failed"
      });
    }

    // ✅ SAVE TO DB
    appointment.execution.deed = {
      file: uploadedUrl,
      uploadedAt: new Date(),
      verified: true
    };

    await appointment.save();
await addAuditLog({
  landId: appointment.land,
  action: "Sale Deed Uploaded",
  description:
    "Registration deed uploaded successfully",
  user: req.registrar,
});
    // ✅ RETURN UPDATED OBJECT (IMPORTANT for UI)
    const updated = await Appointment.findById(req.params.id);

    return res.json({
      message: "Deed uploaded successfully",
      appointment: updated
    });

  } catch (err) {
    console.error("DEED ERROR:", err);
    return res.status(400).json({
      message: err.message
    });
  }
};
//stamp upload 
export const uploadStamp = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Not found" });
    }

    // ✅ Approval check (replace checkApproval)
    if (appointment.registrarDecision?.status !== "approved") {
      return res.status(400).json({
        message: "Registrar approval required"
      });
    }

    const files = req.files;

    // ✅ VALIDATION
    if (!files?.registryDoc || !files?.stampProof) {
      return res.status(400).json({
        message: "Registry document & Stamp proof required"
      });
    }

    // ✅ Upload registry doc
    if (files.registryDoc) {
      const uploaded = await uploadToCloudinary(
        files.registryDoc[0].path,
        "stamp_docs"
      );

      appointment.execution.stamp.registryDoc = uploaded;
    }

    // ✅ Upload stamp proof
    if (files.stampProof) {
      const uploaded = await uploadToCloudinary(
        files.stampProof[0].path,
        "stamp_docs"
      );

      appointment.execution.stamp.stampProof = uploaded;
    }

    appointment.execution.stamp.verified = true;
    appointment.execution.stamp.verifiedAt = new Date();

    await appointment.save();
await addAuditLog({
  landId: appointment.land,
  action: "Stamp Verification Completed",
  description:
    "Stamp duty and registry documents verified",
  user: req.registrar,
});
    // ✅ IMPORTANT → return fresh updated doc
    const updated = await Appointment.findById(req.params.id);

    res.json({
      message: "Stamp docs uploaded successfully",
      appointment: updated
    });

  } catch (err) {
    console.error("STAMP ERROR:", err);
    res.status(400).json({ message: err.message });
  }
};
//completion of the registration execution 
export const markStepComplete = async (req, res) => {
  try {

    const appointment = await Appointment.findById(req.params.id)
      .populate("buyer")
      .populate("registrar")
      .populate({
        path: "land",
        populate: {
          path: "owner"
        }
      });

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found"
      });
    }

    const exec = appointment.execution;

    const allDone =
      exec.identity?.verified &&
      exec.biometric?.verified &&
      exec.deed?.verified &&
      exec.stamp?.verified;

    if (!allDone) {
      return res.status(400).json({
        message: "All registration steps are not completed"
      });
    }

    /* ===================================
       COMPLETE APPOINTMENT
    =================================== */

    appointment.status = "completed";

    appointment.completedAt = new Date();

    // IMPORTANT
    appointment.markModified("status");

    /* ===================================
       UPDATE LAND TRANSFER STATUS
    =================================== */

    if (appointment.land) {

      appointment.land.transferStatus =
        "mutation_pending";

      appointment.land.verification.documentsVerified = true;

      appointment.land.verification.readyForApproval = true;

      await appointment.land.save();
    }

    await appointment.save();
await addAuditLog({
  landId: appointment.land._id,
  action: "Registration Completed",
  description:
    "All registration workflow steps completed successfully",
  user: req.registrar,
});
    /* ===================================
       AUTO CREATE MUTATION ENTRY
    =================================== */

    const existingMutation = await Mutation.findOne({
      appointment: appointment._id
    });

    if (!existingMutation) {

      const mutationNumber =
        `MUT-${Date.now()}`;

      const draft = `
Mutation Record

Mutation Number: ${mutationNumber}

Land ID: ${appointment.land._id}

Property Location:
${appointment.land.city}, ${appointment.land.state}

Previous Owner:
${appointment.land.owner?.username || "Unknown"}

New Owner:
${appointment.buyer?.username || "Unknown"}

Registrar:
${appointment.registrar?.username || "Registrar"}

Transaction Amount:
₹${appointment.land.price}

Mutation initiated after successful
registration completion.

Status: INITIATED
`;

      await Mutation.create({

        appointment: appointment._id,

        land: appointment.land._id,

        seller: appointment.land.owner?._id,

        buyer: appointment.buyer?._id,

        registrar: appointment.registrar?._id,

        mutationNumber,

        mutationDraft: draft,

        mutationStatus: "initiated",
      });
    }

    /* ===================================
       FETCH FRESH UPDATED APPOINTMENT
    =================================== */

    const updated = await Appointment.findById(req.params.id)
      .populate("buyer")
      .populate("registrar")
      .populate({
        path: "land",
        populate: {
          path: "owner"
        }
      })
      .lean();

    res.json({
      success: true,
      message: "Registration completed successfully",
      appointment: updated
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};