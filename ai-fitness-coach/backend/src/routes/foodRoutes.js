import express from 'express';
import { analyzeFood, logFood, getTodayLog, deleteFoodEntry } from '../controllers/foodController.js';
import { verifyJWT } from '../middleware/verifyJWT.js';

const router = express.Router();

router.use(verifyJWT);

router.post('/analyze', analyzeFood);
router.post('/log', logFood);
router.get('/today', getTodayLog);
router.delete('/log/:entryId', deleteFoodEntry);

export default router;
