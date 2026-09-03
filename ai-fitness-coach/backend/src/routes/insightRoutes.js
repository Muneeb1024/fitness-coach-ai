import express from 'express';
import { getDailyInsight, getWeeklySummary } from '../controllers/insightController.js';
import { verifyJWT } from '../middleware/verifyJWT.js';

const router = express.Router();
router.use(verifyJWT);
router.get('/daily', getDailyInsight);
router.get('/weekly-summary', getWeeklySummary);

export default router;
