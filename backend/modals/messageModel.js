<<<<<<< HEAD
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  room: { type: String, required: true },
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

export default Message;
=======
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    landId: { type: mongoose.Schema.Types.ObjectId, ref: 'Land', required: true },
    replies: [
      {
        replyContent: { type: String, required: true },
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Message = mongoose.model('Message', messageSchema);
export default  Message;
>>>>>>> fee9ba12695b5b8fe15a6179bfea51c7ad557344
