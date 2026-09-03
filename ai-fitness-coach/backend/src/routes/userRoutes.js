import express from 'express';
import {
  completeOnboarding,
  updateProfile,
  updatePostureScan,
  exportUserData
} from '../controllers/userController.js';
import { verifyJWT } from '../middleware/verifyJWT.js';

const router = express.Router();

router.use(verifyJWT);
router.post('/onboarding', completeOnboarding);
router.put('/profile', updateProfile);
router.post('/posture-scan', updatePostureScan);
router.get('/export', exportUserData);

export default router;
