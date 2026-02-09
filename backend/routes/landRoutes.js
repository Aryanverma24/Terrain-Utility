import express from "express";
import {
  createLand,
  getAllLands,
  getLandById,
  getLandByUserId,
  updateLandById,
  deleteLandById,
  getLandReviews,
  getLandsByUser,
  deleteReview,
  getLandByType,
  createReview,
  updateLandsBySameUser
} from "../controllers/LandController.js";
import { authenticate } from "../middlerwares/landauthenticate.js";
import { uploadAny} from "../middlerwares/multer.js";
import multer from "multer";
import { uploadDocuments, resubmitLand } from "../controllers/LandController.js";


const router = express.Router();

// Route for getting all lands
router.route("/").get(getAllLands);

// Route for getting, updating, and deleting land by ID
router.route("/:id")
  .get(getLandById) // Get land by ID
  .put(authenticate, updateLandById) // Update land by ID (protected route)
  .delete(authenticate, deleteLandById); // Delete land by ID (protected route)

// Route for getting land by type
router.get('/type/:landtype', getLandByType); // Changed to `/type/:landtype` for clarity

// Route for getting lands by user ID (owner)
router.route("/owner/:userId")
.get(getLandByUserId)
.put(updateLandsBySameUser); // Changed to `/owner/:userId` for clarity

// Route for getting lands by username
router.route("/user/:username").get(getLandsByUser); // Username-based search

router.post("/create-land", authenticate, uploadAny, createLand);

// Upload documents for a land
router.post("/documents/upload/:landId", authenticate, uploadAny, uploadDocuments);
router.put("/:id/resubmit", authenticate, resubmitLand);





router.route("/:id/reviews").get(getLandReviews).post(authenticate, createReview).delete(
// Make sure this route matches your params
  authenticate, // Assuming you have authentication middleware
  deleteReview
);
router.get("/land/:landId", async (req, res) => {
  const { landId } = req.params;

  try {
    const messages = await messages.find({ land: landId })
      .sort({ timestamp: 1 }); // sort oldest → newest

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

  
export default router;
