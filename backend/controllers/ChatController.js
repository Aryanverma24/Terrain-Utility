// controllers/chatController.js
import asyncHandler from "express-async-handler";
import Chat from "../modals/chatmodel.js";
import Message from "../modals/messageModel.js";
import mongoose from "mongoose";
import User from "../modals/UserModal.js";
import { io } from "../index.js";
import Notification from "../modals/NotificationModal.js"
// --- Create or get a chat between buyer and owner for a land ---
export const getOrCreateChat = asyncHandler(async (req, res) => {
  const { landId, buyerId, ownerId } = req.body;

  if (!landId || !buyerId || !ownerId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Ensure IDs are valid MongoDB ObjectIds
  if (!mongoose.Types.ObjectId.isValid(landId) ||
      !mongoose.Types.ObjectId.isValid(buyerId) ||
      !mongoose.Types.ObjectId.isValid(ownerId)) {
    return res.status(400).json({ error: "Invalid IDs provided" });
  }

  let chat = await Chat.findOne({ landId, buyerId, ownerId });
  if (!chat) {
    chat = await Chat.create({
    landId,
    buyerId,
    ownerId,
    buyerName: req.body.buyerName // make sure buyerName is passed from frontend
  });
  }

  res.json(chat);
});

// --- Fetch all chats for a particular owner ---
// In your backend chatController.js
export const getOwnerChats = asyncHandler(async (req, res) => {
  const { ownerId } = req.params;
  
  const chats = await Chat.find({ ownerId }).sort({ lastMessageAt: -1 }).lean();
  
  // Fetch buyer names for each chat
  const buyerIds = chats.map((c) => c.buyerId);
  const buyers = await User.find({ _id: { $in: buyerIds } }).select("username");

  // Map buyerId -> buyerName
  const buyerMap = {};
  buyers.forEach((b) => {
    buyerMap[b._id] = b.username;
  });

  // Attach buyerName to each chat
  const chatsWithName = chats.map((c) => ({
    ...c,
    buyerName: buyerMap[c.buyerId] || "Unknown Buyer",
  }));

  res.json(chatsWithName);
});


// --- Fetch all chats for a particular buyer ---
export const getBuyerChats = asyncHandler(async (req, res) => {
  const { buyerId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(buyerId)) {
    return res.status(400).json({ error: "Invalid buyer ID" });
  }

  const chats = await Chat.find({ buyerId }).sort({ lastMessageAt: -1 }).lean();
  res.json(chats);
});

// --- Fetch messages for a chat ---
export const getMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    return res.status(400).json({ error: "Invalid chat ID" });
  }

  const messages = await Message.find({ chatId }).sort({ timestamp: 1 }).lean();
  res.json(messages);
});

// --- Send a message in a chat ---

export const sendMessage = asyncHandler(async (req, res) => {
  const { chatId, senderId, senderName, receiverId, receiverName, message } = req.body;

  if (!chatId || !senderId || !receiverId || !message || !senderName || !receiverName) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (!mongoose.Types.ObjectId.isValid(chatId) ||
      !mongoose.Types.ObjectId.isValid(senderId) ||
      !mongoose.Types.ObjectId.isValid(receiverId)) {
    return res.status(400).json({ error: "Invalid IDs" });
  }

  // Prevent sending message to self
  if (senderId === receiverId) {
    return res.status(400).json({ error: "Sender and receiver cannot be the same" });
  }

  // --- Save message ---
  const msg = await Message.create({
    chatId,
    senderId,
    senderName,
    receiverId,
    receiverName,
    message,
    timestamp: new Date(),
  });

  // --- Update chat's lastMessageAt ---
  await Chat.findByIdAndUpdate(chatId, { lastMessageAt: new Date() });

  // --- Create notification for receiver ---
  const notification = await Notification.create({
    userId: receiverId,
    title: `New message from ${senderName}`,
    message: message.slice(0, 10)+".............", // optional preview
    isRead: false,
    chatId: chatId, 
    targetRole: receiverId === receiverId ? "buyer" : "owner",
  });
 

  // --- Emit real-time notification if receiver is online ---
  if (io) {
    io.to(receiverId.toString()).emit("newNotification", notification);
  }
  console.log("Notification created:", notification); //
  res.status(201).json(msg);
});
