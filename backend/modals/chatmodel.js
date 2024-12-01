import mongoose from 'mongoose';
// import User from './UserModal.js';

const chatSchema = new mongoose.Schema({
  
    landId: { // Unique ID for the land where the conversation happens
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    buyerId: { // The buyer involved in the chat
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    ownerId: { // The owner involved in the chat
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    // You can also store other meta-information about the chat here
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });
const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
