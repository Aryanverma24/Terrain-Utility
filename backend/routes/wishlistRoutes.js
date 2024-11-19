import express from "express";
import { addToWishlist, getWishlist } from "../controllers/WishListController.js"
const router = express.Router();

router.post("/", addToWishlist); // Add land to wishlist
router.get("/:userId", getWishlist);
export default router;