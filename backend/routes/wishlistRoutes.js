import express from 'express';
import { authenticate, authorizeAdmin } from '../middlerwares/authMiddlewares.js';
import {
  addToWishlist,
  userWishlist,
  deleteFromWishlist,
} from '../controllers/WishlistController.js';

const router = express.Router();

router.route('/:userId').get(userWishlist);

router.route('/:userId/:landId').post(addToWishlist).delete(deleteFromWishlist);

export default router;
