import { Course } from '../models/Course.js';

export async function listCourses(req, res, next) {
  try {
    const { category, level, minPrice, maxPrice, search, page = 1, limit = 12 } = req.query;
    const query = { published: true };
    if (category) query.category = category;
    if (level) query.level = level;
    if (minPrice != null || maxPrice != null) {
      query.price = {};
      if (minPrice != null) query.price.$gte = Number(minPrice);
      if (maxPrice != null) query.price.$lte = Number(maxPrice);
    }
    if (search && search.trim()) {
      const re = new RegExp(search.trim(), 'i');
      query.$or = [{ title: re }, { description: re }];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [courses, total] = await Promise.all([
      Course.find(query).populate('instructor', 'name avatar').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      Course.countDocuments(query),
    ]);
    res.json({ success: true, courses, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (e) {
    next(e);
  }
}

export async function getCourse(req, res, next) {
  try {
    const course = await Course.findOne({ _id: req.params.id, published: true })
      .populate('instructor', 'name avatar')
      .lean();
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, course });
  } catch (e) {
    next(e);
  }
}

export async function getCourseBySlug(req, res, next) {
  try {
    const course = await Course.findOne({ slug: req.params.slug, published: true })
      .populate('instructor', 'name avatar')
      .lean();
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, course });
  } catch (e) {
    next(e);
  }
}

export async function createCourse(req, res, next) {
  try {
    const course = await Course.create({ ...req.body, instructor: req.user._id });
    res.status(201).json({ success: true, course });
  } catch (e) {
    next(e);
  }
}

export async function updateCourse(req, res, next) {
  try {
    const filter = req.user.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, instructor: req.user._id };
    const course = await Course.findOneAndUpdate(filter, req.body, { new: true });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    const updated = await Course.findById(req.params.id).populate('instructor', 'name avatar');
    res.json({ success: true, course: updated });
  } catch (e) {
    next(e);
  }
}

export async function deleteCourse(req, res, next) {
  try {
    const course = await Course.findOne({ _id: req.params.id });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    const instructorId = course.instructor?._id ?? course.instructor;
    const userId = req.user?._id ?? req.user?.id;
    if (String(instructorId) !== String(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not allowed' });
    }
    await Course.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Course deleted' });
  } catch (e) {
    next(e);
  }
}

export async function getCourseForEdit(req, res, next) {
  try {
    const isAdmin = req.user.role === 'admin';
    const filter = isAdmin ? { _id: req.params.id } : { _id: req.params.id, instructor: req.user._id };
    const course = await Course.findOne(filter).lean();
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, course });
  } catch (e) {
    next(e);
  }
}

export async function myCourses(req, res, next) {
  try {
    const courses = await Course.find({ instructor: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, courses });
  } catch (e) {
    next(e);
  }
}

export async function adminListCourses(req, res, next) {
  try {
    const courses = await Course.find().populate('instructor', 'name email').sort({ createdAt: -1 }).lean();
    res.json({ success: true, courses });
  } catch (e) {
    next(e);
  }
}
