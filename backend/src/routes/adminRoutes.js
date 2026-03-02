import express from 'express';
import { protect, requireAdmin } from '../middleware/auth.js';
import {
  listAllUsers,
  banUser,
  unbanUser,
  enrollUserInCourse,
  removeUserFromCourse,
  createCoupon,
  listCoupons,
  updateCoupon,
  getSettings,
  updateSettings,
  getPublicSettings,
} from '../controllers/adminController.js';
import { listInboxMessages, listThread, replyAsAdmin } from '../controllers/chatController.js';

const router = express.Router();

router.get('/settings/public', getPublicSettings);

router.use(protect, requireAdmin);

router.get('/users', listAllUsers);
router.patch('/users/:id/ban', banUser);
router.patch('/users/:id/unban', unbanUser);

router.post('/courses/:courseId/enroll', enrollUserInCourse);
router.delete('/courses/:courseId/enroll/:userId', removeUserFromCourse);

router.post('/coupons', createCoupon);
router.get('/coupons', listCoupons);
router.patch('/coupons/:id', updateCoupon);

router.get('/settings', getSettings);
router.put('/settings', updateSettings);

router.get('/inbox', listInboxMessages);
router.get('/inbox/thread', listThread);
router.post('/inbox/reply', replyAsAdmin);

export default router;

