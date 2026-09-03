import express from 'express';
import {
  getAdminAnalytics,
  getAllUsers,
  toggleUserBanStatus,
  overrideUserPlan,
  getFlaggedChatLogs,
  moderateChatLog,
  getPromptTemplate,
  setPromptTemplate,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword
} from '../controllers/adminController.js';
import { forgotPassword } from '../controllers/adminController.js';
import { verifyJWT } from '../middleware/verifyJWT.js';
import { checkRole } from '../middleware/checkRole.js';

const router = express.Router();

// All admin routes require JWT + admin role
router.use(verifyJWT);
router.use(checkRole('admin'));

// Analytics
router.get('/analytics', getAdminAnalytics);

// User CRUD
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:userId', updateUser);
router.delete('/users/:userId', deleteUser);
router.put('/users/:userId/status', toggleUserBanStatus);
router.put('/users/:userId/password', resetUserPassword);

// Plans
router.put('/plans/:userId/override', overrideUserPlan);

// Chat moderation
router.get('/chat-flags', getFlaggedChatLogs);
router.put('/chat-flags/:chatId/resolve', moderateChatLog);

// AI Prompt Template
router.get('/prompt-template', getPromptTemplate);
router.put('/prompt-template', setPromptTemplate);

export default router;
