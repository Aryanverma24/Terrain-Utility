// controllers/LawyerController.js

import asyncHandler from "../middlerwares/asyncHandler.js";
import Land from "../modals/LandModal.js";
import mongoose from "mongoose";
import { io } from "../index.js";
import NotificationModal from "../modals/NotificationModal.js";

// Approve land (old simple method)
const approveLand = asyncHandler(async (req, res) => {
  const { landId } = req.params;

  const land = await Land.findById(landId);
  if (!land) return res.status(404).json({ message: "Land not found" });

  land.isApproved = true;
  await land.save();

  res.status(200).json({ message: "Land approved successfully", land });
});

// Fetch pending lands for lawyer
const getPendingLands = asyncHandler(async (req, res) => {
  try {
    const lands = await Land.find({ status: "pending" });
    res.status(200).json(lands);
  } catch (error) {
    console.error("Error fetching pending lands:", error);
    res.status(500).json({ message: "Server error while fetching pending lands" });
  }
});

// ⭐ Approve or reject land WITH NOTIFICATION
const approveOrRejectLand = asyncHandler(async (req, res) => {
  const { landId } = req.params;
  const { action, rejectionReason } = req.body;
  const lawyerId = req.user.id;

  const rejectionReasonValue =
    rejectionReason || req.body.reason || "No reason provided";

  if (!mongoose.Types.ObjectId.isValid(landId)) {
    return res.status(400).json({ message: "Invalid land ID" });
  }

  const land = await Land.findById(landId);
  if (!land) return res.status(404).json({ message: "Land not found" });

  // Update land based on action
  if (action === "approve") {
    land.status = "approved";
    land.approvedBy = lawyerId;
    land.rejectionReason = "";
  } else if (action === "reject") {
    land.status = "rejected";
    land.approvedBy = lawyerId;
    land.rejectionReason = rejectionReasonValue;
  } else {
    return res.status(400).json({ message: "Invalid action" });
  }

  await land.save();

  // Create notification
  const title =
    action === "approve"
      ? "Your land has been approved"
      : "Your land has been rejected";

  const message =
    action === "approve"
      ? `Your land "${land.landtype}" has been successfully approved by a lawyer.`
      : `Your land "${land.landtype}" was rejected. Reason: ${rejectionReasonValue}`;

  const notification = await NotificationModal.create({
    userId: land.owner,
    title,
    message,
    time: new Date(),
  });

  // Send realtime push
  io.to(land.owner.toString()).emit("receive-notification", {
    title,
    message,
    time: notification.time,
  });

  // Final Response
  res.status(200).json({
    message: `Land ${action}d successfully`,
    land,
  });
});

// EXPORTS
export {
  getPendingLands,
  approveOrRejectLand,
  approveLand,
};
