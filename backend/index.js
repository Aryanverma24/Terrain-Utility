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

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
