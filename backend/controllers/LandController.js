import jwt from "jsonwebtoken";
import User from '../modals/UserModal.js';  
import Land from "../modals/LandModal.js";
import asyncHandler from "../middlerwares/asyncHandler.js";
import { mongo, Types } from 'mongoose'; 
import calculateAverageRating from "../utils/calculateAverageRating.js";
import mongoose from "mongoose";
import { approveOrRejectLand,getPendingLands } from "./LawyerController.js";
import { getRequesterFromHeader } from "../utils/getRequesterheader.js";
import Document  from "../modals/DocumentModal.js";
import Notification from "../modals/NotificationModal.js";
import { io } from "../index.js";
import { notifyLawyers } from "../utils/notifylawyers.js";
// ----------------------------------------------



// CREATE LAND
// ----------------------------------------------
// ----------------------------------------------
// CREATE LAND (Pending lawyer approval)
// ----------------------------------------------
 const createLand = asyncHandler(async (req, res) => {
  console.log("Body data received:", req.body);
  console.log("File data received:", req.file);
  console.log("Authenticated user:", req.user);

  const { landtype, city, state, pincode, price, length, breadth, description } = req.body;
  const { id, username } = req.user;

  // Validate required fields
  if (!landtype || !city || !state || !pincode || !price || !length || !breadth || !description || !req.file) {
    return res.status(400).send("All fields are required, including price, length, breadth, and image!");
  }

  // Build dimensionsString correctly
  const dimensionsString = `${length}*${breadth}`;

  try {
    const land = new Land({
      landtype,
      city,
      state,
      pincode,
      price,
      dimensions: { length, breadth },     // ⬅️ Correct nested object
      dimensionsString,                    // ⬅️ Correct string form
      description,
      image: req.file.filename,
      owner: id,
      ownerName: username,
      status: "pending",
      approvedBy: null,
    });

    await land.save();
    // Notify lawyers
const assignedLawyers = await User.find({ role: "lawyer" }); // or your logic to get assigned lawyers
    assignedLawyers.forEach(async (lawyer) => {
      const notif = new Notification({
        userId: lawyer._id,
        title: "Land requires review",
        message: "A land document needs your review",
        targetRole: "lawyer"
      });
      await notif.save();
      io.to(lawyer._id.toString()).emit("receive-notification", notif);
    });


    return res.status(201).json({
      message: "Land submitted successfully! Waiting for lawyer approval.",
      land
    });

  } catch (error) {
    console.error("Error in createLand:", error);
    return res.status(500).send("Unable to save in database");
  }
});

