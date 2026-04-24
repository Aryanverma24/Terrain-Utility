import Notification from '../modals/notificationModel.js';
import User from '../modals/userModel.js'; // To find users by role

/**
 * Universal Notification Sender
 * - Can send to a specific user (receiverId)
 * - Or to all users of a specific role (receiverRole)
 */

export const sendNotification = async ({
  userId = null,
  receiverRole = null,
  title,
  message,
  type = 'system',
}) => {
  try {
    let receivers = [];

    // 1️⃣ If receiverId is provided → send to a single user
    if (userId) {
      receivers.push(userId);
    }

    // 2️⃣ If receiverRole is provided → send to all users of that role
    if (receiverRole) {
      Notification.create({
        targetRole: receiverRole,
        title,
        message,
        type,
      });
    }

    if (receivers.length === 0) {
      throw new Error('No receiver found for notification.');
    }

    // 3️⃣ Create notifications for all receivers
    const notifications = await Promise.all(
      receivers.map((id) =>
        Notification.create({
          userId: id,
          title,
          message,
          type,
        }),
      ),
    );

    return notifications;
  } catch (err) {
    console.error('Error sending notification:', err.message);
  }
};
