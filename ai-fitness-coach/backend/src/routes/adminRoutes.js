import express from 'express';
import {
  getAdminAnalytics,
  getAllUsers,
  toggleUserBanStatus,
  overrideUserPlan,
  getFlaggedChatLogs,
  moderateChatLog,
  getPromptTemplate,
  setPromptTemplate
} from '../controllers/adminController.js';
import { verifyJWT } from '../middleware/verifyJWT.js';
import { checkRole } from '../middleware/checkRole.js';

const router = express.Router();

router.use(verifyJWT);
router.use(checkRole('admin'));

router.get('/analytics', getAdminAnalytics);
router.get('/users', getAllUsers);
router.put('/users/:userId/status', toggleUserBanStatus);
router.put('/plans/:userId/override', overrideUserPlan);
router.get('/chat-flags', getFlaggedChatLogs);
router.put('/chat-flags/:chatId/resolve', moderateChatLog);
router.get('/prompt-template', getPromptTemplate);
router.put('/prompt-template', setPromptTemplate);

export default router;
