<<<<<<< HEAD
import express from "express";
import Message from "../modals/messageModel.js"; // Ensure correct path
import { authenticate } from '../middlerwares/landauthenticate.js';

import User from "../modals/UserModal.js";
import getMessagesForLand from '../controllers/Chatcontroller.js';
const router = express.Router();  // Initialize router
=======
import express from 'express';
import Chat from '../modals/chatmodel.js';
import Message from '../modals/messageModel.js';
import { authenticate } from '../middlerwares/landauthenticate.js';  
import Land from '../modals/LandModal.js';
import { replyToMessage,getMessageById } from '../controllers/ChatController.js';
import chatAuthenticate from '../middlerwares/chatMiddleware.js';
const router = express.Router();


// Create or fetch a chat session and send a message
router.post('/messages', async (req, res) => {
  const { landId, buyerId, ownerId, message } = req.body;

  if (!landId || !buyerId || !ownerId || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
>>>>>>> fee9ba12695b5b8fe15a6179bfea51c7ad557344

// Define your route for fetching messages
router.get('/api/messages/:room', async (req, res) => {
  try {
    const { room } = req.params;  // Get the room parameter from the URL
    const messages = await Message.find({ room });  // Fetch messages from DB based on room
    res.json(messages);  // Send the messages as the response
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });  // Error handling
  }
});
<<<<<<< HEAD
// backend route handler (Express.js)
router.get('/api/messages/land/:landId', async (req, res) => {
  const { landId } = req.params;
  try {
    const messages = await Message.find({ landId }); // Assuming you're fetching messages related to landId
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});
// Route to save a message
router.post('/messages', authenticate, async (req, res) => {
  const { landId, senderId, receiverId, message } = req.body;

  if (!landId || !senderId || !receiverId || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
      const newMessage = new Message({
          landId,
          senderId,
          receiverId,
          message,
          timestamp: new Date(),
      });

      await newMessage.save();
      res.status(201).json({ success: true, message: 'Message sent successfully', data: newMessage });
  } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Server error' });
=======

// Mark messages as read
router.post('/messages/markAsRead', authenticate, async (req, res) => {
  const { chatId, userId } = req.body;

  try {
    await Message.updateMany({ chatId, receiverId: userId, isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark messages as read.' });
>>>>>>> fee9ba12695b5b8fe15a6179bfea51c7ad557344
  }
});


<<<<<<< HEAD


router.get("/api/messages/land/:landId", async (req, res) => {
  const { landId } = req.params;
  
  try {
    // Fetch messages related to the landId (roomId)
    const messages = await Message.find({ room: landId }).sort({ timestamp: 1 });
    if (!messages || messages.length === 0) {
      return res.status(404).json({ message: "No messages found for this land." });
    }
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});
router.get("/land/:roomId", async (req, res) => {
  const { roomId } = req.params; // Get roomId from the URL

  console.log("Fetching messages for landId (room):", roomId);  // Log the landId (room)

  try {
    const messages = await Message.find({ room: roomId }).sort({ timestamp: 1 });
    if (!messages || messages.length === 0) {
      return res.status(404).json({ message: "No messages found for this land." });
    }
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});
router.get('/messages/land/:room', async (req, res) => {
  try {
    const { room } = req.params;
    const messages = await Message.find({ room }).sort({ timestamp: 1 }); // Fetch messages sorted by timestamp

    if (!messages || messages.length === 0) {
      return res.status(404).json({ message: 'No messages found for this room.' });
    }

    res.json(messages); // Return messages as a response
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching messages.' });
  }
});

// Export the router for use in other files
export default router ;
=======
// Fetch or create chat based on landId and userId
router.get('/api/chat/:landId/:userId/:ownerId', async (req, res) => {
  const { landId, userId, ownerId } = req.params;

  try {
    // Find the chat by matching landId, userId, and ownerId
    const chat = await Chat.findOne({
      landId: landId,
      participants: { $all: [userId, ownerId] },  // Assuming participants is an array containing userId and ownerId
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found.' });
    }

    res.json({ chatId: chat._id });
  } catch (error) {
    res.status(500).json({ error: 'Error finding chat.' });
  }
});

// Example using Express.js to fetch chat and messages by landId
router.get('/api/chat/land/:landId', async (req, res) => {
  const { landId } = req.params;

  try {
    const chat = await Chat.findOne({ land: landId }).populate('messages');
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found for this land' });
    }
    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch messages for a specific landId with ownerId (ensuring the owner sees only their messages)
router.get('/messages/land/:landId', async (req, res) => {
  console.log('Received request for landId:', req.params.landId);  // Log the landId
  const { landId } = req.params;

  try {
    const messages = await Message.find({ landId });
    if (!messages || messages.length === 0) {
      return res.status(404).json({ message: 'No messages found' });
    }
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
router.post('/messages/reply/:messageId',chatAuthenticate, replyToMessage);
router.get('/messages/:messageId', getMessageById);

// Example Node.js/Express route
// Get replies for a specific message
router.get('/api/messages/reply/:messageId', async (req, res) => {
  const { messageId } = req.params;
  try {
    const replies = await Reply.find({ parentMessageId: messageId }); // Assuming a Reply model exists
    if (!replies.length) {
      return res.status(404).json({ error: 'No replies found for this message.' });
    }
    res.status(200).json({ replies });
  } catch (err) {
    console.error('Error fetching replies:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});



export { router as chatRoutes };
>>>>>>> fee9ba12695b5b8fe15a6179bfea51c7ad557344
