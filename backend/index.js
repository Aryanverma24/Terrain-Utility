import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import bodyParser from "body-parser";

import jwt from "jsonwebtoken";
// Import utilities and routes
import dbConnect from "./config/db.js";  // Custom DB connection
import userRoutes from "./routes/userRoutes.js";
import landRoutes from "./routes/landRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js"
import chatRoutes from "./routes/ChatRoutes.js";  // Default import

import { authenticate } from "./middlerwares/landauthenticate.js";
import { createLand, deleteReview } from "../backend/controllers/LandController.js";
import Land from "./modals/LandModal.js";
import User from "./modals/UserModal.js";
import { loginUser } from "./controllers/UserController.js";
import { Server } from 'socket.io';
import http from 'http';
import Message from "./modals/messageModel.js";

import chatAuthenticate from "./middlerwares/chatMiddleware.js";

// Get __dirname for ES Module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize app
dotenv.config();
const app = express();
const port = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,  // Update with your frontend URL
    methods: ["GET", "POST"],
    credentials: true
  }
});

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

let rooms = {}; // In-memory object to store messages for each room

// Handling socket.io connections
io.on("connection", (socket) => {
  console.log("A user connected");

  // Join a specific room for messaging
  socket.on("joinRoom", ({ room, senderId, receiverId }) => {
    socket.join(room);
    console.log(`User ${senderId} joined room: ${room}`);

    // Send previous messages for the room if available
    if (rooms[room]) {
      socket.emit("message", rooms[room]);  // Send all previous messages
    }
  });

  // Handle sending a new message
  socket.on("sendMessage", async ({ room, senderId, receiverId, message }) => {
    const msg = {
      room,
      senderId,
      receiverId,
      message,
      timestamp: new Date(),
    };

    try {
      // Save the message to the database
      const newMessage = await Message.create(msg);  // Save message to DB
      console.log("Message saved to DB:", newMessage); // Log saved message

      // Store the message in memory for the room (optional)
      if (!rooms[room]) {
        rooms[room] = [];
      }
      rooms[room].push(newMessage);  // Push new message to in-memory room

      // Broadcast the new message to the room
      io.to(room).emit("message", newMessage);  // Emit to all clients in the room
    } catch (error) {
      console.error("Error saving message to DB:", error);
    }
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});
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
app.use("/api/wishlist",wishlistRoutes)
app.use('/api/messages', chatRoutes);  // Chat routes integration

//add user face data
app.post('/api/add-face', async (req, res) => {
  const { email, faceDescriptor } = req.body;

  if (!email || !faceDescriptor) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // MongoDB me save/update
    const user = await User.findOneAndUpdate(
      { email },
      { $set: { faceDescriptor } },
      { new: true }
    );

    console.log("✅ Data Saved in DB:", user);
    res.status(200).json({ success: true, message: "Face data stored successfully!" });

  } catch (error) {
    console.error("❌ Error Saving Face Data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Euclidean Distance function
const euclideanDistance = (arr1, arr2) => {
  if (arr1.length !== arr2.length) return Infinity;
  return Math.sqrt(
    arr1.reduce((sum, val, i) => sum + Math.pow(val - arr2[i], 2), 0)
  );
};

app.post("/api/face-login", async (req, res) => {
  const { faceDescriptor } = req.body;

  if (!faceDescriptor) {
    return res.status(400).json({ message: "Face data is required!" });
  }

  try {
    const users = await User.find();
    let bestMatch = null;
    let minDistance = Infinity;

    const inputDescriptor = new Float32Array(faceDescriptor);

    users.forEach(user => {
      if (user.faceDescriptor && user.faceDescriptor.length > 0) {
        const dbDescriptor = new Float32Array(user.faceDescriptor);
        const distance = euclideanDistance(dbDescriptor, inputDescriptor);

        if (distance < minDistance) {
          minDistance = distance;
          bestMatch = user;
        }
      }
    });

    console.log("🔍 Best Match Distance:", minDistance);

    const THRESHOLD = 0.5; // default ~0.4–0.6
    if (bestMatch && minDistance < THRESHOLD) {
      // ✅ JWT Generate
      const token = jwt.sign(
        { userId: bestMatch._id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.status(200).json({
        success: true,
        message: "Face recognized!",
        token,
        user: {
          _id: bestMatch._id,
          username: bestMatch.username,
          email: bestMatch.email,
          city: bestMatch.city,
          state: bestMatch.state,
          contactNumber: bestMatch.contactNumber,
          age: bestMatch.age,
          gender: bestMatch.gender,
          isAdmin: bestMatch.isAdmin,
          createdAt: bestMatch.createdAt,
          updatedAt: bestMatch.updatedAt
        },
      });
    } else {
      return res.status(401).json({ success: false, message: "Face not recognized!" });
    }
  } catch (error) {
    console.error("❌ Face Login Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



app.get('/api/messages/:landId/:userId/:ownerId', async (req, res) => {
  const { landId, userId, ownerId } = req.params;
  try {
      const messages = await Message.find({
          $or: [
              { senderId: userId, receiverId: ownerId, landId },
              { senderId: ownerId, receiverId: userId, landId }
          ]
      }).sort({ timestamp: 1 });

      res.json(messages);
  } catch (error) {
      res.status(500).json({ error: 'Server error' });
  }
});

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

// Reviews and Update Land Details
app.get('/api/lands/:id/reviews-with-usernames', async (req, res) => {
  console.log(req.params)
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
        username: review?.user?.username || 'Anonymous',
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
      username : req.user.username
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

app.put('/api/lands/:id/update-details', authenticate, async (req, res) => {
  const { id } = req.params;
  const { city, state, pincode, ownerName } = req.body;

  try {
    const updatedLand = await Land.findByIdAndUpdate(id, { city, state, pincode ,ownerName }, { new: true });

    if (!updatedLand) {
      return res.status(404).json({ message: 'Land not found' });
    }

    return res.status(200).json({ message: 'Land details updated successfully', updatedLand });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
});
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();  // Assuming this fetches all users
    if (Array.isArray(users)) {
      res.json(users);
    } else {
      res.status(500).json({ error: "Invalid response format from server" });
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});


// Start server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
