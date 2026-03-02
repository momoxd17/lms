import express from 'express';
import { body } from 'express-validator';
import { register, login, logout, refresh, getMe, forgotPassword, resetPassword } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', [
  body('name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
], register);

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], login);

router.post('/logout', logout);
router.post('/refresh', refresh);
router.get('/me', protect, getMe);

router.post('/forgot-password', body('email').isEmail().normalizeEmail(), forgotPassword);
router.post('/reset-password', [
  body('token').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
], resetPassword);

export default router;
