const express = require('express');
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth');
const Job = require('../models/Job');
const User = require('../models/User');
const JobMatch = require('../models/JobMatch');
const JobApplication = require('../models/JobApplication');
const JobViewEvent = require('../models/JobViewEvent');
const { matchWorkersForJob } = require('../services/matchingService');
const { queueNotificationsForMatchedWorkers } = require('../services/notificationService');
const { getJobAnalytics } = require('../services/analyticsService');
const { buildWorkerListPdfBuffer } = require('../services/pdfService');

const router = express.Router();
const jobCreateRateLimit = new Map();

const ALLOWED_WAGE_TYPES = new Set(['hourly', 'daily', 'weekly', 'per_task']);
const ALLOWED_CONTACT_PREFS = new Set(['call', 'whatsapp', 'in_app']);

function isFarmer(user) {
  return Array.isArray(user?.categories) && user.categories.includes('farmer');
}

function getCoordinates(body, user) {
  const lat = Number(body?.location?.coordinates?.lat ?? body?.coordinates?.lat ?? user?.location?.coordinates?.lat);
  const lng = Number(body?.location?.coordinates?.lng ?? body?.coordinates?.lng ?? user?.location?.coordinates?.lng);
  return {
    lat: Number.isFinite(lat) ? lat : null,
    lng: Number.isFinite(lng) ? lng : null,
  };
}

function buildShortCode() {
  return Math.random().toString(36).slice(2, 8);
}

function checkRateLimit(userId) {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxInWindow = 10;
  const key = String(userId);
  const state = jobCreateRateLimit.get(key) || { count: 0, startedAt: now };

  if (now - state.startedAt > windowMs) {
    jobCreateRateLimit.set(key, { count: 1, startedAt: now });
    return { blocked: false };
  }

  if (state.count >= maxInWindow) {
    return { blocked: true };
  }

  state.count += 1;
  jobCreateRateLimit.set(key, state);
  return { blocked: false };
}

function validateCreateJob(body) {
  const errors = [];
  const requiredFields = ['title', 'description', 'category', 'workersRequired', 'durationValue', 'durationType', 'startDate', 'wageType', 'wageAmount'];

  requiredFields.forEach((field) => {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      errors.push(`${field} is required`);
    }
  });

  if (!ALLOWED_WAGE_TYPES.has(body.wageType)) errors.push('Invalid wage type');
  if (body.contactPreference && !ALLOWED_CONTACT_PREFS.has(body.contactPreference)) errors.push('Invalid contact preference');
  if (!['days', 'hours'].includes(body.durationType)) errors.push('Invalid duration type');

  return errors;
}

