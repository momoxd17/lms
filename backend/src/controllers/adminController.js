import { User } from '../models/User.js';
import { Enrollment } from '../models/Enrollment.js';
import { Course } from '../models/Course.js';
import { Coupon } from '../models/Coupon.js';
import { SiteSettings } from '../models/SiteSettings.js';

export async function listAllUsers(req, res, next) {
  try {
    const users = await User.find().select('-password').lean();
    res.json({ success: true, users });
  } catch (e) {
    next(e);
  }
}

export async function banUser(req, res, next) {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { isBanned: true } },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (e) {
    next(e);
  }
}

export async function unbanUser(req, res, next) {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { isBanned: false } },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (e) {
    next(e);
  }
}

export async function enrollUserInCourse(req, res, next) {
  try {
    const { userId } = req.body;
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    const enrollment = await Enrollment.findOneAndUpdate(
      { user: userId, course: courseId },
      { $set: { user: userId, course: courseId } },
      { upsert: true, new: true }
    ).populate('user', 'name email').populate('course', 'title slug');
    res.json({ success: true, enrollment });
  } catch (e) {
    next(e);
  }
}

export async function removeUserFromCourse(req, res, next) {
  try {
    const { courseId, userId } = req.params;
    await Enrollment.findOneAndDelete({ user: userId, course: courseId });
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
}

export async function createCoupon(req, res, next) {
  try {
    const payload = {
      ...req.body,
      code: req.body.code?.toUpperCase(),
      createdBy: req.user._id,
    };
    const coupon = await Coupon.create(payload);
    res.status(201).json({ success: true, coupon });
  } catch (e) {
    next(e);
  }
}

export async function listCoupons(req, res, next) {
  try {
    const coupons = await Coupon.find().populate('course', 'title').lean();
    res.json({ success: true, coupons });
  } catch (e) {
    next(e);
  }
}

export async function updateCoupon(req, res, next) {
  try {
    const updates = { ...req.body };
    if (updates.code) updates.code = updates.code.toUpperCase();
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).populate('course', 'title');
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.json({ success: true, coupon });
  } catch (e) {
    next(e);
  }
}

export async function getSettings(req, res, next) {
  try {
    const settings = await SiteSettings.getSingleton();
    res.json({ success: true, settings });
  } catch (e) {
    next(e);
  }
}

export async function updateSettings(req, res, next) {
  try {
    const settings = await SiteSettings.getSingleton();
    const allowed = ['primaryColor', 'secondaryColor', 'backgroundColor', 'textColor', 'logoUrl', 'darkModeEnabled'];
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) {
        settings[key] = req.body[key];
      }
    });
    await settings.save();
    res.json({ success: true, settings });
  } catch (e) {
    next(e);
  }
}

export async function getPublicSettings(req, res, next) {
  try {
    const settings = await SiteSettings.getSingleton();
    const { primaryColor, secondaryColor, backgroundColor, textColor, logoUrl, darkModeEnabled } = settings;
    res.json({
      success: true,
      settings: { primaryColor, secondaryColor, backgroundColor, textColor, logoUrl, darkModeEnabled },
    });
  } catch (e) {
    next(e);
  }
}

