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

  if (
    !mongoose.Types.ObjectId.isValid(landId) ||
    !mongoose.Types.ObjectId.isValid(buyerId) ||
    !mongoose.Types.ObjectId.isValid(ownerId)
  ) {
    return res.status(400).json({ error: "Invalid IDs provided" });
  }

  if (buyerId === ownerId) {
    return res.status(400).json({
      error: "Buyer and Owner cannot be same user",
    });
  }

  try {
    // ✅ FETCH USERS
    const buyer = await User.findById(buyerId).select("username");
    const owner = await User.findById(ownerId).select("username");

    if (!buyer || !owner) {
      return res.status(404).json({ error: "User not found" });
    }

    // 🔥 ATOMIC OPERATION WITH NAMES
    const chat = await Chat.findOneAndUpdate(
      { landId, buyerId, ownerId },
      {
        $setOnInsert: {
          landId,
          buyerId,
          ownerId,
          buyerName: buyer.username,
          ownerName: owner.username,
        },
      },
      { new: true, upsert: true }
    );

    res.json(chat);
  } catch (err) {
    console.error("Chat creation error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- Fetch all chats for a particular owner ---
// In your backend chatController.js
export const getOwnerChats = asyncHandler(async (req, res) => {
  const { ownerId } = req.params;

  // ✅ VALIDATION
  if (!mongoose.Types.ObjectId.isValid(ownerId)) {
    return res.status(400).json({ error: "Invalid owner ID" });
  }

  const objectId = new mongoose.Types.ObjectId(ownerId);

  // ✅ FETCH CHATS WHERE USER IS OWNER
  const chats = await Chat.find({ ownerId: objectId })
    .populate("buyerId", "username") // 🔥 important
    .sort({ lastMessageAt: -1 })
    .lean();

  // ✅ FORMAT RESPONSE
  const formatted = chats.map((c) => ({
    ...c,
    buyerName: c.buyerId?.username || "Buyer",
  }));

  console.log("Owner chats fetched:", formatted.length);

  res.json(formatted);
});


// --- Fetch all chats for a particular buyer ---
export const getBuyerChats = asyncHandler(async (req, res) => {
  const { buyerId, userId } = req.params;

  const actualBuyerId = buyerId || userId;

  // console.log("Buyer ID:", actualBuyerId);

  // 🔥 FIX: convert to ObjectId
  const objectId = new mongoose.Types.ObjectId(actualBuyerId);

  const chats = await Chat.find({ buyerId: objectId })
    .populate("ownerId", "username")
    .sort({ lastMessageAt: -1 })
    .lean();

  // console.log("Chats fetched:", chats.length);

  const formatted = chats.map((c) => ({
    ...c,
    ownerName: c.ownerId?.username || "Owner",
  }));

  res.json(formatted);
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
//-- seen message or not 
export const getUnreadCount = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // ✅ Validate ID
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  const objectId = new mongoose.Types.ObjectId(userId);

  // ✅ GROUP unread per chat
  const unreadCounts = await Message.aggregate([
    {
      $match: {
        receiverId: objectId,
        isRead: false,
      },
    },
    {
      $group: {
        _id: "$chatId",
        count: { $sum: 1 },
      },
    },
  ]);

  // ✅ Convert to map: { chatId: count }
  const result = {};
  unreadCounts.forEach((item) => {
    result[item._id] = item.count;
  });

  res.json(result);
});
export const markChatAsRead = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.params;

  await Message.updateMany(
    {
      chatId,
      receiverId: userId,
      isRead: false,
    },
    { $set: { isRead: true } }
  );

  res.json({ message: "Messages marked as read" });
});
//---- to get individual user caht getUserChats
export const getUserChats = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // ✅ Validate ID
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  const objectId = new mongoose.Types.ObjectId(userId);

  const chats = await Chat.find({
    $or: [{ ownerId: objectId }, { buyerId: objectId }],
  })
    .sort({ updatedAt: -1 })
    .lean();

  res.json(chats);
});
// --- Send a message in a chat ---
export const sendMessage = asyncHandler(async (req, res) => {
  const { chatId, senderId, receiverId, message } = req.body;

  // 🔥 VALIDATION
  if (!chatId || !senderId || !receiverId || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (
    !mongoose.Types.ObjectId.isValid(chatId) ||
    !mongoose.Types.ObjectId.isValid(senderId) ||
    !mongoose.Types.ObjectId.isValid(receiverId)
  ) {
    return res.status(400).json({ error: "Invalid IDs" });
  }

  if (senderId === receiverId) {
    return res.status(400).json({ error: "Sender and receiver cannot be same" });
  }

  // 🔥 FETCH USERS
  const sender = await User.findById(senderId).select("username");
  const receiver = await User.findById(receiverId).select("username");

  if (!sender || !receiver) {
    return res.status(400).json({ error: "Invalid users" });
  }

  // 🔥 SAVE MESSAGE
  const msg = await Message.create({
    chatId,
    senderId,
    senderName: sender.username,
    receiverId,
    receiverName: receiver.username,
    message,
    isRead: false, // ✅ IMPORTANT
  });

  // 🔥 UPDATE CHAT (CRITICAL FIX)
  const chat = await Chat.findByIdAndUpdate(
    chatId,
    {
      lastMessage: message,          // ✅ FIXES "No messages yet"
      lastMessageAt: new Date(),     // ✅ FIXES "Invalid date"
    },
    { new: true }
  );

  // 🔥 DETERMINE ROLE
  const targetRole =
    receiverId.toString() === chat.ownerId.toString()
      ? "owner"
      : "buyer";

  // 🔥 CREATE NOTIFICATION (optional if using chat-based unread)
  const notification = await Notification.create({
    userId: receiverId,
    title: `New message from ${sender.username}`,
    message: message.slice(0, 20) + "...",
    isRead: false,
    chatId: chatId,
    targetRole,
  });

  // 🔥 SOCKET (REAL-TIME)
  if (io) {
    // send message in real-time
    io.to(chatId.toString()).emit("newMessage", msg);

    // send notification
    io.to(receiverId.toString()).emit("newNotification", notification);
  }

  res.status(201).json(msg);
});