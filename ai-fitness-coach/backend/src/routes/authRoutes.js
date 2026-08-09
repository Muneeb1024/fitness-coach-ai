import express from 'express';
import { registerUser, loginUser, getMe } from '../controllers/authController.js';
import { verifyJWT } from '../middleware/verifyJWT.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { authSchemas, validate } from '../middleware/validation.js';

const router = express.Router();

router.post('/register', authLimiter, validate(authSchemas.register), registerUser);
router.post('/login', authLimiter, validate(authSchemas.login), loginUser);
router.get('/me', verifyJWT, getMe);

export default router;
