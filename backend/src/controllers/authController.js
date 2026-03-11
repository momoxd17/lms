import { User } from '../models/User.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/tokenUtils.js';
import { validationResult } from 'express-validator';

const cookieOptions = { httpOnly: true, secure: true, sameSite: 'none', maxAge: 7 * 24 * 60 * 60 * 1000 };

export async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    const { name, email, password, role } = req.body;
    if (await User.findOne({ email })) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    const allowedRole = ['student', 'instructor'].includes(role) ? role : 'student';
    const user = await User.create({ name, email, password, role: allowedRole });
    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);
    res.cookie('accessToken', accessToken, cookieOptions);
    res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });
    res.status(201).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
      accessToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
  } catch (e) {
    next(e);
  }
}

export async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (user.isBanned) {
      return res.status(403).json({ success: false, message: 'Your account has been banned' });
    }
    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);
    res.cookie('accessToken', accessToken, cookieOptions);
    res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });
    res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
      accessToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
  } catch (e) {
    next(e);
  }
}

export async function refresh(req, res, next) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ success: false, message: 'No refresh token' });
    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    const accessToken = signAccessToken(user._id);
    res.cookie('accessToken', accessToken, cookieOptions);
    res.json({ success: true, accessToken, expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
  } catch (e) {
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
}

export async function logout(req, res) {
  res.cookie('accessToken', '', { maxAge: 0 });
  res.cookie('refreshToken', '', { maxAge: 0 });
  res.json({ success: true });
}

export async function getMe(req, res, next) {
  try {
    res.json({ success: true, user: req.user });
  } catch (e) {
    next(e);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'No user with that email' });
    const crypto = await import('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;
    await user.save({ validateBeforeSave: false });
    // In production: send email with link containing token
    res.json({ success: true, message: 'Reset email sent', resetToken: process.env.NODE_ENV === 'development' ? token : undefined });
  } catch (e) {
    next(e);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({ resetPasswordToken: token }).select('+password');
    if (!user || (user.resetPasswordExpire && user.resetPasswordExpire < Date.now())) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.json({ success: true, message: 'Password updated' });
  } catch (e) {
    next(e);
  }
}
