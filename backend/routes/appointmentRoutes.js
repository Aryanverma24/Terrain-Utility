import express from "express";
import { authenticate ,authenticateRegistrar } from "../middlerwares/authMiddlewares.js";
import { approveAppointment, completeAppointment, createAppointment, getAppointmentByLand, getAvailableSlots, getRegistrarAppointments, updateAppointment } from "../controllers/appointmentController.js";

const router = express.Router();

/**
 * 🗓️ CREATE APPOINTMENT
 * Flow:
 * - landId + date from frontend
 * - system auto assigns slot + creates appointment
 */
router.post("/create", authenticate, createAppointment);
 /*** GET APPOINTMENT BY LAND (IMPORTANT FOR UI PERSISTENCE)
 */
router.get("/land/:landId", authenticate, getAppointmentByLand);
// to get all appointments for a registrar
router.get("/registrar", authenticateRegistrar, getRegistrarAppointments);
//to complte the apointment 
router.post("/complete",authenticateRegistrar , completeAppointment);

router.patch("/approve/:id", authenticateRegistrar, approveAppointment);

router.patch("/update/:id", authenticateRegistrar, (req, res, next) => {
  console.log("🔥 UPDATE ROUTE HIT");
  console.log("🆔 PARAM ID:", req.params.id);
  console.log("📦 BODY:", req.body);
  next();
}, updateAppointment);
//to get the available slots 
router.get("/available-slots", authenticateRegistrar, getAvailableSlots);
export default router;