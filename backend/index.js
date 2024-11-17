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
import Land from "./modals/LandModal.js";
import path from 'path';
import { fileURLToPath } from 'url';

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

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
