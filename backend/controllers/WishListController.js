import Land from "../modals/LandModal.js";
import WishList from "../modals/WishListModal.js";
import User from "../modals/UserModal.js";
import asyncHandler from "../middlerwares/asyncHandler.js";

const addToWishlist = asyncHandler(async (req, res, next) => {
    try {
        const { userId, landId } = req.body;
        console.log(userId)
        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
    
        const land = await Land.findById(landId);
        if (!land) {
          return res.status(404).json({ message: "Land not found" });
        }
    
        let wishlist = await WishList.findOne({ user: userId });
        if (!wishlist) {
          wishlist = new WishList({ user: userId, lands: [landId] });
        } else {
          if (!wishlist.lands.includes(landId)) {
            wishlist.lands.push(landId);
          }
        }
    
        await wishlist.save();
        res.status(200).json({ message: "Land added to wishlist", wishlist });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
      }
});

const getWishlist = asyncHandler(async (req,res,next)=> {
    try {
        const { userId } = req.params;
    
        const wishlist = await WishList.findOne({ user: userId }).populate("lands");
        if (!wishlist) {
          return res.status(404).json({ message: "Wishlist not found" });
        }
    
        res.status(200).json(wishlist);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
      }
})
export {
    addToWishlist,
    getWishlist,
}