router.post('/', protect, async (req, res) => {
  try {
    if (!isFarmer(req.user)) {
      return res.status(403).json({ message: 'Only farmers can post jobs' });
    }

    const rateLimit = checkRateLimit(req.user._id);
    if (rateLimit.blocked) {
      return res.status(429).json({ message: 'Too many jobs posted. Please wait a minute and try again.' });
    }

    const validationErrors = validateCreateJob(req.body);
    if (validationErrors.length) {
      return res.status(400).json({ message: validationErrors[0], errors: validationErrors });
    }

    const coordinates = getCoordinates(req.body, req.user);
    if (!Number.isFinite(coordinates.lat) || !Number.isFinite(coordinates.lng)) {
      return res.status(400).json({ message: 'Valid GPS coordinates are required' });
    }

    let shortCode = buildShortCode();
    while (await Job.findOne({ shortCode })) {
      shortCode = buildShortCode();
    }
    const job = await Job.create({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      workersRequired: Number(req.body.workersRequired),
      durationValue: Number(req.body.durationValue),
      durationType: req.body.durationType,
      startDate: new Date(req.body.startDate),
      wageType: req.body.wageType,
      wageAmount: Number(req.body.wageAmount),
      facilities: {
        food: Boolean(req.body?.facilities?.food),
        shelter: Boolean(req.body?.facilities?.shelter),
        transport: Boolean(req.body?.facilities?.transport),
        medicalSupport: Boolean(req.body?.facilities?.medicalSupport),
      },
      location: {
        village: req.body?.location?.village || req.user?.location?.village || '',
        taluk: req.body?.location?.taluk || req.user?.location?.taluk || '',
        district: req.body?.location?.district || req.user?.location?.district || '',
        state: req.body?.location?.state || req.user?.location?.state || '',
        addressLine: req.body?.location?.addressLine || req.user?.location?.addressLine || '',
      },
      locationPoint: {
        type: 'Point',
        coordinates: [coordinates.lng, coordinates.lat],
      },
      contactPreference: req.body.contactPreference || 'call',
      shortCode,
      createdBy: req.user._id,
      status: 'open',
    });

    const { workers, radiusUsedKm } = await matchWorkersForJob(job);
    const notificationResult = await queueNotificationsForMatchedWorkers(job, workers);

    return res.status(201).json({
      jobId: job._id,
      shortCode: job.shortCode,
      matchedWorkers: workers.length,
      notificationsQueued: notificationResult.queuedCount,
      radiusUsedKm,
      message: 'Job posted successfully',
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to create job' });
  }
});

router.get('/my-jobs', protect, async (req, res) => {
  try {
    const jobs = await Job.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    return res.json(jobs);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch jobs' });
  }
});

router.delete('/:jobId', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    if (String(job.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not allowed to delete this job' });
    }

    // Optionally cleanup matches/applications as well, but deleting the job is primary
    await Job.deleteOne({ _id: job._id });
    
    // Cleanup related models
    await JobMatch.deleteMany({ jobId: job._id });
    await JobApplication.deleteMany({ jobId: job._id });
    await JobViewEvent.deleteMany({ jobId: job._id });

    return res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to delete job' });
  }
});

router.get('/:jobId/matches', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    if (String(job.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not allowed' });
    }

    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    const matches = await JobMatch.find({ jobId: job._id })
      .sort({ distanceKm: 1 })
      .skip(skip)
      .limit(limit)
      .populate('workerId', 'name phone location availabilityStatus');

    return res.json(
      matches.map((item) => ({
        id: item._id,
        distanceKm: item.distanceKm,
        matchStatus: item.matchStatus,
        worker: item.workerId,
      }))
    );
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch matches' });
  }
});

router.get('/:jobId/analytics', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    if (String(job.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not allowed' });
    }

    const analytics = await getJobAnalytics(new mongoose.Types.ObjectId(job._id));
    return res.json(analytics);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch analytics' });
  }
});

router.post('/:jobId/views', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    await JobViewEvent.create({
      jobId: job._id,
      viewerId: req.user?._id || null,
      viewedAt: new Date(),
    });

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to track view' });
  }
});

router.post('/:jobId/apply', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const existing = await JobApplication.findOne({ jobId: job._id, workerId: req.user._id });
    if (existing) {
      return res.status(200).json({ success: true, message: 'Already applied' });
    }

    await JobApplication.create({ jobId: job._id, workerId: req.user._id, status: 'applied' });
    return res.status(201).json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to apply' });
  }
});

router.get('/:jobId/workers.pdf', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    if (String(job.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not allowed' });
    }

    const matches = await JobMatch.find({ jobId: job._id }).populate('workerId', 'name phone location');
    const workers = matches.map((match) => match.workerId).filter(Boolean);
    const buffer = await buildWorkerListPdfBuffer({ job, workers });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="job-${job.shortCode}-workers.pdf"`);
    return res.send(buffer);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to generate PDF' });
  }
});

router.get('/short/:shortCode', async (req, res) => {
  try {
    const job = await Job.findOne({ shortCode: req.params.shortCode });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const farmer = await User.findById(job.createdBy).select('name phone');
    return res.json({
      _id: job._id,
      title: job.title,
      description: job.description,
      category: job.category,
      wageType: job.wageType,
      wageAmount: job.wageAmount,
      contactPreference: job.contactPreference,
      farmer,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch job' });
  }
});

module.exports = router;
