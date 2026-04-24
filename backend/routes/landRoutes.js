import express from 'express';
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
  updateLandsBySameUser,
  getLawyerLands,
  getCitiesWithVerifiedLands,
  markInterested,
  unmarkInterested,
  getInterestedUsers,
  getLandDashboard,
  geoVerifyLand,
  saveLawyerDeclaration,
  // updateInterestStatus
} from '../controllers/LandController.js';

import { authenticate } from '../middlerwares/landauthenticate.js';
import upload from '../utils/multerConfig.js';
import multer from 'multer';
import { uploadDocuments, resubmitLand } from '../controllers/LandController.js';

const router = express.Router();

// Route for getting all lands
router.route('/get-land').get(getAllLands);

// Route for getting, updating, and deleting land by ID
router
  .route('/:id')
  .get(getLandById) // Get land by ID
  .put(authenticate, updateLandById) // Update land by ID (protected route)
  .delete(authenticate, deleteLandById); // Delete land by ID (protected route)

// Route for getting land by type
router.get('/type/:landtype', getLandByType); // Changed to `/type/:landtype` for clarity

// Route for getting lands by user ID (owner)
router.route('/owner/:userId').get(getLandByUserId).put(updateLandsBySameUser); // Changed to `/owner/:userId` for clarity

// Route for getting lands by username
router.route('/user/:username').get(getLandsByUser); // Username-based search
//route for creating a land
router.post('/create-land', authenticate, upload.any(), createLand);

// Upload documents for a land
router.post('/documents/upload/:landId', authenticate, upload.any(), uploadDocuments);
router.put('/:id/resubmit', authenticate, resubmitLand);
router.get('/lawyer/:lawyerId', getLawyerLands);

router.get('/cities/verified', getCitiesWithVerifiedLands);

router
  .route('/:id/reviews')
  .get(getLandReviews)
  .post(authenticate, createReview)
  .delete(authenticate, deleteReview);
//route for geo cooridnate verification
router.put('/geo-verify/:id', authenticate, geoVerifyLand);

router.put('/lawyer-declaration/:id', authenticate, saveLawyerDeclaration);
// the roytes for intrest users
router.route('/:landId/interested').post(authenticate, markInterested);
router.route('/:landId/uninterested').post(authenticate, unmarkInterested);
router.route('/:landId/interested-users').get(authenticate, getInterestedUsers);
// router.put("/update-status", authenticate,updateInterestStatus);
//route for getitng ownership history
router.get('/dashboard/:id', getLandDashboard);

export default router;
