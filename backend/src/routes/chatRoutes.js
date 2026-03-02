import express from 'express';
import { protect } from '../middleware/auth.js';
import { askChatbot, listUserHistory } from '../controllers/chatController.js';

const router = express.Router();

router.post('/ask', protect, askChatbot);
router.get('/history', protect, listUserHistory);

export default router;

