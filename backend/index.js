import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import bodyParser from "body-parser";

// Import utilities and routes
import dbConnect from "./config/db.js";  // Custom DB connection
import userRoutes from "./routes/userRoutes.js";
import landRoutes from "./routes/landRoutes.js";
import { chatRoutes } from "./routes/chatRoutes.js";  // Default import

import { authenticate } from "./middlerwares/landauthenticate.js";
import { createLand, deleteReview } from "../backend/controllers/LandController.js";
import Land from "./modals/LandModal.js";
import User from "./modals/UserModal.js"

import { getMessagesForLand } from "./controllers/ChatController.js";
import chatAuthenticate from "./middlerwares/chatMiddleware.js";

// Get __dirname for ES Module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize app
dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

// CORS options
const corsOption = {
  origin: "http://localhost:5173",
  methods: "POST,GET,DELETE,PUT,PATCH",
  credentials: true,
};

// Middleware
app.use(cors(corsOption));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Connect to MongoDB using the custom dbConnect
dbConnect();

// Serve static files for uploaded images
const uploadsPath = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + file.originalname;
    cb(null, uniqueSuffix);
  }
});
const upload = multer({ storage: storage });

// Routes
app.use("/api/users", userRoutes);
app.use("/api/lands", landRoutes);
app.use('/api', chatRoutes);  // Chat routes integration

// Land-related APIs
app.post(
  "/create-land",
  authenticate,
  upload.single('image'),
  createLand
);

app.get("/get-land", async (req, res) => {
  try {
    const lands = await Land.find({});
    const landsWithImageUrl = lands.map(land => {
      const imageURL = `/uploads/${land.image}`;
      return { ...land._doc, imageURL };
    });
    res.send({ status: "ok", data: landsWithImageUrl });
  } catch (error) {
    res.json({ status: "error", error: error.message });
  }
});

app.get("/user/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const lands = await Land.find({ ownerName: username }); // Assuming 'ownerName' is stored in Land model
    if (!lands) {
      return res.status(404).send("No lands found for this user.");
    }
    return res.status(200).json(lands);
  } catch (error) {
    console.error("Error fetching lands:", error);
    return res.status(500).send("Server error");
  }
});


app.get('/api/users/id/:username', async (req, res) => {
  try {
    const { username } = req.params;  // Get the username from the URL parameter
    const user = await User.findOne({ username }); // Search for the user by username

    if (!user) {
      return res.status(404).json({ message: 'User not found' });  // If user not found
    }

    // Send back the user ID in the response
    res.json({ userId: user._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch user ID' });
  }
});

// Reviews and Update Land Details
app.get('/api/lands/:id/reviews-with-usernames', async (req, res) => {
  try {
    const land = await Land.findById(req.params.id).populate({
      path: 'reviews.user',
      select: 'username',
    });

    if (!land) {
      return res.status(404).json({ error: 'Land not found' });
    }

    const formattedReviews = land.reviews.map((review) => ({
      review: review.review,
      rating: review.rating,
      user: {
        id: review.user._id,
        username: review.user.username || 'Anonymous',
      },
    }));

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

app.delete('/api/lands/:landId/reviews/:userId', authenticate, deleteReview);

app.post("/api/lands/:id/reviews", authenticate, async (req, res) => {
  const { id } = req.params;
  const { rating, review } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid land ID" });
  }

  if (!rating || !review || rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      message: "Invalid input. Please provide a review and a rating between 1 and 5.",
    });
  }

  try {
    const land = await Land.findById(id);
    if (!land) {
      return res.status(404).json({ success: false, message: "Land not found" });
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: "User is not authenticated" });
    }

    const newReview = {
      user: req.user.id,
      rating,
      review,
    };
    land.reviews.push(newReview);

    await land.save();
    const updatedLand = await Land.findById(id).populate("reviews.user", "name");

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

app.put('/api/lands/:id', authenticate, async (req, res) => {
  try {
    const { landtype, city, state, pincode } = req.body;
    const { id } = req.params;

    const land = await Land.findById(id);
    if (!land) {
      return res.status(404).json({ message: 'Land not found' });
    }

    if (land.ownerName !== req.user.username) {
      return res.status(403).json({ message: 'Unauthorized to update this land' });
    }

    land.landtype = landtype || land.landtype;
    land.city = city || land.city;
    land.state = state || land.state;
    land.pincode = pincode || land.pincode;

    const updatedLand = await land.save();
    res.status(200).json(updatedLand);
  } catch (error) {
    console.error('Error updating land:', error);
    res.status(500).json({ message: 'Failed to update land' });
  }
});




// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