// Upload documents
const uploadDocuments = async (req, res) => {
  try {
    const { landId } = req.params;

    const land = await Land.findById(landId);
    if (!land) return res.status(404).json({ message: "Land not found" });
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ message: "No files uploaded." });

    const documentsArray = req.files.map((file) => ({
      type: file.fieldname,
      file: file.filename,
    }));

    const newDocument = new Document({
      land: land._id,
      owner: req.user.id,
      documents: documentsArray,
    });

    await newDocument.save();
    land.documents.push(newDocument._id);
    await land.save();

    // Notify all lawyers
    const lawyers = await User.find({ role: "lawyer" });
    for (const lawyer of lawyers) {
      const notif = new Notification({
        userId: lawyer._id,
        title: "New Document Uploaded",
        message: `${req.user.username} uploaded documents for land in ${land.city}.`,
        targetRole: "lawyer",
      });
      await notif.save();
      io.to(lawyer._id.toString()).emit("receive-notification", notif);
    }

    res.status(200).json({
      message: "Documents uploaded successfully!",
      documentId: newDocument._id,
      landDocuments: land.documents,
    });
  } catch (error) {
    console.error("Error uploading documents:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ----------------------------------------------
// GET ALL LANDS (Updated with calculateAverageRating)
// ----------------------------------------------
// REPLACEMENT: GET ALL LANDS
const getAllLands = asyncHandler(async (req, res) => {
  try {
    // Fetch all approved lands for normal users, all lands for lawyers
    const requester = getRequesterFromHeader(req);
    let lands;
    if (requester?.role === "lawyer") {
      lands = await Land.find({})
        .populate({
          path: "documents",
          populate: { path: "documents" }
        })
        .lean();
    } else {
      // Everyone else sees only approved lands
      lands = await Land.find({ status: "approved" })
        .populate({
          path: "documents",
          populate: { path: "documents" }
        })
        .lean();
    }

    // Add average rating
    const landsWithAverageRating = lands.map((land) => ({
      ...land,
      averageRating: calculateAverageRating(land.reviews)
    }));

    return res.status(200).json({ data: landsWithAverageRating });
  } catch (error) {
    console.error("Error fetching lands:", error);
    return res.status(500).send("Error fetching land data");
  }
});




// ----------------------------------------------
// REPLACEMENT: GET LAND BY ID
// GET LAND BY ID (UPDATED FULLY)
const getLandById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid land ID." });
  }

  const land = await Land.findById(id)
    .populate("reviews.user", "username")
    .populate("approvedBy", "username");

  if (!land) return res.status(404).json({ message: "Land not found." });

  // Determine requester (works for both logged-in and header token)
  let requester = null;
  if (req.user) {
    requester = { id: req.user._id?.toString(), role: req.user.role };
  } else {
    const decoded = getRequesterFromHeader(req);
    if (decoded) {
      requester = {
        id: (decoded.userId || decoded.id || decoded._id || "").toString(),
        role: decoded.role,
      };
    }
  }

  const averageRating = calculateAverageRating(land.reviews);

  // -------------------------------------------------------
  // 🔥 FETCH DOCUMENTS (for lawyer & owner only)
  // -------------------------------------------------------
  const fetchDocuments = async () => {
    const documentCollections = await Document.find({ land: land._id }).lean();

    return documentCollections.flatMap(dc =>
      (dc.documents || []).map(d => ({
        _id: dc._id,            // DocumentModel ID (for approval/rejection API)
        type: d.type,
        file: d.file,
        uploadedAt: d.uploadedAt,
        status: dc.status       // pending / approved / rejected
      }))
    );
  };

  // -------------------------------------------------------
  // Lawyer access — full visibility
  // -------------------------------------------------------
  if (requester?.role === "lawyer") {
    const docs = await fetchDocuments();

    return res.status(200).json({
      ...land.toObject(),
      averageRating,
      documents: docs,
    });
  }

  // -------------------------------------------------------
  // Owner access — must also see documents & statuses
  // -------------------------------------------------------
  if (requester?.id && land.owner?.toString() === requester.id) {
    const docs = await fetchDocuments();

    return res.status(200).json({
      ...land.toObject(),
      averageRating,
      documents: docs,
    });
  }

  // -------------------------------------------------------
  // Buyer/public access — ONLY approved land, NO documents
  // -------------------------------------------------------
  // Buyer/public access — show only land photos
// Buyer/public access — ONLY approved land, ONLY land photos
if (requester?.role !== "owner" && requester?.role !== "lawyer" && land.status === "approved") {
  const docs = await fetchDocuments();
  
  // Filter only documents with type "land photo"
  const landPhotos = docs.filter(d => d.type === "LandPhotos");
  
  return res.status(200).json({
    ...land.toObject(),
    averageRating,
    documents: landPhotos, // Only land photos sent
  });

}

  return res.status(403).json({ message: "You are not authorized to view this land." });
});

