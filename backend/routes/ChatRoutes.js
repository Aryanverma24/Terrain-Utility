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
 startLegalProcess,
  getOrCreateConsultationChat,
  getOwnerCases,
  getCasesByLand,
  checkLegalChatExists,
  checkConsultationExists,
  getConsultationLands,
  // getLawyerChats
} from "../controllers/ChatController.js";
import { authenticate } from "../middlerwares/authMiddlewares.js";


// import User from "../modals/UserModal.js";
// import getMessagesByLand  from '../controllers/ChatController.js'
const router = express.Router();  // Initialize router

// Create or get chat between buyer and owner
router.post("/get-or-create", getOrCreateChat);

// Get all chats for owner or buyer or lawyer
// router.get("/buyer/:buyerId", getBuyerChats);
// router.get("/owner/:ownerId", getOwnerChats);
// router.get("/lawyer/:lawyerId", getLawyerChats);


// Send a message
router.post("/send", sendMessage);

// routes/chatRoutes.js
router.put("/read/:chatId/:userId", markChatAsRead);
router.get("/user/:userId", getUserChats);
router.get("/unread/:userId", getUnreadCount);
//to create cosultation
router.post("/lawyer",authenticate, getOrCreateConsultationChat);
// to start legal process 
router.post("/start-legal", authenticate, startLegalProcess);
// route to get cases for the owner 
router.get("/owner-cases", authenticate, getOwnerCases);
// route to check legal chats 
router.get("/exists/:landId", authenticate, checkLegalChatExists);
// route to check whrte lawyer and buyer chatted 
router.get("/consultation-exists/:landId",authenticate,checkConsultationExists
);
//route to get consultation land for lawyer
router.get("/consultation", authenticate, getConsultationLands);
//route to ger cases by land 
router.get("/land/:landId", authenticate, getCasesByLand);
// dynamic routes 
router.get("/:chatId", getChatById); // ✅ ADD THIS
// Get messages for a chat
router.get("/:chatId/messages", getMessages);


export default router;
