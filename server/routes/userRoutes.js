const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// @route   PUT /api/users/onboard
// @desc    Update user onboarding (categories, location, phone language)
// @access  Private
router.put('/onboard', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      if (req.body.categories && Array.isArray(req.body.categories)) {
        user.categories = req.body.categories;
      } else if (req.body.category) {
        user.categories = [req.body.category];
      }

      if (req.body.location && typeof req.body.location === 'object') {
        const { village, taluk, district, state, addressLine, coordinates } = req.body.location;
        user.location = user.location || {};
        user.location.coordinates = user.location.coordinates || {};

        if (typeof village === 'string') user.location.village = village;
        if (typeof taluk === 'string') user.location.taluk = taluk;
        if (typeof district === 'string') user.location.district = district;
        if (typeof state === 'string') user.location.state = state;
        if (typeof addressLine === 'string') user.location.addressLine = addressLine;

        if (coordinates && typeof coordinates === 'object') {
          const lat = Number(coordinates.lat);
          const lng = Number(coordinates.lng);
          if (Number.isFinite(lat) && Number.isFinite(lng)) {
            user.location.coordinates.lat = lat;
            user.location.coordinates.lng = lng;
          }
        }
      }

      // Validate and save phone (Indian numbers: +91 followed by 10 digits)
      if (typeof req.body.phone === 'string') {
        const cleaned = req.body.phone.replace(/[\s-]/g, '');
        const indianPhoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
        if (!indianPhoneRegex.test(cleaned)) {
          return res.status(400).json({ message: 'Please enter a valid Indian phone number.' });
        }
        // Normalize to +91XXXXXXXXXX
        user.phone = cleaned.startsWith('+91')
          ? cleaned
          : cleaned.startsWith('91')
            ? '+' + cleaned
            : '+91' + cleaned;
      }

      // Validate and save language
      if (typeof req.body.language === 'string') {
        if (!['en', 'kn'].includes(req.body.language)) {
          return res.status(400).json({ message: 'Language must be "en" or "kn".' });
        }
        user.language = req.body.language;
      }

      if (typeof req.body.availabilityStatus === 'string') {
        if (!['available', 'busy', 'offline'].includes(req.body.availabilityStatus)) {
          return res.status(400).json({ message: 'Invalid availability status.' });
        }
        user.availabilityStatus = req.body.availabilityStatus;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        categories: updatedUser.categories,
        location: updatedUser.location,
        phone: updatedUser.phone,
        language: updatedUser.language,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   GET /api/users/me
// @desc    Get user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// @route   PUT /api/users/language
// @desc    Persist UI language preference (en | kn) for notifications and profile
// @access  Private
router.put('/language', protect, async (req, res) => {
  try {
    const { language } = req.body;
    if (typeof language !== 'string' || !['en', 'kn'].includes(language)) {
      return res.status(400).json({ message: 'Language must be "en" or "kn".' });
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { language } },
      { new: true }
    ).select('language name email');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ language: user.language });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

// @route   POST /api/users/follow/:id
// @desc    Follow / Unfollow a user
// @access  Private
router.post('/follow/:id', protect, async (req, res) => {
  try {
    const targetId = req.params.id;
    const myId = req.user._id;

    if (targetId === myId.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const targetUser = await User.findById(targetId);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    const me = await User.findById(myId);

    const alreadyFollowing = me.following.some((id) => id.toString() === targetId);

    if (alreadyFollowing) {
      // Unfollow
      me.following = me.following.filter((id) => id.toString() !== targetId);
      targetUser.followers = targetUser.followers.filter((id) => id.toString() !== myId.toString());
    } else {
      // Follow
      me.following.push(targetId);
      targetUser.followers.push(myId);
    }

    await me.save();
    await targetUser.save();

    res.json({
      followed: !alreadyFollowing,
      followersCount: targetUser.followers.length,
      followingCount: me.following.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/explore
// @desc    Get farmers / owners to discover (Explore tab)
// @access  Private
router.get('/explore', protect, async (req, res) => {
  try {
    const myId = req.user._id;
    const me = await User.findById(myId).select('following location');

    // Find users that are NOT the current user
    // Prioritize: same district, farmers/machine_owners, etc.
    const query = { _id: { $ne: myId } };

    const users = await User.find(query)
      .select('name email avatar categories location availabilityStatus followers following rating totalJobsCompleted')
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const myFollowing = (me.following || []).map((id) => id.toString());

    const enriched = users.map((u) => ({
      _id: u._id,
      name: u.name,
      avatar: u.avatar,
      categories: u.categories || [],
      location: u.location || {},
      availabilityStatus: u.availabilityStatus || 'available',
      followersCount: (u.followers || []).length,
      followingCount: (u.following || []).length,
      rating: u.rating?.average || 0,
      jobsCompleted: u.totalJobsCompleted || 0,
      isFollowing: myFollowing.includes(u._id.toString()),
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
