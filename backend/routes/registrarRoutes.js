import express from 'express';

import { activateRegistrar, assignRegistrarToLand, getRegistrarAppointmentDocuments, loginRegistrar } from '../controllers/registrarController.js';
import { authenticate, authenticateRegistrar } from '../middlerwares/authMiddlewares.js';
import upload from '../utils/multerConfig.js';
import { decideAppointment, markStepComplete, uploadBiometric, uploadDeed, uploadStamp, verifyIdentity } from '../controllers/appointmentController.js';


const router = express.Router();

router.post('/activate', activateRegistrar);

router.post('/login', loginRegistrar);
router.post("/assign", authenticate, assignRegistrarToLand);

//for getting  documents in appointment
router.get(
  "/appointment/:appointmentId/documents",
  authenticateRegistrar,
   getRegistrarAppointmentDocuments
);

export default router;
