import mongoose from "mongoose";
import User from "./UserModal.js"
import Land from "./LandModal.js";

const WishlistSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: User, required: true },
    lands: [{ type: mongoose.Schema.Types.ObjectId, ref: Land }],
  },
  { timestamps: true }
);

const Wishlist = mongoose.model("Wishlist", WishlistSchema);
export default Wishlist;
