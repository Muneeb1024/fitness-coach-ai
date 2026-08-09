import express from 'express';
import { sendChatMessage, getChatHistory } from '../controllers/chatController.js';
import { verifyJWT } from '../middleware/verifyJWT.js';
import { chatLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(verifyJWT);
router.post('/message', chatLimiter, sendChatMessage);
router.get('/history', getChatHistory);

export default router;
