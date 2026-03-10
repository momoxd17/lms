import { Enrollment } from '../models/Enrollment.js';
import { Course } from '../models/Course.js';

export async function createCheckoutSession(req, res, next) {
  try {
    const { courseId, successUrl } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(400).json({ success: false, message: 'Invalid course' });

    const existing = await Enrollment.findOne({ user: req.user._id, course: courseId });
    if (existing) return res.status(400).json({ success: false, message: 'Already enrolled' });

    const enrollment = await Enrollment.findOneAndUpdate(
      { user: req.user._id, course: courseId },
      { $set: { user: req.user._id, course: courseId } },
      { upsert: true, new: true }
    );

    const populated = await Enrollment.findById(enrollment._id).populate('course', 'title thumbnail');
    const redirectUrl = successUrl || `${process.env.FRONTEND_URL}/course/${courseId}?enrolled=1`;

    return res.json({ success: true, url: redirectUrl, enrollment: populated });
  } catch (e) {
    next(e);
  }
}

export async function webhook(req, res) {
  return res.json({ received: true });
}

export async function enrollAfterPayment(req, res, next) {
  try {
    const { courseId } = req.body;
    if (!courseId) return res.status(400).json({ success: false, message: 'No courseId provided' });

    await Enrollment.findOneAndUpdate(
      { user: req.user._id, course: courseId },
      { $set: { user: req.user._id, course: courseId } },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: 'Enrolled', courseId });
  } catch (e) {
    next(e);
  }
}