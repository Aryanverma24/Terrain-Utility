import express from "express";
import { authenticate ,authenticateRegistrar } from "../middlerwares/authMiddlewares.js";
import { approveAppointment, completeAppointment, createAppointment, getAppointmentByLand, getAvailableSlots, getRegistrarAppointments, updateAppointment, updateAttendance } from "../controllers/appointmentController.js";
import upload from '../utils/multerConfig.js';
import { decideAppointment, markStepComplete, uploadBiometric, uploadDeed, uploadStamp, verifyIdentity } from '../controllers/appointmentController.js';

const router = express.Router();
router.use((req, res, next) => {
  console.log("📦 ROUTER HIT:", req.method, req.originalUrl);
  next();
});
/**
 *  CREATE APPOINTMENT
 */
router.post("/create", authenticate, createAppointment);
 /*** GET APPOINTMENT BY LAND 
 */
router.get("/land/:landId", authenticate, getAppointmentByLand);
// to get all appointments for a registrar
router.get("/registrar", authenticateRegistrar, getRegistrarAppointments);
//to complte the apointment 
router.post("/complete",authenticateRegistrar , completeAppointment);


router.patch("/approve/:id", authenticateRegistrar, approveAppointment);

router.patch(
  "/:id/update",
  authenticateRegistrar,
  updateAppointment
);
//to get the available slots 
router.get("/available-slots", authenticateRegistrar, getAvailableSlots);

//mark attendance of parties 

router.patch(
  "/:id/attendance",
  authenticateRegistrar,
  updateAttendance
);

// 1. Identity Validation
router.patch(
  "/:id/identity",
  authenticateRegistrar,
  verifyIdentity
);

// 2. Biometric Upload
router.patch(
  "/:id/biometric",
  authenticateRegistrar,
  upload.fields([
    { name: "buyerPhoto", maxCount: 1 },
    { name: "sellerPhoto", maxCount: 1 },
    { name: "groupPhoto", maxCount: 1 }
  ]),
  uploadBiometric
);

// 3. Deed Upload
router.patch(
  "/:id/deed",
  authenticateRegistrar,
  upload.single("file"),
  uploadDeed
);

// 4. Stamp Upload
router.patch(
  "/:id/stamp",
  authenticateRegistrar,
  upload.fields([
    { name: "registryDoc", maxCount: 1 },
    { name: "stampProof", maxCount: 1 }
  ]),
  uploadStamp
);

// 5. Final Completion
router.patch(
  "/:id/complete",
  authenticateRegistrar,
  markStepComplete
);

// 6. Registrar Decision 
router.patch("/:id/decision",
  (req, res, next) => {
    console.log("🔥 DECISION ROUTE MATCHED");
    next();
  },
  authenticateRegistrar,
  (req, res, next) => {
    console.log("🔐 AFTER AUTH");
    next();
  },
  decideAppointment
);

export default router;