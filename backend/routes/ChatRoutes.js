// routes/chatRoutes.js
import mongoose from "mongoose";
import express from "express";
import Chat from "../modals/chatmodel.js";
import {
  getOrCreateChat,
  // getOwnerChats,
  // getBuyerChats,
  getMessages,
  sendMessage,
  getUnreadCount,
  getUserChats,
  markChatAsRead,
  getChatById,
  // getLawyerChats
} from "../controllers/ChatController.js";

// import User from "../modals/UserModal.js";
// import getMessagesByLand  from '../controllers/ChatController.js'
const router = express.Router();  // Initialize router

// Create or get chat between buyer and owner
router.post("/get-or-create", getOrCreateChat);

// Get all chats for owner or buyer or lawyer
// router.get("/buyer/:buyerId", getBuyerChats);
// router.get("/owner/:ownerId", getOwnerChats);
// router.get("/lawyer/:lawyerId", getLawyerChats);
router.get("/:chatId", getChatById); // ✅ ADD THIS
// Get messages for a chat
router.get("/:chatId/messages", getMessages);

// Send a message
router.post("/send", sendMessage);

// routes/chatRoutes.js
router.put("/read/:chatId/:userId", markChatAsRead);
router.get("/user/:userId", getUserChats);
router.get("/unread/:userId", getUnreadCount);
export default router;
