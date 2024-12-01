
import Message from '../modals/messageModel.js';
// Import the Message model

// Controller to fetch messages for a specific landId where the ownerId matches
const getMessagesForLand = async (req, res) => {
    const { landId } = req.params;
    console.log("Fetching messages for landId:", landId);  // Log to verify landId
    
    if (!landId) {
      return res.status(400).json({ message: "Land ID is required" });
    }
  
    try {
      const messages = await Message.find({ landId });
      console.log("Messages found:", messages);  // Log the result of the query
      if (!messages.length) {
        return res.status(404).json({ message: "No messages found." });
      }
  
      res.status(200).json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
  
  
export { getMessagesForLand };