// api for reconsider button shown to user 
const resubmitLand = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid land ID" });
  }

  const land = await Land.findById(id);
  if (!land) return res.status(404).json({ message: "Land not found" });

  if (String(land.owner) !== String(req.user.id)) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  if (land.status !== "rejected") {
    return res.status(400).json({ message: "Only rejected land can be resubmitted" });
  }

  console.log("\n=== RESUBMISSION STARTED ===");

  // 1️⃣ Reset land status
  land.status = "pending";
  land.rejectionReason = "";

  // 2️⃣ Loop through each linked Document collection record
  for (const docRef of land.documents) {
    const docRecord = await Document.findById(docRef._id);

    if (!docRecord) continue;

    console.log(`Processing Document Record: ${docRecord._id}`);

    let changed = false;

    docRecord.documents.forEach((singleDoc) => {
      if (singleDoc.status === "rejected") {
        console.log(`→ resetting ${singleDoc._id} rejected → pending`);
        singleDoc.status = "pending";
        changed = true;
      }
    });

    if (changed) {
      await docRecord.save();
      console.log(`✔ Saved updates in Document Record ${docRecord._id}`);
    } else {
      console.log(`⚠ No rejected files inside Document Record ${docRecord._id}`);
    }
  }

  // 3️⃣ Save land
  await land.save();
 const assignedLawyers = await User.find({ role: "lawyer" }); // get all lawyers

assignedLawyers.forEach(async (lawyer) => {
  const notif = new Notification({
    userId: lawyer._id,
    title: "Land Resubmitted",
    message: `${req.user.username} has resubmitted the land in ${land.city}.`,
    targetRole: "lawyer",
  });

  await notif.save();
  io.to(lawyer._id.toString()).emit("receive-notification", notif);
});

  console.log("✔ Land saved and all rejected documents reset\n");

  res.json({
    message: "Land resubmitted. All rejected documents reset to pending.",
  });
});




// ----------------------------------------------
// GET LAND BY USER ID (Updated with averageRating)
// ----------------------------------------------
const getLandsByUser = async (req, res) => {
  try {
    const { username } = req.params;

    const lands = await Land.find({ ownerName: username });

    if (!lands || lands.length === 0) {
      return res.status(200).json({ message: "No lands found for this user." });
    }

    const landsWithRatings = lands.map((land) => ({
      ...land.toObject(),
      averageRating: calculateAverageRating(land.reviews)
    }));

    res.status(200).json(landsWithRatings);

  } catch (error) {
    console.error("Error fetching lands:", error);
    res.status(500).json({ message: "Server error while fetching lands." });
  }
};




// ----------------------------------------------
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


// ----------------------------------------------
// UPDATE LAND
// ----------------------------------------------
const updateLandById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid land ID." });
  }

  const land = await Land.findById(id);
  if (!land) {
    return res.status(404).json({ message: "Land not found!" });
  }

  try {
    const {
      landtype,
      city,
      pincode,
      state,
      owner,
      price,
      dimensions,
      dimensionsString,
      length,
      breadth,
      description,
      ratings,
      reviews,
      ...rest
    } = req.body;

    land.landtype = landtype || land.landtype;
    land.city = city || land.city;
    land.state = state || land.state;
    land.pincode = pincode || land.pincode;
    land.description=description|| land.description;

    if (price !== undefined) {
      const p = Number(price);
      land.price = Number.isNaN(p) ? land.price : p;
    }

    if (dimensions && typeof dimensions === "string") {
      const cleaned = dimensions.replace(/\s+/g, "");
      const sepMatch = cleaned.match(/(\d+)[\*xX](\d+)/);

      if (!sepMatch) {
        return res.status(400).json({ message: "Invalid dimensions format!" });
      }

      land.dimensions = {
        length: Number(sepMatch[1]),
        breadth: Number(sepMatch[2])
      };
      land.dimensionsString = dimensions;
    }

    if (owner) {
      const checkOwner = await User.find({ username: owner });
      if (!checkOwner.length) return res.status(400).send("User not found");

      land.owner = checkOwner[0]._id;
      land.ownerName = checkOwner[0].username;
    }

    const updatedLand = await land.save();
    res.status(200).json(updatedLand);

  } catch (err) {
    console.error("Error updating land:", err);
    res.status(500).json({ message: "Server error while updating land." });
  }
});


