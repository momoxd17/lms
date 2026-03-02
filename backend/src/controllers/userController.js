import { User } from '../models/User.js';

export async function getProfile(req, res, next) {
  try {
    res.json({ success: true, user: req.user });
  } catch (e) {
    next(e);
  }
}

export async function updateProfile(req, res, next) {
  try {
  const { name, avatar } = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, { name, avatar }, { new: true }).select('-password');
  res.json({ success: true, user });
  } catch (e) {
    next(e);
  }
}

export async function listUsers(req, res, next) {
  try {
    const users = await User.find().select('-password').lean();
    res.json({ success: true, users });
  } catch (e) {
    next(e);
  }
}
