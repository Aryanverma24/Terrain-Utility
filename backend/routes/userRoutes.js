import express from "express";

import { 
    createUser,
    loginUser,
    logout,
    getCurrentUserProfile,
    updateCurrentUserProfile,
    getAllUser,
    deleteUser,
    getUserById,
    updateUserById

} from '../controllers/UserController.js'

const router = express.Router();
import { authenticate,authorizeAdmin } from "../middlerwares/authMiddlewares.js";

//home route
router.route("/").post(createUser).get(authenticate, authorizeAdmin, getAllUser);

//login logout 
router.route("/auth").post(loginUser)
router.route("/logout").post(logout)

//profile update

router.route("/profile")
.get(authenticate, getCurrentUserProfile )
.put(authenticate,updateCurrentUserProfile)

//admin routes

router.route("/:id")
    .delete(authenticate,authorizeAdmin,deleteUser)
    .get(authenticate,authorizeAdmin,getUserById)
    .put(authenticate,authorizeAdmin,updateUserById)

export default router;
