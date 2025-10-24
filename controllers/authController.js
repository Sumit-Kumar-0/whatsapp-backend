import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import nodemailer from 'nodemailer';

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Generate verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send email function
const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const mailOptions = {
      from: `"WANotifier" <${process.env.SMTP_FROM}>`,
      to: options.email,
      subject: options.subject,
      html: options.html
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log('Email sending error:', error);
    throw new Error('Email could not be sent');
  }
};

// Send welcome email with verification code
const sendWelcomeEmail = async (user, verificationCode) => {
  const message = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1976d2; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .verification-code { 
          background: #1976d2; 
          color: white; 
          padding: 15px; 
          text-align: center; 
          font-size: 24px; 
          font-weight: bold; 
          margin: 20px 0;
          border-radius: 5px;
        }
        .user-info { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to WANotifier! 🎉</h1>
        </div>
        <div class="content">
          <p>Hello ${user.firstName} ${user.lastName},</p>
          <p>Your account has been successfully created and you're now ready to start using our WhatsApp Business API services.</p>
          
          <div class="user-info">
            <p><strong>Account Details:</strong></p>
            <p><strong>Business:</strong> ${user.businessName}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>WhatsApp:</strong> ${user.whatsappNumber}</p>
          </div>
          
          <p><strong>Email Verification Code:</strong></p>
          <div class="verification-code">${verificationCode}</div>
          <p>Use this code to verify your email address. This code will expire in 1 hour.</p>
          
          <p><strong>What you can do:</strong></p>
          <ul>
            <li>Create and manage WhatsApp campaigns</li>
            <li>Organize contacts into groups</li>
            <li>Send bulk messages</li>
            <li>Track message delivery</li>
          </ul>
          <p>If you have any questions, feel free to contact our support team.</p>
          <p>Best regards,<br><strong>WANotifier Team</strong></p>
        </div>
        <div class="footer">
          <p>&copy; 2024 WANotifier. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    email: user.email,
    subject: 'Welcome to WANotifier - Verify Your Email',
    html: message
  });
};

// Send verification code email (for existing users)
const sendVerificationEmail = async (user, verificationCode) => {
  const message = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1976d2; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .verification-code { 
          background: #1976d2; 
          color: white; 
          padding: 15px; 
          text-align: center; 
          font-size: 24px; 
          font-weight: bold; 
          margin: 20px 0;
          border-radius: 5px;
        }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Email Verification</h1>
        </div>
        <div class="content">
          <p>Hello ${user.firstName} ${user.lastName},</p>
          <p>We received a request to verify your email address. Please use the verification code below:</p>
          
          <div class="verification-code">${verificationCode}</div>
          
          <p>This code will expire in 1 hour.</p>
          <p>If you didn't request this verification, please ignore this email.</p>
          
          <p>Best regards,<br><strong>WANotifier Team</strong></p>
        </div>
        <div class="footer">
          <p>&copy; 2024 WANotifier. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    email: user.email,
    subject: 'WANotifier - Email Verification Code',
    html: message
  });
};

// Send response with token
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  
  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  res.status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        whatsappNumber: user.whatsappNumber,
        businessName: user.businessName,
        businessCountry: user.businessCountry,
        businessWebsite: user.businessWebsite,
        referralSource: user.referralSource,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });
};

// Register user
export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { 
      firstName,
      lastName,
      email, 
      password,
      whatsappNumber,
      whatsappCountryCode,
      businessName,
      businessCountry, 
      businessWebsite,
      useCase,
      contactSize,
      monthlyBudget,
      businessCategory,
      companySize,
      roleInCompany,
      referralSource
    } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Create user with all fields
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      whatsappNumber,
      whatsappCountryCode,
      businessName,
      businessCountry,
      businessWebsite,
      useCase,
      contactSize,
      monthlyBudget,
      businessCategory,
      companySize,
      roleInCompany,
      referralSource,
      role: 'vendor',
      verificationCode,
      verificationCodeExpires,
      isEmailVerified: false
    });

    // Send welcome email with verification code
    try {
      await sendWelcomeEmail(user, verificationCode);
    } catch (emailError) {
      console.log('Welcome email failed to send:', emailError);
    }

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// Login user
export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Check if user exists and password is correct
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Account is not active. Please contact administrator.'
      });
    }

    // If email is not verified, send new verification code
    if (!user.isEmailVerified) {
      const verificationCode = generateVerificationCode();
      const verificationCodeExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      
      user.verificationCode = verificationCode;
      user.verificationCodeExpires = verificationCodeExpires;
      await user.save();

      // Send verification email
      try {
        await sendVerificationEmail(user, verificationCode);
      } catch (emailError) {
        console.log('Verification email failed to send:', emailError);
      }

      return res.status(200).json({
        success: true,
        message: 'Login successful. Please verify your email. Verification code sent.',
        requiresVerification: true,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          whatsappNumber: user.whatsappNumber,
          businessName: user.businessName,
          role: user.role,
          isEmailVerified: user.isEmailVerified
        }
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// Verify email
export const verifyEmail = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, verificationCode } = req.body;

    console.log('🔍 Verifying email:', email);

    // Find user by email and verification code
    const user = await User.findOne({
      email,
      verificationCode,
      verificationCodeExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code or code has expired'
      });
    }

    // Mark email as verified and clear verification code
    user.isEmailVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    console.log('🔍 User after save - isEmailVerified:', user.isEmailVerified);

    // Generate new token for the verified user
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        whatsappNumber: user.whatsappNumber,
        businessName: user.businessName,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    next(error);
  }
};

// Resend verification code
export const resendVerificationCode = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.verificationCode = verificationCode;
    user.verificationCodeExpires = verificationCodeExpires;
    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(user, verificationCode);
    } catch (emailError) {
      console.log('Verification email failed to send:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Verification code sent successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Logout user
export const logout = async (req, res, next) => {
  try {
    // ✅ Get user ID from request body or token
    let userId;
    
    if (req.body && req.body.id) {
      userId = req.body.id;
    } else if (req.user && req.user.id) {
      userId = req.user.id;
    }

    console.log("👤 User ID for logout:", userId);

    res.cookie('token', 'none', {
      expires: new Date(Date.now()),
      httpOnly: true
    });

    if (userId) {
      await User.findByIdAndUpdate(userId, {
        isEmailVerified: false
      });
      console.log("✅ isEmailVerified set to false for user:", userId);
    }

    res.status(200).json({
      success: true,
      message: 'User logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};