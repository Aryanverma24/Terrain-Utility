import express from 'express';
import { initiateChat, sendMessage, getMessages, getChatsForOwner } from '../controllers/ChatController.js';

const router = express.Router();

// Define your routes
router.post('/chats/initiate', initiateChat);
router.post('/chats/send', sendMessage);
router.get('/chats/:chatId', getMessages);
router.get('/chats/owner/:ownerId', getChatsForOwner);

export default router;
