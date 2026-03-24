const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "fallback_secret", {
    expiresIn: "30d",
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
       throw new Error("Failed to fetch Google profile");
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
          name: name,
          email: email,
          avatar: picture,
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
    console.error("Error verifying google token", error);
    res.status(401).json({ message: "Invalid Google token" });
  }
});

router.get("/status", (req, res) => {
  res.json({ message: "Auth routes are working" });
});

module.exports = router;
