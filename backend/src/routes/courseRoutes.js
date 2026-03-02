import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  listCourses,
  getCourse,
  getCourseBySlug,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseForEdit,
  myCourses,
  adminListCourses,
} from '../controllers/courseController.js';

const router = express.Router();

router.get('/', listCourses);
router.get('/slug/:slug', getCourseBySlug);
router.get('/:id', getCourse);

router.use(protect);
router.get('/instructor/mine', authorize('instructor', 'admin'), myCourses);
router.get('/instructor/course/:id', authorize('instructor', 'admin'), getCourseForEdit);
router.get('/admin/all', authorize('admin'), adminListCourses);
router.post('/', authorize('instructor', 'admin'), createCourse);
router.patch('/:id', authorize('instructor', 'admin'), updateCourse);
router.delete('/:id', authorize('instructor', 'admin'), deleteCourse);

export default router;
