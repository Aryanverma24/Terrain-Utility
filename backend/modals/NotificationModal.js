// models/NotificationModal.js
import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    time: {
      type: Date,
      default: Date.now,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    targetRole: {
      type: String,
      enum: ['buyer', 'owner', 'lawyer', 'admin'],
      default: null, // role-based notification
    },
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: false,
      default: null, // can be optional if some notifications aren't chat-related
    },
  },

  { timestamps: true },
);

export default mongoose.model('Notification', NotificationSchema);
