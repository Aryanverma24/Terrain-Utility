import jwt from "jsonwebtoken";
import User from '../modals/UserModal.js';  // Correct path depending on your folder structure
import Land from "../modals/LandModal.js";
import asyncHandler from "../middlerwares/asyncHandler.js";
import { mongo, Types } from 'mongoose'; 

// Create Land
const createLand = asyncHandler(async (req, res) => {
  console.log("Body data received:", req.body);
  console.log("File data received:", req.file);
  console.log("Authenticated user:", req.user); // 👈 Debug this

  const { landtype, city, state, pincode } = req.body;
  const { id, username } = req.user;  // ✅ Correct destructuring

  if (!landtype || !city || !state || !pincode || !req.file) {
    return res.status(400).send("All fields are required, including image!");
  }

  try {
    const land = new Land({
      landtype,
      city,
      state,
      pincode,
      image: req.file.filename,
      owner: id,            // ✅ Fixed: use direct id
      ownerName: username
    });

    console.log("Created Land Object:", land);

    await land.save();

    return res.status(201).json(land);
  } catch (error) {
    console.error("Error during land creation:", error);
    return res.status(500).send("Unable to save in database");
  }
});


// Get all lands
const getAllLands = asyncHandler(async (req, res) => {
  try {
    const lands = await Land.find({}); // Fetch all lands

    // Calculate average rating for each land
    const landsWithAverageRating = lands.map((land) => {
      const ratings = land.ratings; // Assuming land has a 'ratings' field (array)
      let averageRating = 0;
      
      if (ratings && ratings.length > 0) {
        // Calculate average rating
        averageRating = ratings.reduce((acc, rating) => acc + rating, 0) / ratings.length;
      }

      // Return land with calculated averageRating
      return {
        ...land.toObject(),
        averageRating: averageRating || 0, // Default to 0 if no ratings
      };
    });

    // Return lands with average ratings
    res.status(200).json(landsWithAverageRating);
  } catch (error) {
    console.error("Error fetching lands:", error);
    res.status(500).send("Error fetching land data");
  }
});

// Get land by ID
import mongoose from "mongoose";

const getLandById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid land ID." });
    }

    const land = await Land.findById(id);

    if (!land) {
      return res.status(404).json({ message: "Land not found." });
    }

    res.status(200).json(land);
  } catch (error) {
    console.error("Error fetching land:", error);
    res.status(500).json({ message: "An error occurred while fetching the land." });
  }
});



// Get lands by user ID (this is now managed by req.user)
const getLandByUserId = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid User ID" });
    }

    const allands = await Land.find();
    
    const lands = allands.filter((land) => land.owner.toString() === userId)
   // console.log(lands)
    if (!lands.length) {
      return res.status(404).json({ message: "No lands found for this user" });
    }

    res.status(200).json({ data: lands });
  } catch (error) {
    console.error("Error fetching lands by userId:", error);
    res.status(500).json({ message: "Server error occurred" });
  }
});



const updateLandsBySameUser = asyncHandler(async(req,res) => {

    try {
      const {userId} = req.params;
      const {username} = req.body;
      if(!mongoose.Types.ObjectId.isValid(userId)){
        return res.status(400).send("unexpected error occured")
      }

    const filteredLands = await Land.updateMany({
      owner : userId
    }, {
      $set : { ownerName : username || ownerName}
    })
      res.status(200).json({filteredLands})
    } catch (error) {
      res.status(500).send({message : "error ocuured"})
    }
})

// Update land by ID
const updateLandById = asyncHandler(async (req, res) => {
  const land = await Land.findById(req.params.id);

  const { landtype, city, pincode, state, owner } = req.body;

  if (land) {
    // Update fields if provided, otherwise keep current values
    land.landtype = landtype || land.landtype;
    land.city = city || land.city;
    land.state = state || land.state;
    land.pincode = pincode || land.pincode;

    if (owner) {
      // Fetch the user if owner update is requested
      const checkOwner = await User.find({ username: owner });
      if (checkOwner && checkOwner.length > 0) {
        const ownerId = checkOwner[0]._id;
        const ownerName = checkOwner[0].username;
        land.owner = ownerId || land.owner;
        land.ownerName = ownerName || land.ownerName;
      } else {
        return res.status(400).send("User not found");
      }
    }

    // Save the updated land to the database
    const updatedLand = await land.save();

    // Return the updated data in the response
    res.status(200).json(updatedLand);
  } else {
    res.status(400).send("Land not found!");
  }
});

// Delete land by ID
const deleteLandById = asyncHandler(async (req, res) => {
  const landId = req.params.id;

  if (landId) {
    await Land.findByIdAndDelete(landId);
    res.status(200).send("Land successfully removed!");
  } else {
    res.status(400).send("Land not found");
  }
});

// Get lands by username (alternative method)
const getLandsByUser = async (req, res) => {
  try {
    const { username } = req.params;  // Fetch the username from the URL parameters

    // Find lands where the ownerName matches the username
    const lands = await Land.find({ ownerName: username });

    if (!lands || lands.length === 0) {
      return res.status(200).json({ message: "No lands found for this user." });
    }

    res.status(200).json(lands);
  } catch (error) {
    console.error("Error fetching lands:", error);
    res.status(500).json({ message: "Server error while fetching lands." });
  }
};

const getLandReviews = async (req, res) => {
  try {
    const land = await Land.findById(req.params.id).populate('reviews.user', 'username'); // Populate reviews with user details (username)
    
    if (!land) {
      return res.status(404).json({ message: 'Land not found' });
    }
    
    // Extracting and returning reviews from the land object
    const reviews = land.reviews;

    res.status(200).json(reviews); // Send the reviews as response
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Delete review by userId
// Delete review// Delete review


const deleteReview = async (req, res) => {
  try {
    const { landId, userId } = req.params;
    const decodedUserId = req.user.id; // Access user ID from req.user.id

    console.log("Decoded User ID:", decodedUserId);
    console.log("User ID from request:", userId);

    if (decodedUserId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can only delete your own review." });
    }

    const land = await Land.findById(landId);
    if (!land) {
      return res.status(404).json({ message: "Land not found." });
    }

    const reviewIndex = land.reviews.findIndex(
      (review) => review.user.toString() === userId
    );

    if (reviewIndex === -1) {
      return res.status(404).json({ message: "Review not found." });
    }

    land.reviews.splice(reviewIndex, 1);
    await land.save();

    res.status(200).json({ message: "Review deleted successfully." });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: "Server error." });
  }
};











// Get lands by type
// Backend: Controller to fetch lands by landtype
const getLandByType = async (req, res) => {
  const { landtype } = req.params;  // Get the landtype from the URL parameter

  if (!landtype) {
    return res.status(400).json({ message: "Land type is required" });  // Ensure landtype is provided
  }

  try {
    // Use a case-insensitive regex query to find lands by landtype
    const lands = await Land.find({
      landtype: { $regex: new RegExp(`^${landtype}$`, 'i') } // 'i' makes the regex case-insensitive, '^' and '$' to match the exact value
    });

    if (lands.length === 0) {
      return res.status(404).json({ message: `No lands found for type: ${landtype}` });
    }

    // Successfully found lands
    res.status(200).json(lands);  
  } catch (error) {
    console.error('Error fetching lands:', error);
    res.status(500).json({ message: 'Failed to fetch lands due to a server error.' });
  }
};






export {
  createLand,
  getAllLands,
  getLandById,
  getLandByUserId,
  updateLandById,
  deleteLandById,
  getLandReviews,
  getLandsByUser,
  getLandByType,
  deleteReview,
  updateLandsBySameUser
};
