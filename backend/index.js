import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";
//utilities
import asyncHandler from "./middlerwares/asyncHandler.js";
import dbConnect from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import landRouter from "./routes/landRoutes.js";
import { authenticate } from "./middlerwares/landauthenticate.js";
import {createLand} from "../backend/controllers/LandController.js";
import { deleteReview } from '../backend/controllers/LandController.js';
import Land from "./modals/LandModal.js";
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import User from "../backend/modals/UserModal.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);




const corsOption = {
  origin: "http://localhost:5173",
  methods: "POST,GET,DELETE,PUT,PATCH",
  credentials: true,
};

const app = express();
dotenv.config();
app.use(cors(corsOption));

const port = process.env.PORT;

dbConnect();



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const uploadsPath = path.join(__dirname, '..', 'uploads');

// Serve the 'uploads' folder statically
app.use('/uploads', express.static(uploadsPath));

// File upload configuration with multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + file.originalname;
    cb(null, uniqueSuffix);
  }
});
const upload = multer({ storage: storage });

// Routes
app.use("/api/users", userRoutes);
app.use("/api/lands", landRouter);
app.post("/create-land", authenticate, upload.single('image'), (req, res, next) => {
  console.log("req.body:", req.body); // Should log landtype, city, state, pincode
  console.log("req.file:", req.file); // Should log the uploaded image file
  next();
}, createLand);
app.get("/get-land", async (req, res) => {
  try {
    const lands = await Land.find({});
    const landsWithImageUrl = lands.map(land => {
      const imageURL = `/uploads/${land.image}`; // Constructing the image URL
      console.log("Land image URL:", imageURL);  // Log the imageURL for debugging
      return { ...land._doc, imageURL };
    });
    res.send({ status: "ok", data: landsWithImageUrl });
  } catch (error) {
    res.json({ status: "error", error: error.message });
  }
});

app.get('/api/lands/owner/:ownerId', async (req, res) => {
  const { ownerId } = req.params;
  try {
    const lands = await Land.find({ owner: ownerId }); // Assuming 'owner' is the correct field in your schema
    res.json(lands);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching lands', error });
  }
});
// New API endpoint to get the username based on userId
app.get('/api/lands/:id/reviews-with-usernames', async (req, res) => {
  try {
    // Find the land by ID
    const land = await Land.findById(req.params.id).populate({
      path: 'reviews.user', // Populate the 'user' field in each review
      select: 'username',   // Only include the 'username' field
    });

    if (!land) {
      return res.status(404).json({ error: 'Land not found' });
    }

    // Format reviews to include username
    const formattedReviews = land.reviews.map((review) => ({
      review: review.review,
      rating: review.rating,
      user: {
        id: review.user._id, // User ID
        username: review.user.username || 'Anonymous', // Username or fallback
      },
    }));

    // Return the land details along with formatted reviews
    res.json({
      landtype: land.landtype,
      city: land.city,
      state: land.state,
      pincode: land.pincode,
      ownerName: land.ownerName,
      image: land.image,
      reviews: formattedReviews,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch land details with reviews' });
  }
});
// DELETE /api/lands/:landId/reviews/:userId
// DELETE /api/lands/:landId/reviews/:userId
// Backend route to delete review by userId or reviewId
app.delete('/api/lands/:landId/reviews/:userId', deleteReview);




// app.get("/api/lands/:id", async (req, res) => {
//   const { id } = req.params;

//   console.log("Received land ID:", id); // Debugging log

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ success: false, message: "Invalid land ID" });
//   }

//   try {
//       const land = await Land.findById(id)
//           .populate("owner", "name email")
//           .populate("reviews.user", "name");

//       if (!land) {
//           console.log(`Land with ID ${id} not found`);
//           return res.status(404).json({ success: false, message: "Land not found" });
//       }

//       console.log("Found land:", land); // Debugging log
//       res.status(200).json({ success: true, data: land });
//   } catch (error) {
//       console.error("Error fetching land details:", error);
//       res.status(500).json({ success: false, message: "Server error" });
//   }
// });

 // Make sure mongoose is imported

 app.post("/api/lands/:id/reviews", authenticate, async (req, res) => {
  const { id } = req.params;
  const { rating, review } = req.body;

  // Log the incoming request and user for debugging
  console.log(`Adding review to land ID: ${id}`);
  console.log("Request body:", req.body);
  console.log("Request user:", req.user); // Log the user object

  // Check if the land ID is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.log(`Invalid land ID: ${id}`); // Log invalid ID
    return res.status(400).json({ success: false, message: "Invalid land ID" });
  }

  // Validate rating and review
  if (!rating || !review || rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      message: "Invalid input. Please provide a review and a rating between 1 and 5.",
    });
  }

  try {
    // Find the land document
    const land = await Land.findById(id);
    if (!land) {
      return res.status(404).json({ success: false, message: "Land not found" });
    }

    console.log('Land found:', land); // Log the land

    // Ensure that req.user is populated before adding review
    if (!req.user) {
      return res.status(401).json({ success: false, message: "User is not authenticated" });
    }

    // Add the review to the reviews array
    const newReview = {
      user: req.user.id, // Attach the user ID to the review
      rating,
      review,
    };
    land.reviews.push(newReview);
    
    // Save the updated document
    await land.save();
    console.log('Updated land with review:', land); // Log the updated land

    // Populate user info in the response
    const updatedLand = await Land.findById(id).populate("reviews.user", "name");
    console.log("Updated land with populated reviews:", updatedLand); // Log the populated land

    return res.status(200).json({
      success: true,
      message: "Review added successfully.",
      data: updatedLand,
    });
  } catch (error) {
    console.error("Error adding review:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
});









// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
