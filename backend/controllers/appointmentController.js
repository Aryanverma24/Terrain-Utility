import Appointment from "../modals/AppointmentModal.js";
import Land from "../modals/LandModal.js";
import Registrar from "../modals/registrarModal.js";
import asyncHandler from "../middlerwares/asyncHandler.js";
import Notification from "../modals/NotificationModal.js";
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

    const appointment = await Appointment.findOne({ land: landId })
      .populate("registrar")
    //   .populate("user");

    if (!appointment) {
      return res.json({
        success: true,
        appointment: null,
      });
    }

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

    if (!registrarId) {
      return res.status(401).json({ msg: "Registrar only" });
    }

    const appointments = await Appointment.find({
      registrar: registrarId,
    })
      .populate("buyer")
      .populate("land");

    return res.json({ success: true, appointments });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
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
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId)
      .populate("buyer land registrar");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.status = "approved";
    await appointment.save();

    // 🔔 notify buyer + owner
    await Notification.create({
      user: appointment.buyer._id,
      message: `Your appointment is approved for ${appointment.date} ${appointment.timeSlot}`,
    });

    await Notification.create({
      user: appointment.land.owner,
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