
import Land from "../modals/LandModal.js";
import asyncHandler from "../middlerwares/asyncHandler.js";
import Wishlist from "../modals/wishlist.js";

const addToWishlist = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { landId } = req.params;

    console.log("User ID:", userId);
    console.log("Land ID:", landId);

    try {
        // Ensure user is logged in
        if (!userId) {
            return res.status(400).json({ message: "Login first" });
        }

        // Ensure land ID is provided
        if (!landId) {
            return res.status(400).json({ message: "Land is required" });
        }

        // Check if the land exists
        const land = await Land.findById(landId);
        if (!land) {
            return res.status(400).json({ message: "Land not found" });
        }

        // Check if the wishlist exists for the user
        let wishlist = await Wishlist.findOne({ user: userId });

        if (!wishlist) {
            // Create a new wishlist if it doesn't exist
            wishlist = new Wishlist({
                user: userId,
                lands: [landId]
            });
        } else {
            // Add the land to the existing wishlist if it's not already there
            if (!wishlist.lands.includes(landId)) {
                wishlist.lands.push(landId);
            }
        }

        // Save the updated wishlist
        await wishlist.save();

        console.log("Wishlist updated successfully!");

        // Send the updated wishlist in the response
        res.status(200).json({
            message: "Wishlist updated successfully!",
            wishlist // Send the updated wishlist back
        });
    } catch (error) {
        console.error("Error adding to wishlist:", error);
        res.status(500).json({ message: "Internal server error!" });
    }
});


const userWishlist = asyncHandler(async(req,res)=>{
    const {userId} = req.params;
    if(!userId){
        res.status(400).json({message : "user id missing"})
    }
    const wishlist = await Wishlist.find({
        user : userId
    })

    if(!wishlist){
       return res.status(400).json({message : "wishlist is not exist for user"})
    }
    return res.status(200).json(wishlist)
}) 

const deleteFromWishlist = asyncHandler(async(req,res)=>{
    const {userId} = req.params;
    const {landId} = req.params;

    console.log("User Id : " , userId)
    console.log("Land Id : ",landId)

    try {
        // Ensure user is logged in
        if (!userId) {
            return res.status(400).json({ message: "Login first" });
        }
        // Ensure land ID is provided
        if (!landId) {
            return res.status(400).json({ message: "Land is required" });
        }
        const wishlist = await Wishlist.findOne({user : userId})

        if(!wishlist){
           return res.status(400).json({message : "wishlist not found"})
        }

        if(!wishlist.lands.includes(landId)){
            return res.status(400).json({message : "land not found in your wishlist"})
        }

        wishlist.lands = wishlist.lands.filter((land) => land.toString() !== landId );
         await wishlist.save();

         res.status(200).json({message  : "wishlist successfully updated"})
    } catch (error) {
        console.error("Error adding to wishlist:", error);
        res.status(500).json({ message: "Internal server error!" });
    }
})

export {
    addToWishlist,
    userWishlist,
    deleteFromWishlist
}