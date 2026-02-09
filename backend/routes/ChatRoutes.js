// routes/chatRoutes.js
import express from "express";
import {
  getOrCreateChat,
  getOwnerChats,
  getBuyerChats,
  getMessages,
  sendMessage,
} from "../controllers/ChatController.js";

const router = express.Router();

// Create or get chat between buyer and owner
router.post("/get-or-create", getOrCreateChat);

// Get all chats for owner or buyer
router.get("/owner/:ownerId", getOwnerChats);
router.get("/buyer/:buyerId", getBuyerChats);

// Get messages for a chat
router.get("/:chatId/messages", getMessages);

// Send a message
router.post("/send", sendMessage);

export default router;
