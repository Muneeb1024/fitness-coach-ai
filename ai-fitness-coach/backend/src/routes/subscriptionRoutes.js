import express from 'express';
import { verifyJWT } from '../middleware/verifyJWT.js';
import { upgradeSubscription, getSubscriptionStatus } from '../controllers/subscriptionController.js';

const router = express.Router();

router.get('/status', verifyJWT, getSubscriptionStatus);
router.post('/upgrade', verifyJWT, upgradeSubscription);

export default router;
