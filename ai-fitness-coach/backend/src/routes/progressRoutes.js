import express from 'express';
import { getDailyProgress, updateDailyProgress, getProgressHistory } from '../controllers/progressController.js';
import { verifyJWT } from '../middleware/verifyJWT.js';

const router = express.Router();

router.use(verifyJWT);
router.get('/daily', getDailyProgress);
router.post('/daily', updateDailyProgress);
router.get('/history', getProgressHistory);

export default router;
