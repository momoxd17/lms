import { Enrollment } from '../models/Enrollment.js';
import { Course } from '../models/Course.js';
import { generateCertificateImage } from '../utils/certificateGenerator.js';

export async function enroll(req, res, next) {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    const existing = await Enrollment.findOne({ user: req.user._id, course: courseId });
    if (existing) return res.status(400).json({ success: false, message: 'Already enrolled' });
    if (course.price > 0) return res.status(400).json({ success: false, message: 'Paid course - use checkout' });
    const enrollment = await Enrollment.create({ user: req.user._id, course: courseId });
    const populated = await Enrollment.findById(enrollment._id).populate('course', 'title thumbnail');
    res.status(201).json({ success: true, enrollment: populated });
  } catch (e) {
    next(e);
  }
}

export async function myEnrollments(req, res, next) {
  try {
    const enrollments = await Enrollment.find({ user: req.user._id })
      .populate('course', 'title thumbnail description level category price')
      .sort({ updatedAt: -1 })
      .lean();
    res.json({ success: true, enrollments });
  } catch (e) {
    next(e);
  }
}

export async function getEnrollment(req, res, next) {
  try {
    const enrollment = await Enrollment.findOne({ user: req.user._id, course: req.params.courseId })
      .populate('course');
    if (!enrollment) return res.status(404).json({ success: false, message: 'Not enrolled' });
    res.json({ success: true, enrollment });
  } catch (e) {
    next(e);
  }
}

export async function completeLesson(req, res, next) {
  try {
    const { courseId, lessonId } = req.body;
    let enrollment = await Enrollment.findOne({ user: req.user._id, course: courseId });
    if (!enrollment) return res.status(404).json({ success: false, message: 'Not enrolled' });
    const hasAlready = enrollment.progress.some(p => String(p.lessonId) === String(lessonId));
    if (!hasAlready) {
      enrollment.progress.push({ lessonId });
      await enrollment.save();
    }
    const course = await Course.findById(courseId).lean();

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/14d01db5-811e-40f9-ad69-1093af033db2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: `log_${Date.now()}_completeLesson`,
        runId: 'pre-fix',
        hypothesisId: 'H1',
        location: 'enrollmentController.js:completeLesson',
        message: 'completeLesson progress debug',
        data: { userId: req.user?._id, courseId, lessonId },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion agent log
    let totalLessons = 0;
    (course?.curriculum || []).forEach(sec => { totalLessons += (sec.lessons || []).length; });
    const percent = totalLessons ? Math.round((enrollment.progress.length / totalLessons) * 100) : 0;
    if (percent >= 100 && course?.hasCertificate) {
      enrollment.completedAt = new Date();
      try {
        if (course.certificateTemplateUrl) {
          const certUrl = await generateCertificateImage({
            templateUrl: course.certificateTemplateUrl,
            studentName: req.user.name,
            courseTitle: course.title,
            enrollmentId: enrollment._id,
          });
          enrollment.certificateUrl = certUrl;
        }
      } catch (err) {
        console.error('Failed to generate certificate image:', err.message || err);
      }
      await enrollment.save();
    }
    const updated = await Enrollment.findById(enrollment._id).populate('course');
    res.json({ success: true, enrollment: updated, progressPercent: percent });
  } catch (e) {
    next(e);
  }
}

export async function getCertificate(req, res, next) {
  try {
    const enrollment = await Enrollment.findOne({ _id: req.params.id, user: req.user._id })
      .populate('course', 'title')
      .populate('user', 'name');
    if (!enrollment || !enrollment.completedAt) return res.status(404).json({ success: false, message: 'Certificate not found' });
    res.json({ success: true, enrollment, certificateUrl: enrollment.certificateUrl });
  } catch (e) {
    next(e);
  }
}

export async function adminListEnrollments(req, res, next) {
  try {
    const enrollments = await Enrollment.find()
      .populate('user', 'name email')
      .populate('course', 'title slug curriculum')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, enrollments });
  } catch (e) {
    next(e);
  }
}
