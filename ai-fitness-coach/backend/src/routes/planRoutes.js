import express from 'express';
import { getMyPlan, regenerateMyPlan } from '../controllers/planController.js';
import { verifyJWT } from '../middleware/verifyJWT.js';
import { planLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(verifyJWT);
router.get('/my-plan', getMyPlan);
router.post('/regenerate', planLimiter, regenerateMyPlan);

export default router;
