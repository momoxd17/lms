import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { enroll, myEnrollments, getEnrollment, completeLesson, getCertificate, adminListEnrollments } from '../controllers/enrollmentController.js';

const router = express.Router();
router.use(protect);

router.get('/admin/all', authorize('admin'), adminListEnrollments);
router.post('/', enroll);
router.get('/', myEnrollments);
router.get('/certificate/:id', getCertificate);
router.post('/complete-lesson', completeLesson);
router.get('/:courseId', getEnrollment);

export default router;
