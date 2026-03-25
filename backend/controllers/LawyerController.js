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
const assignLawyer = async (req, res) => {
  try {
    const { landId } = req.params;
    const lawyerId = req.user.id; // from JWT middleware

    const land = await Land.findById(landId);

    if (!land) {
      return res.status(404).json({ message: "Land not found" });
    }

    // 🚫 If already assigned
    if (land.assignedLawyer && land.assignedLawyer.toString() !== lawyerId) {
      return res.status(403).json({
        message: "This land is already being handled by another lawyer",
      });
    }

    // ✅ Assign if not assigned
    land.assignedLawyer = lawyerId;
    await land.save();

    res.status(200).json({ message: "Land assigned successfully", land });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

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
  if (!land) {
    return res.status(404).json({ message: "Land not found" });
  }

  // ✅ Prepare update object (NO overwrite)
  let updateFields = {};

  if (action === "approve") {
    updateFields = {
      status: "approved",
      approvedBy: lawyerId,
      rejectionReason: "",
    };
  } else if (action === "reject") {
    updateFields = {
      status: "rejected",
      approvedBy: lawyerId,
      rejectionReason: rejectionReasonValue,
    };
  } else {
    return res.status(400).json({ message: "Invalid action" });
  }

  // 🔥 SAFE UPDATE (no validation crash)
  await Land.updateOne(
    { _id: landId },
    { $set: updateFields }
  );

  // ✅ Fetch updated land (for response + notification)
  const updatedLand = await Land.findById(landId);

  // Create notification
  const title =
    action === "approve"
      ? "Your land has been approved"
      : "Your land has been rejected";

  const message =
    action === "approve"
      ? `Your land "${updatedLand.landtype}" has been successfully approved by a lawyer.`
      : `Your land "${updatedLand.landtype}" was rejected. Reason: ${rejectionReasonValue}`;

  const notification = await NotificationModal.create({
    userId: updatedLand.owner,
    title,
    message,
    time: new Date(),
  });

  // Send realtime push
  io.to(updatedLand.owner.toString()).emit("receive-notification", {
    title,
    message,
    time: notification.time,
  });

  // Final Response
  res.status(200).json({
    message: `Land ${action}d successfully`,
    land: updatedLand,
  });
});

// EXPORTS
export {
  getPendingLands,
  approveOrRejectLand,
  approveLand,
assignLawyer,
};
