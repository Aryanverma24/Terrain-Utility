import Notification from '../modals/NotificationModal.js';
import { io } from '../index.js';
export const notifyLawyers = (notification) => {
  if (!io) return; // no need to call it as a function

  io.to('lawyer').emit('receive-notification', {
    ...notification,
    targetRole: 'lawyer',
    timestamp: new Date(),
  });
};
