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

router.get('/messages/:landId', (req, res, next) => {
  console.log("Request URL:", req.originalUrl); // Log the full request URL
  next(); // Proceed to the actual route handler
}, async (req, res) => {
  const { landId } = req.params;
  console.log("Fetching messages for landId:", landId); // Log the landId

  try {
    const landObjectId = mongoose.Types.ObjectId(landId);
    const messages = await Message.find({ landId: landObjectId });
    console.log("Messages found:", messages); // Log the results
    if (!messages || messages.length === 0) {
      return res.status(404).json({ error: "No messages found for this landId." });
    }

    res.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});
router.get('/messages/replies/:messageId', async (req, res) => {
  const { messageId } = req.params;

  try {
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found." });
    }

    res.json({ replies: message.replies });
  } catch (error) {
    console.error("Error fetching replies:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});
// Example of an endpoint for fetching replies
router.get('/api/messages/:landId/:messageId/replies', async (req, res) => {
  try {
    const { landId, messageId } = req.params;
    // Fetch the message and replies based on landId and messageId
    const message = await Message.findOne({ landId, _id: messageId }).populate('replies');
    
    if (!message) {
      return res.status(404).send('Message not found');
    }

    res.status(200).json({ replies: message.replies });
  } catch (error) {
    console.error("Error fetching replies:", error);
    res.status(500).send('Internal Server Error');
  }
});



export { router as chatRoutes };
