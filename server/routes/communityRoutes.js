const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const CommunityMessage = require('../models/CommunityMessage');
const CommunityGroup = require('../models/CommunityGroup');
const User = require('../models/User');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'community');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `community-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const extName = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowed.test(file.mimetype);
    if (extName && mimeType) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Auth middleware
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-googleCalendarToken');
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token verification failed' });
  }
};

// ═══════════════════════════════════════════════
//  COMMUNITY GROUP ENDPOINTS
// ═══════════════════════════════════════════════

// Seed default communities (runs once on first request)
async function seedDefaults() {
  const exists = await CommunityGroup.countDocuments({ isDefault: true });
  if (exists > 0) return;

  const defaults = [
    { name: 'Wheat Community', slug: 'wheat', icon: '🌾', color: 'amber', description: 'For wheat growers & harvesters', isDefault: true },
    { name: 'Rice / Paddy', slug: 'rice', icon: '🍚', color: 'emerald', description: 'Rice farming discussions', isDefault: true },
    { name: 'Vegetables', slug: 'vegetables', icon: '🥬', color: 'green', description: 'Vegetable growers hub', isDefault: true },
    { name: 'General Talk', slug: 'general', icon: '🌱', color: 'violet', description: 'Open discussions for everyone', isDefault: true },
  ];

  for (const d of defaults) {
    await CommunityGroup.create({
      ...d,
      creator: '000000000000000000000000', // system
      creatorName: 'AgroLink',
      members: [],
      memberCount: 0,
    });
  }
  console.log('[Community] Default communities seeded');
}

// GET /api/community/groups — list all communities
router.get('/groups', authMiddleware, async (req, res) => {
  try {
    await seedDefaults();
    const groups = await CommunityGroup.find()
      .sort({ isDefault: -1, memberCount: -1, createdAt: -1 })
      .lean();

    // Annotate with isMember flag for the current user
    const userId = req.user._id.toString();
    const enriched = groups.map((g) => ({
      ...g,
      isMember: g.isDefault || g.members.some((m) => m.toString() === userId),
    }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch groups', error: err.message });
  }
});

// GET /api/community/groups/my — list communities the user has joined
router.get('/groups/my', authMiddleware, async (req, res) => {
  try {
    await seedDefaults();
    const userId = req.user._id;

    // Default groups + groups user joined
    const groups = await CommunityGroup.find({
      $or: [{ isDefault: true }, { members: userId }],
    })
      .sort({ isDefault: -1, memberCount: -1 })
      .lean();

    const enriched = groups.map((g) => ({ ...g, isMember: true }));
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch your groups', error: err.message });
  }
});

// POST /api/community/groups — create a new community
router.post('/groups', authMiddleware, async (req, res) => {
  try {
    const { name, description, icon, color } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Community name is required' });
    }

    // Generate slug
    let slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Ensure uniqueness
    const existing = await CommunityGroup.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const group = await CommunityGroup.create({
      name: name.trim(),
      slug,
      description: (description || '').trim(),
      icon: icon || '🌱',
      color: color || 'emerald',
      creator: req.user._id,
      creatorName: req.user.name,
      members: [req.user._id],
      memberCount: 1,
    });

    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create community', error: err.message });
  }
});

// POST /api/community/groups/:id/join — join a community
router.post('/groups/:id/join', authMiddleware, async (req, res) => {
  try {
    const group = await CommunityGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Community not found' });

    const userId = req.user._id;
    if (group.members.includes(userId)) {
      return res.json({ message: 'Already a member', group });
    }

    group.members.push(userId);
    group.memberCount = group.members.length;
    await group.save();

    res.json({ message: 'Joined successfully', group });
  } catch (err) {
    res.status(500).json({ message: 'Failed to join community', error: err.message });
  }
});

// POST /api/community/groups/:id/leave — leave a community
router.post('/groups/:id/leave', authMiddleware, async (req, res) => {
  try {
    const group = await CommunityGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Community not found' });

    const userId = req.user._id.toString();
    group.members = group.members.filter((m) => m.toString() !== userId);
    group.memberCount = group.members.length;
    await group.save();

    res.json({ message: 'Left successfully', group });
  } catch (err) {
    res.status(500).json({ message: 'Failed to leave community', error: err.message });
  }
});

// ═══════════════════════════════════════════════
//  MESSAGE ENDPOINTS
// ═══════════════════════════════════════════════

// GET /api/community/messages?community=wheat&page=1&limit=50
router.get('/messages', authMiddleware, async (req, res) => {
  try {
    const { community = 'wheat', page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await CommunityMessage.find({ community })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch messages', error: err.message });
  }
});

// POST /api/community/messages — send text message
router.post('/messages', authMiddleware, async (req, res) => {
  try {
    const { community = 'wheat', text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    const message = await CommunityMessage.create({
      community,
      sender: req.user._id,
      senderName: req.user.name,
      senderAvatar: req.user.avatar,
      senderCategory: req.user.categories?.[0] || 'farmer',
      type: 'text',
      text: text.trim(),
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message', error: err.message });
  }
});

// POST /api/community/messages/image — send image
router.post('/messages/image', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const { community = 'wheat', text = '' } = req.body;
    const imageUrl = `/uploads/community/${req.file.filename}`;

    const message = await CommunityMessage.create({
      community,
      sender: req.user._id,
      senderName: req.user.name,
      senderAvatar: req.user.avatar,
      senderCategory: req.user.categories?.[0] || 'farmer',
      type: 'image',
      text: text.trim() || '',
      imageUrl,
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: 'Failed to upload image', error: err.message });
  }
});

// POST /api/community/messages/:id/like — toggle like
router.post('/messages/:id/like', authMiddleware, async (req, res) => {
  try {
    const message = await CommunityMessage.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    const userId = req.user._id;
    const alreadyLiked = message.likes.includes(userId);

    if (alreadyLiked) {
      message.likes = message.likes.filter((id) => !id.equals(userId));
    } else {
      message.likes.push(userId);
    }

    await message.save();
    res.json({ likes: message.likes.length, liked: !alreadyLiked });
  } catch (err) {
    res.status(500).json({ message: 'Failed to toggle like', error: err.message });
  }
});

module.exports = router;
