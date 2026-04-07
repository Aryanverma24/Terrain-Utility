// controllers/chatController.js
import asyncHandler from "express-async-handler";
import Chat from "../modals/chatmodel.js";
import Land from "../modals/LandModal.js";
import Message from "../modals/messageModel.js";
import mongoose from "mongoose";
import User from "../modals/UserModal.js";
import { io } from "../index.js";
import Case from "../modals/caseModal.js";
import Notification from "../modals/NotificationModal.js"
import { resolveChatRoles } from "../utils/Chathelper.js";
// --- Create or get a chat between buyer and owner for a land ---
const normalizeRole = (role) => {
  if (!role) return "buyer"; // fallback safe

  if (["buyer", "owner", "lawyer", "admin"].includes(role)) {
    return role;
  }

  if (role === "normal") return "buyer"; 

  return "buyer"; // default fallback
};



export const getOrCreateChat = asyncHandler(async (req, res) => {
  const { participants, landId, chatType } = req.body;

  if (!participants || participants.length < 2) {
    return res.status(400).json({ error: "Participants required" });
  }

  const sortedParticipants = [...participants]
    .map(id => id.toString())
    .sort();

  // 🔑 Generate chatKey
  const chatKey = sortedParticipants.join("_") + "_" + (landId || "global");

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


  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  const objectId = new mongoose.Types.ObjectId(userId);

 
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
    .populate("participants", "username role email") 
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

 
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  // Fetch chats (ONLY participants-based system)
  const chats = await Chat.find({
    participants: { $in: [userId] },
  })
    .populate("participants", "username role") // 🔥 KEY FIX
    .populate("landId", " landtype image city state pincode owner")
    .sort({ updatedAt: -1 })
    .lean();

  //  Format response 
  const formattedChats = chats.map((chat) => {
    const { owner, buyer, lawyer } = resolveChatRoles(chat, userId);

    return {
      _id: chat._id,
      chatType: chat.chatType,

     land: chat.landId
  ? {
      _id: chat.landId._id,
      image:chat.landId.image,
       landtype: chat.landId.landtype,
      city: chat.landId.city,
      state: chat.landId.state,
      pincode: chat.landId.pincode,
      owner: chat.landId.owner,
    }
  : null,

      participants: chat.participants, 

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

  //  VALIDATION
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

  // FETCH CHAT
  const chat = await Chat.findById(chatId);
  if (!chat) {
    return res.status(404).json({ error: "Chat not found" });
  }

  // VALIDATE PARTICIPANTS
  const isSenderValid = chat.participants.some(
    (p) => p.toString() === senderId
  );

  const isReceiverValid = chat.participants.some(
    (p) => p.toString() === receiverId
  );

  if (!isSenderValid || !isReceiverValid) {
    return res.status(400).json({ error: "Invalid chat users" });
  }

  // FETCH USERS (SAFE)
  const sender = await User.findById(senderId).select("username role");
  const receiver = await User.findById(receiverId).select("username role");

  if (!sender || !receiver) {
    return res.status(400).json({ error: "Invalid users" });
  }

  // CREATE MESSAGE
  const msg = await Message.create({
    chatId,
    senderId,
    senderName: sender.username,
    receiverId,
    receiverName: receiver.username,
    message,
    isRead: false,
  });

  //  UPDATE CHAT META
  await Chat.findByIdAndUpdate(chatId, {
    lastMessage: message,
    lastMessageAt: new Date(),
  });

  // CREATE NOTIFICATION (SAFE BLOCK)
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

    //  SOCKET EMIT
    if (io) {
      io.to(receiverId.toString()).emit("newNotification", notification);
     io.to(chatId.toString()).emit("message", msg); 
    }
  } catch (err) {
    console.error("Notification error:", err.message);
  }

  
  res.status(201).json(msg);
});
export const getOrCreateConsultationChat = async (req, res) => {
  try {
    const userId = req.user._id;
    const { landId, lawyerId } = req.body;

    if (!landId) {
      return res.status(400).json({ message: "LandId required" });
    }

    const chatKey = `CONSULT_${landId}_${userId}`;

    //  Step 1: Check existing chat
    let chat = await Chat.findOne({ chatKey }).populate("participants");

    if (chat) {
      //  Ensure consultation access exists (for old data cases)
      if (lawyerId) {
        const land = await Land.findById(landId);

        if (
          land &&
          land.approvedBy.toString() !== lawyerId.toString()
        ) {
          await User.findByIdAndUpdate(lawyerId, {
            $addToSet: {
              consultationLands: {
                landId,
                chatId: chat._id,
              },
            },
          });
        }
      }

      return res.status(200).json(chat);
    }

    //  No chat → must select lawyer
    if (!lawyerId) {
      return res.status(400).json({
        message: "Please select a lawyer to start consultation",
      });
    }

    //  Get land
    const land = await Land.findById(landId);

    //  Create chat
    chat = await Chat.create({
      participants: [userId, lawyerId],
      landId,
      chatType: "consultation",
      chatKey,
    });

    // Give access if lawyer is NOT approver
    if (
      land &&
      land.approvedBy.toString() !== lawyerId.toString()
    ) {
      await User.findByIdAndUpdate(lawyerId, {
        $addToSet: {
          consultationLands: {
            landId,
            chatId: chat._id,
          },
        },
      });
    }

   res.status(200).json({
  chatId: chat._id
});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating consultation chat" });
  }
};


export const startLegalProcess = async (req, res) => {
  try {
    const userId = req.user.id;
    const { landId } = req.body;

    // Get land
    const land = await Land.findById(landId);
    if (!land) return res.status(404).json({ message: "Land not found" });

    const ownerId = land.owner;

    //  Get consultation chat (to extract lawyer)
    const consultKey = `CONSULT_${landId}_${userId}`;
    const consultChat = await Chat.findOne({ chatKey: consultKey });

    if (!consultChat) {
      return res.status(400).json({
        message: "Consultation required before legal process",
      });
    }

    const lawyerId = consultChat.participants.find(
      (p) => p.toString() !== userId
    );

    // Check if case already exists
    let existingCase = await Case.findOne({ landId, buyerId: userId });

    if (existingCase) {
      return res.status(200).json(existingCase);
    }

    //  Create chats

    const buyerLawyerChat = await Chat.create({
      participants: [userId, lawyerId],
      landId,
      chatType: "legal",
      chatKey: `LEGAL_BL_${landId}_${userId}`,
    });

    const ownerLawyerChat = await Chat.create({
      participants: [ownerId, lawyerId],
      landId,
      chatType: "legal",
      chatKey: `LEGAL_OL_${landId}_${ownerId}`,
    });

    // Create case
    const newCase = await Case.create({
      landId,
      buyerId: userId,
      ownerId,
      lawyerId,
      buyerLawyerChat: buyerLawyerChat._id,
      ownerLawyerChat: ownerLawyerChat._id,
    });

    res.status(201).json(newCase);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error starting legal process" });
  }
};
//for owner to see all his related cases for a land 
export const getOwnerCases = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const cases = await Case.find({ ownerId })
      .populate("landId", "landtype city state")
      .populate("buyerId", "username email")
      .populate("lawyerId", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json(cases);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching owner cases" });
  }
};
export const getCasesByLand = async (req, res) => {
  try {
    const { landId } = req.params;
    const ownerId = req.user.id;

    const cases = await Case.find({ landId, ownerId })
      .populate("buyerId", "username email")
      .populate("lawyerId", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json(cases);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching land cases" });
  }
};
//this is to check whether the legalchat exists fro woner lawyer and bueyr
export const checkLegalChatExists = async (req, res) => {
  try {
    const userId = req.user._id;
    const { landId } = req.params;

    const chat = await Chat.findOne({
      landId: landId, 
      chatType: "legal",
      participants: { $in: [userId] }, 
    });

    if (chat) {
      return res.status(200).json({
        exists: true,
        chatId: chat._id,
      });
    }

    return res.status(200).json({ exists: false });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
// to check whether lawyer and buyer ahs a chat 
export const checkConsultationExists = async (req, res) => {
  try {
    const userId = req.user._id;
    const { landId } = req.params;

    const chat = await Chat.findOne({
      landId: landId, 
      chatType: "consultation",
      participants: { $in: [userId] }, 
    });

    if (chat) {
      return res.status(200).json({
        exists: true,
        chatId: chat._id,
      });
    }

    return res.status(200).json({ exists: false });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
//route for ulawyers to get land details ifthey are slelcted and they havnt approved the land
export const getConsultationLands = async (req, res) => {
  try {
    const lawyerId = req.user.id;

    // Get user (lawyer)
    const user = await User.findById(lawyerId).populate({
      path: "consultationLands.landId",
      populate: {
        path: "owner",
        select: "username",
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Extract lands
    const lands = user.consultationLands
      .filter(item => item.landId) // safety check
      .map(item => ({
        ...item.landId._doc,
        chatId: item.chatId,
      }));

    res.status(200).json(lands);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching consultation lands" });
  }
};