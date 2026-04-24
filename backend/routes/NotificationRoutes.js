import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllRead,
  deleteNotification,
} from '../controllers/NotificationController.js';

const router = express.Router();

// GET all notifications for user
router.get('/:userId', getNotifications);

// Mark single notification as read
router.put('/read/:id', markAsRead);

// Delete single notification
router.delete('/:id', deleteNotification);
router.put('/mark-read/:userId', markAllRead);

export default router;
