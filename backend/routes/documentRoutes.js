import express from "express";
import multer from "multer";
import Land from "../modals/LandModal.js";
import { authenticate } from "../middlerwares/landauthenticate.js";
import { uploadDocuments } from "../controllers/documentController.js";
import path from "path";
import { uploadAny } from "../middlerwares/multer.js";
import Document from "../modals/DocumentModal.js";
import { roleAuth} from "../middlerwares/roleAuth.js";
import Notification from "../modals/NotificationModal.js";
import User from "../modals/UserModal.js"
import asyncHandler from "../middlerwares/asyncHandler.js";
const router = express.Router();
import upload from "../utils/multerConfig.js";
import {io} from "../index.js";
// Multer setup for file uploads

router.post(
  "/api/documents/upload/:landId",
  authenticate,
  uploadAny,
  uploadDocuments
);
router.get("/:id", async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Only lawyers can update document status
// Update status of a single document inside a collection
// PUT /api/documents/file/:subDocId/:status
router.put("/file/:subDocId/:status", asyncHandler(async (req, res) => {
  const { subDocId, status } = req.params;

  if (!["approved", "rejected", "pending"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  // Find the parent document containing this subDoc
  const parentDoc = await Document.findOne({ "documents._id": subDocId });
  if (!parentDoc) return res.status(404).json({ message: "Document not found" });

  // Update the sub-document status
  const subDoc = parentDoc.documents.id(subDocId);
  subDoc.status = status;
  await parentDoc.save();

  // Create notification for owner
  const notification = await Notification.create({
    userId: parentDoc.owner, // assuming owner field exists on parent document
    title: `Document ${status}`,
    message: `Your document "${subDoc.type}" was ${status} by the lawyer.`,
  });

  // Optional: emit via socket.io if you have io
  if (req.app.get("io")) {
    const io = req.app.get("io");
    io.to(parentDoc.owner.toString()).emit("new-notification", notification);
  }

  res.status(200).json({
    message: "Document status updated",
    document: subDoc,
    notification,
  });
}));



// Reupload a rejected document
router.put(
  "/:docId/reupload",
  authenticate,
  upload.single("file"),
  asyncHandler(async (req, res) => {
    const { docId } = req.params;

    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // Find the parent document containing this sub-document
    const parentDoc = await Document.findOne({ "documents._id": docId });
    if (!parentDoc) return res.status(404).json({ message: "Document not found" });

    // Find the specific sub-document
    const subDoc = parentDoc.documents.id(docId);
    if (!subDoc) return res.status(404).json({ message: "Sub-document not found" });

    // Only allow reupload if status is rejected
    if (subDoc.status !== "rejected")
      return res.status(400).json({ message: "Only rejected documents can be reuploaded" });

    // Update the file name and reset status to pending
    subDoc.file = req.file.filename;
    subDoc.status = "pending";

    await parentDoc.save();

    // Notify all lawyers
    const land = await Land.findById(parentDoc.land);
    const lawyers = await User.find({ role: "lawyer" });
    for (const lawyer of lawyers) {
      const notif = new Notification({
        userId: lawyer._id,
        title: "Document Reuploaded",
        message: `${req.user.username} reuploaded a document for land in ${land.city}.`,
        targetRole: "lawyer",
      });
      await notif.save();
      io.to(lawyer._id.toString()).emit("receive-notification", notif);
    }

    res.status(200).json({
      message: "Document reuploaded successfully",
      document: subDoc,
    });
  })
);




 export default router;
