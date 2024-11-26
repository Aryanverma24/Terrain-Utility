import jwt from "jsonwebtoken";
import User from '../modals/UserModal.js';  // Correct path depending on your folder structure
import Land from "../modals/LandModal.js";
import asyncHandler from "../middlerwares/asyncHandler.js";
import { Types } from 'mongoose'; 

// Create Land
const createLand = asyncHandler(async (req, res) => {
  console.log("Body data received:", req.body);
  console.log("File data received:", req.file);

  const { landtype, city, state, pincode } = req.body;
  const { userId, username: userName } = req.user;  // From the authenticated user (using req.user)

  // Validate input fields
  if (!landtype || !city || !state || !pincode || !req.file) {
    return res.status(400).send("All fields are required, including image!");
  }

  try {
    const land = new Land({
      landtype,
      city,
      state,
      pincode,
      image: req.file.filename, // Save image filename
      owner: userId,      // Owner ID from authenticated user
      ownerName: userName // Owner name from authenticated user
    });

    console.log("Created Land:", land);

    // Save to the database
    await land.save();

    // Return the created land document as the response
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
const getLandById = asyncHandler(async (req, res) => {
  const land = await Land.findById(req.params.id);
  if (land) {
    res.status(200).send(land);
  } else {
    res.status(400).send("Land not found!");
  }
});

// Get lands by user ID (this is now managed by req.user)
const getLandByUserId = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;  // From the authenticated user (req.user set by authenticate middleware)
    const ownerLands = await Land.find({ owner: userId });
    res.status(200).json(ownerLands);
  } catch (error) {
    res.status(400).send("User lands not found!");
  }
});


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
const getLandbyUser = asyncHandler(async (req, res) => {
  try {
    const username = req.params.username;

    const user = await User.find({ username: username });
    const userId = user[0]._id;
    const ownerLands = await Land.find({ owner: userId });
    res.send(ownerLands);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching lands" });
  }
});
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
    const { landId, userId } = req.params; // Extract the landId and userId from the URL params
    const decodedUserId = req.userId; // Assume req.userId is set from the JWT middleware (use token verification)

    // Check if the userId from the request matches the logged-in user's ID
    if (decodedUserId !== userId) {
      return res.status(403).json({ message: "You can only delete your own review." });
    }

    const land = await Land.findById(landId);

    if (!land) {
      return res.status(404).json({ message: "Land not found." });
    }

    // Find the review and remove it
    const reviewIndex = land.reviews.findIndex(review => review.user.toString() === userId);
    
    if (reviewIndex === -1) {
      return res.status(404).json({ message: "Review not found." });
    }

    // Remove the review from the land document
    land.reviews.splice(reviewIndex, 1);
    await land.save();

    res.status(200).json({ message: "Review deleted successfully." });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: "Server error." });
  }
};







// Get lands by type
const getLandByType = asyncHandler(async (req, res) => {
  const { landtype } = req.params;
  const lands = await Land.find({ landtype: landtype });
  res.json(lands);
});


export {
  createLand,
  getAllLands,
  getLandById,
  getLandByUserId,
  updateLandById,
  deleteLandById,
  getLandReviews,
  getLandbyUser,
  getLandByType,
  deleteReview,
};
