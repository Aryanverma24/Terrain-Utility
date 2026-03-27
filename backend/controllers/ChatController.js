// controllers/chatController.js
import asyncHandler from "express-async-handler";
import Chat from "../modals/chatmodel.js";
import Message from "../modals/messageModel.js";
import mongoose from "mongoose";
import User from "../modals/UserModal.js";
import { io } from "../index.js";
import Notification from "../modals/NotificationModal.js"
import { resolveChatRoles } from "../utils/Chathelper.js";
// --- Create or get a chat between buyer and owner for a land ---
const normalizeRole = (role) => {
  if (!role) return "buyer"; // fallback safe

  if (["buyer", "owner", "lawyer", "admin"].includes(role)) {
    return role;
  }

  // 🔥 map your custom roles
  if (role === "normal") return "buyer"; // or "user" if you add it later

  return "buyer"; // default fallback
};
export const getOrCreateChat = asyncHandler(async (req, res) => {
  const { participants, landId, chatType } = req.body;

  if (!participants || participants.length < 2) {
    return res.status(400).json({ error: "Participants required" });
  }

  // ✅ Normalize + sort
  const sortedParticipants = [...participants]
    .map(id => id.toString())
    .sort();

  // ✅ IMPORTANT: include landId in key
  const chatKey =
    sortedParticipants.join("_") + "_" + (landId || "global");

  const chat = await Chat.findOneAndUpdate(
    { chatKey },
    {
      $setOnInsert: {
        participants: sortedParticipants,
        chatKey,
        landId: landId || null,
        chatType: chatType || "normal",
      },
    },
    { new: true, upsert: true }
  );

  res.json(chat);
});
// --- Fetch all chats for a particular owner ---
// In your backend chatController.js
// export const getOwnerChats = asyncHandler(async (req, res) => {
//   const { ownerId } = req.params;

//   // ✅ VALIDATION
//   if (!mongoose.Types.ObjectId.isValid(ownerId)) {
//     return res.status(400).json({ error: "Invalid owner ID" });
//   }

//   const objectId = new mongoose.Types.ObjectId(ownerId);

//   // ✅ FETCH CHATS WHERE USER IS OWNER
//   const chats = await Chat.find({ ownerId: objectId })
//     .populate("buyerId", "username") // 🔥 important
//     .sort({ lastMessageAt: -1 })
//     .lean();

//   // ✅ FORMAT RESPONSE
//   const formatted = chats.map((c) => ({
//     ...c,
//     buyerName: c.buyerId?.username || "Buyer",
//   }));

//   // console.log("Owner chats fetched:", formatted.length);

//   res.json(formatted);
// });


// --- Fetch all chats for a particular buyer ---
// export const getBuyerChats = asyncHandler(async (req, res) => {
//   const { buyerId, userId } = req.params;

//   const actualBuyerId = buyerId || userId;

//   // console.log("Buyer ID:", actualBuyerId);

//   // 🔥 FIX: convert to ObjectId
//   const objectId = new mongoose.Types.ObjectId(actualBuyerId);

//   const chats = await Chat.find({ buyerId: objectId })
//     .populate("ownerId", "username")
//     .sort({ lastMessageAt: -1 })
//     .lean();

//   // console.log("Chats fetched:", chats.length);

//   const formatted = chats.map((c) => ({
//     ...c,
//     ownerName: c.ownerId?.username || "Owner",
//   }));

//   res.json(formatted);
// });

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

export const getChatById = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    return res.status(400).json({ error: "Invalid chat ID" });
  }

  const chat = await Chat.findById(chatId)
    .populate("participants", "username role email") // 🔥 MAIN FIX
    .populate("landId", "title");

  if (!chat) {
    return res.status(404).json({ error: "Chat not found" });
  }

  res.json(chat);
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

  // ✅ Validate ObjectId (prevents 500 crash)
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  // ✅ Fetch chats (ONLY participants-based system)
  const chats = await Chat.find({
    participants: { $in: [userId] },
  })
    .populate("participants", "username role") // 🔥 KEY FIX
    .populate("landId", "title owner")
    .sort({ updatedAt: -1 })
    .lean();

  // ✅ Format response (clean + frontend ready)
  const formattedChats = chats.map((chat) => {
    const { owner, buyer, lawyer } = resolveChatRoles(chat, userId);

    return {
      _id: chat._id,
      chatType: chat.chatType,

      land: chat.landId
        ? {
            _id: chat.landId._id,
            title: chat.landId.title,
            owner: chat.landId.owner,
          }
        : null,

      participants: chat.participants, // ✅ already has username

      owner,
      buyer,
      lawyer,

      lastMessage: chat.lastMessage || "",
      lastMessageAt: chat.lastMessageAt || null,
      updatedAt: chat.updatedAt,
    };
  });

  res.status(200).json(formattedChats);
});
// --- Send a message in a chat ---
export const sendMessage = asyncHandler(async (req, res) => {
  const { chatId, senderId, receiverId, message } = req.body;

  // ✅ VALIDATION
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

  // ✅ FETCH CHAT
  const chat = await Chat.findById(chatId);
  if (!chat) {
    return res.status(404).json({ error: "Chat not found" });
  }

  // ✅ VALIDATE PARTICIPANTS
  const isSenderValid = chat.participants.some(
    (p) => p.toString() === senderId
  );

  const isReceiverValid = chat.participants.some(
    (p) => p.toString() === receiverId
  );

  if (!isSenderValid || !isReceiverValid) {
    return res.status(400).json({ error: "Invalid chat users" });
  }

  // ✅ FETCH USERS (SAFE)
  const sender = await User.findById(senderId).select("username role");
  const receiver = await User.findById(receiverId).select("username role");

  if (!sender || !receiver) {
    return res.status(400).json({ error: "Invalid users" });
  }

  // ✅ CREATE MESSAGE
  const msg = await Message.create({
    chatId,
    senderId,
    senderName: sender.username,
    receiverId,
    receiverName: receiver.username,
    message,
    isRead: false,
  });

  // ✅ UPDATE CHAT META
  await Chat.findByIdAndUpdate(chatId, {
    lastMessage: message,
    lastMessageAt: new Date(),
  });

  // ✅ CREATE NOTIFICATION (SAFE BLOCK)
  let notification = null;

  try {
    const targetRole = normalizeRole(receiver.role);

    notification = await Notification.create({
      userId: receiverId,
      title: `New message from ${sender.username}`,
      message: message.slice(0, 20) + "...",
      isRead: false,
      chatId: chatId,
      targetRole,
    });

    // ✅ SOCKET EMIT
    if (io) {
      io.to(receiverId.toString()).emit("newNotification", notification);
     io.to(chatId.toString()).emit("message", msg); // 🔥 MATCH SOCKET SERVER // 🔥 REALTIME CHAT
    }
  } catch (err) {
    console.error("Notification error:", err.message);
  }

  // ✅ CRITICAL FIX (YOU WERE MISSING THIS)
  res.status(201).json(msg);
});
// export const getLawyerChats = asyncHandler(async (req, res) => {
//   const { lawyerId } = req.params;

//   const chats = await Chat.find({
//     lawyerId: new mongoose.Types.ObjectId(lawyerId),
//   })
//   .sort({ lastMessageAt: -1 })
//   .lean();

//   res.json(chats);
// });