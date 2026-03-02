import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { getReviews, addReview, adminListReviews } from '../controllers/reviewController.js';

const router = express.Router();

router.get('/admin/all', protect, authorize('admin'), adminListReviews);
router.get('/course/:courseId', (req, res, next) => {
  req.app.locals = req.app.locals || {};
  next();
}, getReviews);

router.post('/', protect, addReview);

export default router;