// ----------------------------------------------
// DELETE LAND
// ----------------------------------------------
const deleteLandById = asyncHandler(async (req, res) => {
  const landId = req.params.id;

  if (landId) {
    await Land.findByIdAndDelete(landId);
    res.status(200).send("Land successfully removed!");
  } else {
    res.status(400).send("Land not found");
  }
});


// ----------------------------------------------
// GET LANDS BY USERNAME (UPDATED WITH averageRating)
// ----------------------------------------------


// ----------------------------------------------
const getLandReviews = async (req, res) => {
  try {
    const land = await Land.findById(req.params.id).populate('reviews.user', 'username');
    
    if (!land) {
      return res.status(404).json({ message: 'Land not found' });
    }

    res.status(200).json(land.reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
//create review
const createReview = asyncHandler(async (req, res) => {
  const { id: landId } = req.params;
  const { review, rating } = req.body;
  const userId = req.user.id;

  const land = await Land.findById(landId);
  if (!land) return res.status(404).json({ message: "Land not found" });

  // Make sure to include username
  const newReview = {
    user: userId,
    username: req.user.username,  // ✅ add this
    review,
    rating,
    createdAt: new Date(),
  };

  land.reviews.push(newReview);
  await land.save();

  // Notify owner
  const ownerNotification = new Notification({
    userId: land.owner,
    title: "New Review Received",
    message: `${req.user.username} has posted a review for your land in ${land.city}.`,
    targetRole: "owner",
  });
  await ownerNotification.save();
  io.to(land.owner.toString()).emit("receive-notification", ownerNotification);

  res.status(201).json({ createdReview: newReview });
});

// ----------------------------------------------
const deleteReview = async (req, res) => {
  try {
    const { landId, userId } = req.params;

    if (req.user.id.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can only delete your own review." });
    }

    const land = await Land.findById(landId);
    if (!land) return res.status(404).json({ message: "Land not found." });

    const index = land.reviews.findIndex(
      (review) => review.user.toString() === userId
    );

    if (index === -1)
      return res.status(404).json({ message: "Review not found." });

    land.reviews.splice(index, 1);
    await land.save();
    const ownerNotification = new Notification({
  userId: land.owner,
  title: "Review Deleted",
  message: `${req.user.username} has deleted their review for your land in ${land.city}.`,
  targetRole: "owner",
});
await ownerNotification.save();

io.to(land.owner.toString()).emit("receive-notification", ownerNotification);

    res.status(200).json({ message: "Review deleted successfully." });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: "Server error." });
  }
};


// ----------------------------------------------
const getLandByType = asyncHandler(async (req, res) => {
  const { landtype } = req.params;

  if (!landtype) return res.status(400).json({ message: "Land type is required" });

  try {
    let lands;
    if (req.user && req.user.role === "lawyer") {
      lands = await Land.find({ landtype: { $regex: new RegExp(`^${landtype}$`, 'i') } });
    } else {
      lands = await Land.find({
        landtype: { $regex: new RegExp(`^${landtype}$`, 'i') },
        status: "approved"
      });
    }

    if (!lands.length) {
      return res.status(404).json({ message: `No lands found for type: ${landtype}` });
    }

    res.status(200).json(lands);
  } catch (error) {
    console.error('Error fetching lands by type:', error);
    res.status(500).json({ message: 'Server error while fetching lands' });
  }
});
const getLandByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid User ID" });
  }

  const alllands = await Land.find({ owner: userId });

  let lands;
  if (req.user && req.user.role === "lawyer") {
    lands = alllands; // Lawyer sees all lands
  } else {
    lands = alllands.filter((land) => land.status === "approved"); // Normal users only approved lands
  }

  if (!lands.length) {
    return res.status(404).json({ message: "No lands found for this user" });
  }

  const landsWithRatings = lands.map((land) => ({
    ...land.toObject(),
    averageRating: calculateAverageRating(land.reviews)
  }));

  res.status(200).json({ data: landsWithRatings });
});


// ----------------------------------------------
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
  updateLandsBySameUser,
  uploadDocuments,
  resubmitLand,
  createReview,
};
