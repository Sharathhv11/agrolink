const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// Initialize Twilio client lazily to avoid crashing if env vars are missing
let twilioClient = null;
const getTwilioClient = () => {
  if (!twilioClient) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials not configured in environment variables.');
    }
    twilioClient = twilio(accountSid, authToken);
  }
  return twilioClient;
};

// In-memory store for OTPs and rate limiting
const otpStore = new Map(); // phone -> { otp, expiresAt }
const rateLimits = new Map(); // phone -> { count, windowStart }

const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
const MAX_OTP_REQUESTS = 3;
const OTP_EXPIRY = 10 * 60 * 1000; // 10 minutes

// Generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @route   POST /api/otp/send
// @desc    Generate and send an OTP to a phone number
// @access  Private
router.post('/send', protect, async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required.' });
    }

    const cleanedPhone = phone.replace(/[\s-]/g, '');
    const indianPhoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
    
    if (!indianPhoneRegex.test(cleanedPhone)) {
      return res.status(400).json({ message: 'Please enter a valid Indian phone number.' });
    }

    const formattedPhone = cleanedPhone.startsWith('+91')
      ? cleanedPhone
      : cleanedPhone.startsWith('91')
        ? '+' + cleanedPhone
        : '+91' + cleanedPhone;

    // Rate Limiting Check
    const now = Date.now();
    let limitData = rateLimits.get(formattedPhone);

    if (limitData) {
      if (now - limitData.windowStart > RATE_LIMIT_WINDOW) {
        // Reset window
        limitData = { count: 1, windowStart: now };
      } else {
        if (limitData.count >= MAX_OTP_REQUESTS) {
          const timeLeft = Math.ceil((RATE_LIMIT_WINDOW - (now - limitData.windowStart)) / 60000);
          return res.status(429).json({ message: `Too many requests. Please try again after ${timeLeft} minutes.` });
        }
        limitData.count += 1;
      }
    } else {
      limitData = { count: 1, windowStart: now };
    }
    rateLimits.set(formattedPhone, limitData);

    const otp = generateOTP();
    
    // Set expiry
    otpStore.set(formattedPhone, {
      otp,
      expiresAt: now + OTP_EXPIRY
    });

    const client = getTwilioClient();
    const fromPhone = process.env.TWILIO_PHONE_NUMBER;

    if (!fromPhone) {
      throw new Error('Twilio sender phone number is not configured.');
    }

    await client.messages.create({
      body: `Your AgroLink verification code is: ${otp}. This code is valid for 10 minutes. Do not share this code with anyone.`,
      from: fromPhone,
      to: formattedPhone
    });

    res.json({ success: true, message: 'OTP sent successfully.' });
  } catch (error) {
    console.error('OTP Send Error:', error);
    res.status(500).json({ message: error.message || 'Failed to send OTP.' });
  }
});

// @route   POST /api/otp/verify
// @desc    Verify the sent OTP
// @access  Private
router.post('/verify', protect, async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone number and OTP are required.' });
    }

    const cleanedPhone = phone.replace(/[\s-]/g, '');
    const formattedPhone = cleanedPhone.startsWith('+91')
      ? cleanedPhone
      : cleanedPhone.startsWith('91')
        ? '+' + cleanedPhone
        : '+91' + cleanedPhone;

    const storedData = otpStore.get(formattedPhone);

    if (!storedData) {
      return res.status(400).json({ message: 'OTP not found or expired. Please request a new one.' });
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(formattedPhone);
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP entered.' });
    }

    // OTP is valid
    otpStore.delete(formattedPhone);

    // Update user to mark phone as verified
    const user = await User.findById(req.user._id);
    if (user) {
      user.phone = formattedPhone;
      user.phoneVerified = true;
      await user.save();
    }

    res.json({ success: true, message: 'OTP verified successfully.' });
  } catch (error) {
    console.error('OTP Verify Error:', error);
    res.status(500).json({ message: 'Failed to verify OTP.' });
  }
});

module.exports = router;
