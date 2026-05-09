import express from "express";

import {
    finalizeTransfer,
    getMutationByAppointment,
  getPendingMutationsForRegistrar,
  initiateMutation,
  signMutation
} from "../controllers/mutationController.js";


import { authenticateRegistrar } from "../middlerwares/authMiddlewares.js";

const router = express.Router();

router.get(
  "/registrar/pending",
  authenticateRegistrar,
  getPendingMutationsForRegistrar
);
//to initiate mutation
router.post(
  "/initiate/:appointmentId",
  authenticateRegistrar,
  initiateMutation
);
//to get mutations list in appointment workbench 
router.get(
  "/by-appointment/:appointmentId",
  authenticateRegistrar,
  getMutationByAppointment
);
//to sign digitally
router.patch(
  "/sign/:id",
  authenticateRegistrar,
  signMutation
);

/* =========================================
   FINALIZE OWNERSHIP TRANSFER
========================================= */

router.patch(
  "/finalize-transfer/:id",
  authenticateRegistrar,
  finalizeTransfer
);
export default router;