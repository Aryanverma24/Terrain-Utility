<<<<<<< HEAD
import Message from "../modals/messageModel.js";

// In MessageController.js
 // Adjust according to your model location

// Controller method to fetch messages for a specific land
const getMessagesByLand = async (req, res) => {
  try {
    const { landId } = req.params;
    const messages = await Message.find({ landId });
    if (!messages.length) {
      return res.status(200).json({ messages: [] });
    }
    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ error: "Error fetching messages" });
  }
};
export default getMessagesByLand;

=======
import Message from '../modals/messageModel.js';  // Import the Message model
const decodeToken = (token) => {
  if (!token) {
    throw new Error('Token is required');
  }

  // Split the token into the three parts (header, payload, and signature)
  const parts = token.split('.');

  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }

  // Base64-decode the payload part (second part of the token)
  const payload = parts[1];

  // Decode from base64url to base64 (because JWT uses base64url encoding)
  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');

  // Decode the base64 string to a UTF-8 string
  const decodedPayload = Buffer.from(base64, 'base64').toString('utf-8');

  // Parse the decoded string into a JSON object
  const decodedObject = JSON.parse(decodedPayload);

  return decodedObject;
};
const getMessageById = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId)
      .populate('replies.senderId', 'username');
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    console.log(message); // Log message to check if it includes replies with replyContent
    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch message' });
  }
};

// Controller to fetch messages for a specific landId where the ownerId matches
const getMessagesForLand = async (req, res) => {
    const { landId } = req.params;  // Get landId from route params
    console.log("Fetching messages for landId:", landId);
  
    if (!landId) {
      return res.status(400).json({ message: "Land ID is required" });
    }
  
    try {
      if (!/^[a-fA-F0-9]{24}$/.test(landId)) {
        return res.status(400).json({ message: "Invalid land ID format" });
      }
  
      const messages = await Message.find({ landId });
      console.log("Messages found:", messages);
  
      if (!messages || messages.length === 0) {
        return res.status(404).json({ message: "No messages found." });
      }
  
      res.status(200).json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
 


  const replyToMessage = async (req, res) => {
    try {
      const { messageId } = req.params;
      const { replyContent } = req.body;
  
      // Get the token from the authorization header
      const token = req.headers['authorization']?.split(' ')[1];
      if (!token) return res.status(401).json({ error: 'No token provided' });
  
      // Decode the token to get the user info
      const decoded = decodeToken(token); // Use the decode function here
      const senderId = decoded.userId; // Assuming 'userId' is part of the decoded token payload
  
      if (!replyContent) {
        return res.status(400).json({ error: 'Reply content is required' });
      }
  
      const message = await Message.findById(messageId);
      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }
  
      // Create the reply and add it to the message
      message.replies.push({
        replyContent,
        senderId, // Add senderId to the reply
        createdAt: new Date()
      });
  
      await message.save();
  
      res.status(200).json({ message: 'Reply added successfully', data: message });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to reply to message' });
    }
  };
  
  
export { getMessagesForLand ,replyToMessage,getMessageById};
>>>>>>> fee9ba12695b5b8fe15a6179bfea51c7ad557344
