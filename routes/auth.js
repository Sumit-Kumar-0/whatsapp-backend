import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  logout,
  getMe,
  verifyEmail,
  resendVerificationCode
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Validation rules - UPDATED with all new fields
const registerValidation = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('whatsappNumber').notEmpty().withMessage('WhatsApp number is required'),
  body('businessName').notEmpty().withMessage('Business name is required'),
  body('businessCountry').notEmpty().withMessage('Business country is required'),
  body('businessWebsite').isURL().withMessage('Valid business website URL is required'),
  body('referralSource').notEmpty().withMessage('Referral source is required')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

const verifyEmailValidation = [
  body('email').isEmail().normalizeEmail(),
  body('verificationCode').isLength({ min: 6, max: 6 })
];

const resendVerificationValidation = [
  body('email').isEmail().normalizeEmail()
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/logout', logout);
router.get('/me', protect, getMe);

// Email verification routes
router.post('/verify-email', verifyEmailValidation, verifyEmail);
router.post('/resend-verification', resendVerificationValidation, resendVerificationCode);

export default router;