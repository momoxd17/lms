import Stripe from 'stripe';
import { Enrollment } from '../models/Enrollment.js';
import { Course } from '../models/Course.js';
import { Coupon } from '../models/Coupon.js';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
// TEMP: allow skipping real Stripe payments for demo / CV builds
const paymentsDisabled = process.env.MOCK_PAYMENTS === 'true';

function applyCouponToPrice(coursePrice, coupon) {
  if (!coupon) return coursePrice;
  if (!coupon.isValidFor) return coursePrice;
  if (!coupon.isValidFor()) return coursePrice;
  if (coupon.discountType === 'free') return 0;
  if (coupon.discountType === 'fixed') {
    return Math.max(0, coursePrice - coupon.amount);
  }
  if (coupon.discountType === 'percentage') {
    return Math.max(0, Math.round(coursePrice * (1 - coupon.amount / 100)));
  }
  return coursePrice;
}

async function validateAndUseCoupon(code, courseId) {
  if (!code) return null;
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon || !coupon.isValidFor(courseId)) return null;
  coupon.usedCount += 1;
  await coupon.save();
  return coupon;
}

export async function createCheckoutSession(req, res, next) {
  try {
    const { courseId, successUrl, cancelUrl, couponCode } = req.body;
    const course = await Course.findById(courseId);
    if (!course || course.price <= 0) return res.status(400).json({ success: false, message: 'Invalid course' });
    const existing = await Enrollment.findOne({ user: req.user._id, course: courseId });
    if (existing) return res.status(400).json({ success: false, message: 'Already enrolled' });

    const coupon = await validateAndUseCoupon(couponCode, courseId);
    const finalPrice = applyCouponToPrice(course.price, coupon);

    // If coupon makes it free, enroll directly without Stripe
    if (finalPrice === 0 || !stripe || paymentsDisabled) {
      const enrollment = await Enrollment.findOneAndUpdate(
        { user: req.user._id, course: courseId },
        { $set: { user: req.user._id, course: courseId } },
        { upsert: true, new: true }
      );
      const populated = await Enrollment.findById(enrollment._id).populate('course', 'title thumbnail');
      const redirectUrl = successUrl || `${process.env.FRONTEND_URL}/course/${courseId}?enrolled=1`;
      return res.json({
        success: true,
        url: redirectUrl,
        sessionId: null,
        mock: !stripe || paymentsDisabled,
        enrollment: populated,
        couponApplied: !!coupon,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: course.title, images: course.thumbnail ? [course.thumbnail] : [] },
            unit_amount: Math.round(finalPrice * 100),
          },
          quantity: 1,
        },
      ],
      success_url: successUrl || `${process.env.FRONTEND_URL}/course/${courseId}?enrolled=1`,
      cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/course/${courseId}`,
      client_reference_id: String(courseId),
      customer_email: req.user.email,
      metadata: { userId: String(req.user._id), courseId: String(courseId), couponCode: coupon?.code || '' },
    });
    res.json({ success: true, url: session.url, sessionId: session.id, couponApplied: !!coupon });
  } catch (e) {
    next(e);
  }
}

export async function webhook(req, res) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(503).send('Webhook not configured');
  }
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { userId, courseId } = session.metadata || {};
    if (userId && courseId) {
      await Enrollment.findOneAndUpdate(
        { user: userId, course: courseId },
        { $set: { user: userId, course: courseId, paymentId: session.payment_intent || session.id } },
        { upsert: true, new: true }
      );
    }
  }
  res.json({ received: true });
}

export async function enrollAfterPayment(req, res, next) {
  try {
    const { sessionId } = req.body;
    if (!stripe) return res.status(503).json({ success: false, message: 'Payments not configured' });
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid' || session.customer_email !== req.user.email) {
      return res.status(400).json({ success: false, message: 'Invalid session' });
    }
    const courseId = session.metadata?.courseId || session.client_reference_id;
    if (!courseId) return res.status(400).json({ success: false, message: 'No course in session' });
    await Enrollment.findOneAndUpdate(
      { user: req.user._id, course: courseId },
      { $set: { user: req.user._id, course: courseId, paymentId: session.id } },
      { upsert: true, new: true }
    );
    res.json({ success: true, message: 'Enrolled', courseId });
  } catch (e) {
    next(e);
  }
}
