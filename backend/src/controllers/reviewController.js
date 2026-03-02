import mongoose from 'mongoose';
import { Review } from '../models/Review.js';

export async function adminListReviews(req, res, next) {
  try {
    const reviews = await Review.find()
      .populate('user', 'name email')
      .populate('course', 'title slug')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, reviews });
  } catch (e) {
    next(e);
  }
}

export async function getReviews(req, res, next) {
  try {
    const courseId = req.params.courseId;
    const reviews = await Review.find({ course: courseId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .lean();
    const stats = await Review.aggregate([
      { $match: { course: new mongoose.Types.ObjectId(courseId) } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    res.json({
      success: true,
      reviews,
      rating: stats[0] ? Math.round(stats[0].avg * 10) / 10 : 0,
      totalReviews: stats[0] ? stats[0].count : 0,
    });
  } catch (e) {
    next(e);
  }
}

export async function addReview(req, res, next) {
  try {
    const { courseId, rating, comment } = req.body;
    let review = await Review.findOneAndUpdate(
      { user: req.user._id, course: courseId },
      { rating, comment },
      { new: true, upsert: true }
    );
    review = await Review.findById(review._id).populate('user', 'name avatar');
    res.json({ success: true, review });
  } catch (e) {
    next(e);
  }
}
