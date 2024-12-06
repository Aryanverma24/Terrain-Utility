import express from "express";
import Message from "../modals/messageModel.js"; // Ensure correct path
import { authenticate } from '../middlerwares/landauthenticate.js';

import User from "../modals/UserModal.js";
import getMessagesForLand from '../controllers/Chatcontroller.js';
const router = express.Router();  // Initialize router

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
  }
});




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
