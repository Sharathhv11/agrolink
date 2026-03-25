const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ── Auth middleware ──────────────────────────────────────────────────
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
    req.userId = decoded.id || decoded.userId;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// ── Helper: category → friendly label ───────────────────────────────
const CATEGORY_LABELS = {
  farmer: '👨‍🌾 Farmer',
  laborer: '🧑‍🔧 Laborer',
  machine_owner: '🚜 Machine Owner',
  machine_operator: '⚙️ Machine Operator',
  pesticide_sprayer: '🧪 Pesticide Sprayer',
  drone_operator: '🛸 Drone Operator',
  irrigation_contractor: '💧 Irrigation Contractor',
  transport_provider: '🚛 Transport Provider',
  fertilizer_supplier: '🧫 Fertilizer Supplier',
  seed_supplier: '🌱 Seed Supplier',
  pesticide_supplier: '🧴 Pesticide Supplier',
  equipment_rental: '🔧 Equipment Rental',
  agriculture_advisor: '📋 Agriculture Advisor',
  soil_testing_agent: '🔬 Soil Testing Agent',
  labor_contractor: '👷 Labor Contractor',
  labor_contractor_agent: '📞 Labor Contractor Agent',
};

// ═══════════════════════════════════════════════════════════════════
//  POST /api/fasal-planner/generate-roadmap
//  Body: { cropName, soilType?, region?, language? }
//  Returns an AI-generated crop roadmap with weekly checkpoints
// ═══════════════════════════════════════════════════════════════════
router.post('/generate-roadmap', authMiddleware, async (req, res) => {
  try {
    const { cropName, soilType, region, language = 'en' } = req.body;

    if (!cropName) {
      return res.status(400).json({ message: 'cropName is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'Gemini API key not configured' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemma-3-27b-it' });

    const langInstruction = language === 'kn'
      ? 'Respond in Kannada language.'
      : 'Respond in English.';

    const prompt = `
You are an expert agricultural advisor. Generate a detailed, practical crop roadmap/plan for growing "${cropName}" in India.
${soilType ? `Soil type: ${soilType}.` : ''}
${region ? `Region: ${region}.` : ''}
${langInstruction}

Return a JSON object (and ONLY a JSON object, no markdown, no backticks) with this exact structure:
{
  "cropName": "${cropName}",
  "totalDuration": "X weeks/months",
  "bestSeason": "Kharif/Rabi/Zaid",
  "estimatedCostPerAcre": "₹XXXX",
  "expectedYieldPerAcre": "XX quintals",
  "summary": "Brief 2-line summary of the crop plan",
  "checkpoints": [
    {
      "week": 1,
      "weekRange": "Week 1-2",
      "phase": "Land Preparation",
      "title": "Short title",
      "description": "Detailed description of what needs to be done",
      "tasks": ["task1", "task2", "task3"],
      "workersNeeded": [
        {
          "role": "tractor_operator",
          "category": "machine_operator",
          "count": 2,
          "ratePerDay": "₹800",
          "daysNeeded": 3
        }
      ],
      "inputsRequired": [
        { "item": "Seeds", "quantity": "20 kg/acre", "estimatedCost": "₹1500" }
      ],
      "tips": "Pro tip for this phase",
      "icon": "🚜"
    }
  ]
}

Include 6-8 checkpoints covering the COMPLETE crop lifecycle:
1. Land Preparation (ploughing, leveling)
2. Seed Treatment & Sowing
3. Irrigation & Early Growth Management
4. Fertilizer Application & Weed Control
5. Pest & Disease Management
6. Flowering & Grain Formation
7. Harvesting
8. Post-Harvest (drying, storage, marketing)

For "workersNeeded", use these valid categories: farmer, laborer, machine_owner, machine_operator, pesticide_sprayer, drone_operator, irrigation_contractor, transport_provider, fertilizer_supplier, seed_supplier, pesticide_supplier, equipment_rental, agriculture_advisor, soil_testing_agent, labor_contractor.

Make it practical for Indian farmers with realistic costs in INR.
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Clean response: strip markdown code fences if present
    let cleaned = responseText.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
    }

    let roadmap;
    try {
      roadmap = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('Failed to parse Gemini response:', parseErr.message);
      console.error('Raw response:', responseText.substring(0, 500));
      return res.status(500).json({
        message: 'AI generated an invalid response. Please try again.',
        raw: responseText.substring(0, 300),
      });
    }

    res.json({ roadmap });
  } catch (err) {
    console.error('Fasal Planner generate-roadmap error:', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
});

// ═══════════════════════════════════════════════════════════════════
//  POST /api/fasal-planner/nearby-workers
//  Body: { categories, lat, lng, radiusKm? }
//  Returns list of available workers near the user within radius
// ═══════════════════════════════════════════════════════════════════
router.post('/nearby-workers', authMiddleware, async (req, res) => {
  try {
    const { categories = [], lat, lng, radiusKm = 5 } = req.body;
    const userId = req.userId;

    // Fetch requesting user to get coordinates if lat/lng not provided
    let userLat = lat;
    let userLng = lng;

    if (!userLat || !userLng) {
      const user = await User.findById(userId).lean();
      userLat = user?.location?.coordinates?.lat;
      userLng = user?.location?.coordinates?.lng;
    }

    if (!userLat || !userLng) {
      return res.status(400).json({ message: 'Location coordinates required' });
    }

    const radiusMeters = (radiusKm || 5) * 1000;

    // Aggregation pipeline with $geoNear
    const pipeline = [
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parseFloat(userLng), parseFloat(userLat)],
          },
          distanceField: 'distanceMeters',
          maxDistance: radiusMeters,
          spherical: true,
          query: {
            _id: { $ne: new (require('mongoose').Types.ObjectId)(userId) },
            availabilityStatus: 'available',
            ...(categories.length > 0 ? { categories: { $in: categories } } : {}),
          },
        },
      },
      {
        $project: {
          name: 1,
          phone: 1,
          avatar: 1,
          categories: 1,
          availabilityStatus: 1,
          rating: 1,
          totalJobsCompleted: 1,
          trustScore: 1,
          'location.village': 1,
          'location.taluk': 1,
          'location.district': 1,
          distanceMeters: 1,
        },
      },
      { $limit: 20 },
    ];

    const workers = await User.aggregate(pipeline);

    // Format distance
    const formatted = workers.map((w) => ({
      ...w,
      distanceKm: (w.distanceMeters / 1000).toFixed(1),
      categoryLabels: (w.categories || []).map((c) => CATEGORY_LABELS[c] || c),
    }));

    res.json({ workers: formatted });
  } catch (err) {
    console.error('Fasal Planner nearby-workers error:', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
});

module.exports = router;
