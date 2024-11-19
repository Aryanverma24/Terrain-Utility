import express from "express";
import {
  createLand,
  getAllLands,
  getLandById,
  getLandByUserId,
  updateLandById,
  deleteLandById,
  getLandbyUser,
  getLandByType,
} from "../controllers/LandController.js";
import { authenticate } from "../middlerwares/landauthenticate.js"; // Import the authenticate middleware

const router = express.Router();

// Route for getting all lands
router.route("/").get(getAllLands);

// Route for getting, updating, and deleting land by ID
router.route("/:id")
  .get(getLandById) // Get land by ID
  .put(authenticate, updateLandById) // Update land by ID (protected route)
  .delete(authenticate, deleteLandById); // Delete land by ID (protected route)

// Route for getting land by type
router.route("/type/:landtype").get(getLandByType); // Changed to `/type/:landtype` for clarity

// Route for getting lands by user ID (owner)
router.route("/owner/:userId").get(getLandByUserId); // Changed to `/owner/:userId` for clarity

// Route for getting lands by username
router.route("/user/:username").get(getLandbyUser); // Username-based search

// Protected route for creating land
router.route("/create-land").post(authenticate, createLand);

export default router;
