const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "fallback_secret", {
    expiresIn: "10d",
  });
};

router.post("/google", async (req, res) => {
  const { access_token } = req.body;
  
  if (!access_token) {
    return res.status(400).json({ message: "No access token provided" });
  }

  try {
    // Backend sends for goole -> google verify and sends the info
    const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    
    if (!response.ok) {
       throw new Error(`Failed to fetch Google profile. Status: ${response.status}`);
    }

    const payload = await response.json();
    const { sub, email, name, picture } = payload;
    
    // Backend stores this info
    let user = await User.findOne({ googleId: sub });
    let isNewUser = false;

    if (!user) {
      if (email) {
        user = await User.findOne({ email });
      }
      
      if (user) {
        user.googleId = sub;
        if (!user.avatar) user.avatar = picture;
        await user.save();
      } else {
        user = await User.create({
          googleId: sub,
          name: name || "Agrolink User",
          email: email || `${sub}@agrolink.local`,
          avatar: picture || "",
        });
        isNewUser = true;
      }
    }

    // backend send jwt for frontend
    const jwtToken = generateToken(user._id);

    const needsOnboarding = !(user.categories && user.categories.length > 0);

    res.json({
      token: jwtToken,
      user,
      isNewUser,
      needsOnboarding
    });
  } catch (error) {
    console.error("Error verifying google token or writing to DB:", error);
    res.status(500).json({ message: "Authentication failed", error: error.message });
  }
});

router.get("/status", (req, res) => {
  res.json({ message: "Auth routes are working" });
});

router.post("/logout", (req, res) => {
  res.json({ success: true });
});

// --- PHONE OTP LOGIN API ---
const twilio = require('twilio');
const loginOtpStore = new Map();

// Helper to init Twilio safely
const sendSms = async (to, body) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromPhone = process.env.TWILIO_PHONE_NUMBER;
  if (accountSid && authToken && fromPhone) {
    const client = twilio(accountSid, authToken);
    await client.messages.create({ body, from: fromPhone, to });
    return true;
  }
  return false;
};

// 1) Send OTP for Login
router.post("/otp/send", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: "Phone number required" });
    
    // Cleanup phone format
    const cleanedPhone = phone.replace(/[\s-]/g, '');
    const formattedPhone = cleanedPhone.startsWith('+91') 
      ? cleanedPhone : cleanedPhone.startsWith('91') ? '+' + cleanedPhone : '+91' + cleanedPhone;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // Valid for 10 mins
    loginOtpStore.set(formattedPhone, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

    const smsSent = await sendSms(formattedPhone, `Your AgroLink login code is ${otp}. Valid for 10 mins.`);

    // If Twilio isn't setup, we return it in development so they can still test
    if (!smsSent && process.env.NODE_ENV !== 'production') {
       return res.json({ success: true, message: "OTP Simulated (Check console or data)", mockOtp: otp });
    }

    res.json({ success: true, message: "OTP Sent via SMS" });
  } catch (error) {
    console.error("OTP send error:", error);
    res.status(500).json({ message: "Failed to process OTP", error: error.message });
  }
});

// 2) Verify OTP & Login
router.post("/otp/verify", async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ message: "Phone and OTP required" });

    const cleanedPhone = phone.replace(/[\s-]/g, '');
    const formattedPhone = cleanedPhone.startsWith('+91') 
      ? cleanedPhone : cleanedPhone.startsWith('91') ? '+' + cleanedPhone : '+91' + cleanedPhone;

    const storedData = loginOtpStore.get(formattedPhone);

    if (!storedData) return res.status(400).json({ message: "OTP not found/requested." });
    if (Date.now() > storedData.expiresAt) {
      loginOtpStore.delete(formattedPhone);
      return res.status(400).json({ message: "OTP expired." });
    }
    if (storedData.otp !== otp) return res.status(400).json({ message: "Invalid OTP." });

    // OTP Correct!
    loginOtpStore.delete(formattedPhone);

    // Find or create user
    let user = await User.findOne({ phone: formattedPhone });
    let isNewUser = false;

    if (!user) {
      user = await User.create({
        phone: formattedPhone,
        name: `User ${formattedPhone.slice(-4)}`,
        phoneVerified: true,
      });
      isNewUser = true;
    } else {
      user.phoneVerified = true;
      await user.save();
    }

    const jwtToken = generateToken(user._id);
    const needsOnboarding = !(user.categories && user.categories.length > 0);

    // Return the standard Auth payload expected by AuthContext
    res.json({
      token: jwtToken,
      user,
      isNewUser,
      needsOnboarding
    });
  } catch (error) {
    console.error("OTP verify error:", error);
    res.status(500).json({ message: "OTP verification failed", error: error.message });
  }
});

module.exports = router;
