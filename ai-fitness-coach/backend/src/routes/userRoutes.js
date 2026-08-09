import express from 'express';
import { completeOnboarding, updateProfile } from '../controllers/userController.js';
import { verifyJWT } from '../middleware/verifyJWT.js';

const router = express.Router();

router.use(verifyJWT);
router.post('/onboarding', completeOnboarding);
router.put('/profile', updateProfile);

export default router;
