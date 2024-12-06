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

