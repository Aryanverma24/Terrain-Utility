import express from "express";
import User from "../modals/UserModal.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";



import { 
    createUser,
    loginUser,
    logout,
    getCurrentUserProfile,
    updateCurrentUserProfile,
    getAllUser,
    deleteUser,
    getUserById,
    updateUserById,
    getLawyers,
    uploadUserDocuments,
    getMyDocuments,
    getPendingUserDocuments,
    updateUserDocumentStatus,
reuploadUserDocumentHandler, 
getApprovedUsersByLawyer,
getUserDocumentsByUserId
} from '../controllers/UserController.js'

const router = express.Router();
import { authenticate,authorizeAdmin } from "../middlerwares/authMiddlewares.js";
import { roleAuth } from "../middlerwares/roleAuth.js";
import upload from "../utils/multerConfig.js";

//reupload document
router.put(
  "/file/:docId/reupload",
  (req, res, next) => {
    console.log("Headers:", req.headers);
    next();
  },authenticate,
  upload.single("file"),
  reuploadUserDocumentHandler
);
//home route
router.route("/").get( getAllUser);

router.route("/register").post(createUser)
//login logout 
// LOGIN USER
router.post("/auth", async (req, res) => {
  const { email, password, role } = req.body;
  console.log("Login request body:", req.body);

  try {
    const user = await User.findOne({ email });
    console.log("User found:", user);

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!user.password) {
      return res.status(400).json({ message: "User has no password set" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!user.role) {
      return res.status(400).json({ message: "User role not set" });
    }

    if (role !== user.role) {
      return res.status(400).json({ message: "Incorrect login type!" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in .env");
      return res.status(500).json({ message: "Server misconfiguration" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: { _id: user._id, username: user.username, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Auth route error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
//user upload document
router.post(
  "/upload-user-docs",
  authenticate,
 upload.any(), 
  uploadUserDocuments
);
//for user to see his uploaded docs 
router.get("/my-documents", authenticate, getMyDocuments);

//  Get all pending user docs (for lawyers)
router.get("/pending", authenticate, getPendingUserDocuments);

//  Update document status
router.put("/file/:docId/:status", authenticate, updateUserDocumentStatus);

// Only lawyer can access lawyer dashboard API
router.get("/lawyer/data", roleAuth("lawyer"), (req, res) => {
  res.json({ message: "Lawyer authorized" });
});

router.route("/logout").post(logout);
//route for getting approved users in my land for lawyer 
router.get(
  "/approved-users",
  authenticate,
  getApprovedUsersByLawyer
);
//route for the funtion to show documents approved for laawyer
router.get(
  "/user-documents/:userId",
  authenticate,
  getUserDocumentsByUserId
);
router.get("/lawyers",authenticate,getLawyers);
//profile update

router.route("/profile")
.get(authenticate, getCurrentUserProfile )
.put(authenticate,updateCurrentUserProfile)

//admin routes

router.route("/:id")
    .delete(deleteUser)
    .get(authenticate,authorizeAdmin,getUserById)
    .put(authenticate,authorizeAdmin,updateUserById)

export default router;
