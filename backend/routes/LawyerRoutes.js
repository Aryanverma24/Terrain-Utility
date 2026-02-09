import express from "express";
import { authenticate } from "../middlerwares/authMiddlewares.js";
import { roleAuth } from "../middlerwares/roleAuth.js";
import { getPendingLands, approveOrRejectLand } from "../controllers/LawyerController.js";

const router = express.Router();

// Only lawyers can access these routes
router.get("/pending", authenticate, roleAuth("lawyer"), getPendingLands);
router.put("/:landId/action", authenticate, roleAuth("lawyer"), approveOrRejectLand);

export default router;
