import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { getProfile, updateProfile, listUsers } from '../controllers/userController.js';

const router = express.Router();
router.use(protect);

router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.get('/', authorize('admin'), listUsers);

export default router;
