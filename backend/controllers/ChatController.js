// Import necessary modules using import syntax
import Chat from '../modals/Chat.js';

// Initiate a chat
export const initiateChat = async (req, res) => {
    const { landId, userId, ownerId } = req.body;
  
    console.log("Received request to initiate chat:", req.body); // Log the incoming data
  
    if (!landId || !userId || !ownerId) {
      console.error("Missing required fields:", { landId, userId, ownerId });
      return res.status(400).json({ message: "landId, userId, and ownerId are required." });
    }
  
    try {
      // Existing logic to check and create chat
    } catch (error) {
      console.error("Error in initiateChat controller:", error);
      res.status(500).json({ message: "Server error while initiating chat." });
    }
  };
  
// Send a message
export const sendMessage = async (req, res) => {
  const { chatId, senderId, message } = req.body;

  if (!chatId || !senderId || !message) {
    return res.status(400).json({ message: "chatId, senderId, and message are required." });
  }

  try {
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found." });
    }

    chat.messages.push({ sender: senderId, message });
    await chat.save();

    res.status(200).json(chat);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Server error while sending message." });
  }
};

// Fetch messages
export const getMessages = async (req, res) => {
  const { chatId } = req.params;

  try {
    const chat = await Chat.findById(chatId).populate('messages.sender', 'name');

    if (!chat) {
      return res.status(404).json({ message: "Chat not found." });
    }

    res.status(200).json(chat);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Server error while fetching messages." });
  }
};

// Get all chats for a land owner
export const getChatsForOwner = async (req, res) => {
  const { ownerId } = req.params;

  try {
    const chats = await Chat.find({ ownerId }).populate('userId', 'name');

    res.status(200).json(chats);
  } catch (error) {
    console.error("Error fetching chats for owner:", error);
    res.status(500).json({ message: "Server error while fetching chats." });
  }
};
