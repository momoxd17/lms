import { ChatMessage } from '../models/ChatMessage.js';

const CONTACT_PHONE = '+966547225409';
const CONTACT_EMAIL = 'moaazsamehzeedan@gmail.com';

function generateBotAnswer(text) {
  const lower = text.toLowerCase();
  if (lower.includes('contact') || lower.includes('phone') || lower.includes('email') || lower.includes('support')) {
    return `You can contact us anytime at phone ${CONTACT_PHONE} or email ${CONTACT_EMAIL}.`;
  }
  if (lower.includes('price') || lower.includes('cost') || lower.includes('coupon') || lower.includes('discount') || lower.includes('free')) {
    return 'Course prices are shown on each course page. If you received a coupon code, you can apply it during checkout on the payment step.';
  }
  if (lower.includes('enroll') || lower.includes('register') || lower.includes('sign up')) {
    return 'To enroll, create an account, go to the course page, and click the enroll button. Paid courses require completing checkout first.';
  }
  return null;
}

export async function askChatbot(req, res, next) {
  try {
    const { message, courseId, email } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }
    const answer = generateBotAnswer(message);
    const handledByBot = !!answer;
    const chat = await ChatMessage.create({
      user: req.user?._id,
      course: courseId || undefined,
      email: email || (req.user?.email ?? undefined),
      message,
      answer: answer || undefined,
      handledByBot,
      status: handledByBot ? 'answered' : 'pending',
      from: 'user',
    });
    res.json({
      success: true,
      handledByBot,
      answer: answer || 'Thanks for your question! Our team will review it and get back to you soon.',
      id: chat._id,
    });
  } catch (e) {
    next(e);
  }
}

export async function listInboxMessages(req, res, next) {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const messages = await ChatMessage.find(filter)
      .populate('user', 'name email')
      .populate('course', 'title slug')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, messages });
  } catch (e) {
    next(e);
  }
}

export async function listThread(req, res, next) {
  try {
    const { userId, courseId } = req.query;
    if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });
    const filter = { user: userId };
    if (courseId) filter.course = courseId;
    const messages = await ChatMessage.find(filter)
      .sort({ createdAt: 1 })
      .lean();
    res.json({ success: true, messages });
  } catch (e) {
    next(e);
  }
}

export async function replyAsAdmin(req, res, next) {
  try {
    const { messageId, text } = req.body;
    if (!messageId || !text) {
      return res.status(400).json({ success: false, message: 'messageId and text are required' });
    }
    const original = await ChatMessage.findById(messageId);
    if (!original) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    const reply = await ChatMessage.create({
      user: original.user,
      course: original.course,
      email: original.email,
      message: text,
      from: 'admin',
      handledByBot: false,
      status: 'answered',
      inReplyTo: original._id,
    });
    original.status = 'answered';
    original.answer = text;
    await original.save();
    res.json({ success: true, reply });
  } catch (e) {
    next(e);
  }
}

export async function listUserHistory(req, res, next) {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ success: false, message: 'Not authorized' });
    const { courseId } = req.query;
    const filter = { user: userId };
    if (courseId) filter.course = courseId;
    const messages = await ChatMessage.find(filter).sort({ createdAt: 1 }).lean();
    res.json({ success: true, messages });
  } catch (e) {
    next(e);
  }
}

