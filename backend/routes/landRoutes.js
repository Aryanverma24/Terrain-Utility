import express from "express";
import { 
    createLand,
    getAllLands,
    getLandById,
    getLandByUserId,
    updateLandById,
    deleteLandById,
    getLandbyUser,
    getLandByType
} from "../controllers/LandController.js";


const router = express.Router();

router.route("/").post(createLand).get(getAllLands)

router.route("/:id").get(getLandById).put(updateLandById).delete(deleteLandById)

router.route("/:landType").get(getLandByType);
router.route("/owner/:id").get(getLandByUserId);

router.route("/user/:username").get(getLandbyUser);
export default router