import express from 'express';
import Chat from '../modals/chatmodel.js';
import Message from '../modals/messageModel.js';
import { authenticate } from '../middlerwares/landauthenticate.js';  // Correct the typo 'middlerwares' to 'middlewares'

const router = express.Router();


// Create or fetch a chat session and send a message
router.post('/messages', async (req, res) => {
  const { landId, buyerId, ownerId, message } = req.body;

  if (!landId || !buyerId || !ownerId || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Log the incoming data
    console.log('Received data:', { landId, buyerId, ownerId, message });

    // Check if the chat exists
    let chat = await Chat.findOne({ landId, buyerId, ownerId });
    
    if (!chat) {
      console.log('No existing chat found. Creating a new one...');
      chat = new Chat({ landId, buyerId, ownerId });
      await chat.save();
    }

    // Create and save the new message
    const newMessage = new Message({
      content: message,
      senderId: buyerId,
      receiverId: ownerId,
      chatId: chat._id,
      landId
    });

    // Log before saving
    console.log('Saving message:', newMessage);
    await newMessage.save();

    // Send a success response
    res.status(201).json({ message: 'Message sent successfully', data: newMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});


// Send a message
// messages route (backend)
router.post("/chats", async (req, res) => {
    const { landId, buyerId, ownerId } = req.body;

    try {
        // Try to find an existing chat based on the landId, buyerId, and ownerId
        let chat = await Chat.findOne({ landId, buyerId, ownerId });

        if (!chat) {
            // If no chat exists, create a new chat
            chat = new Chat({ landId, buyerId, ownerId });
            await chat.save();  // Save the chat in the database
        }

        // Respond with the chat ID
        res.status(200).json({ chatId: chat._id });
    } catch (err) {
        console.error("Error in chat route:", err);
        res.status(500).json({ message: "Failed to create/fetch chat." });
    }
});

// Mark messages as read
router.post('/messages/markAsRead', authenticate, async (req, res) => {
    const { chatId, userId } = req.body;

    try {
        await Message.updateMany({ chatId, receiverId: userId, isRead: false }, { isRead: true });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to mark messages as read.' });
    }
});

// Backend route to fetch received messages for a specific land
router.get('/api/land/:landId/messages', async (req, res) => {
    const { landId } = req.params;
    try {
        // Fetch messages for this landId from your database
        const messages = await Message.find({ landId }); // Fetch messages based on landId
        if (messages.length > 0) {
            res.status(200).json({ messages });
        } else {
            res.status(404).json({ error: "No messages found for this land" });
        }
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Fetch messages for a specific chat by chatId
router.get('/api/messages/:chatId', async (req, res) => {
    const { chatId } = req.params;
    try {
        const messages = await Message.find({ chatId }); // Assuming Message is your model
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching messages' });
    }
});

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

// Fetch all messages for a specific landId
router.get('/messages/:landId', async (req, res) => {
  const { landId } = req.params;

  try {
    // Fetch messages associated with the landId
    const messages = await Message.find({ landId });

    // Check if messages exist for the given landId
    if (!messages.length) {
      return res.status(404).json({ message: 'No messages found for this land.' });
    }

    res.status(200).json(messages); // Send the messages back to the frontend
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});


// Use export default for ES Module
// Named export the router
export { router as chatRoutes };
