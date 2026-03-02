import express from 'express';
import { protect } from '../middleware/auth.js';
import { createCheckoutSession, enrollAfterPayment } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/enroll-after-payment', protect, enrollAfterPayment);

export default router;
