const express = require('express');
const router = express.Router();
const LaborerBasic = require('../models/LaborerBasic');

// POST /api/laborers/register
router.post('/register', async (req, res) => {
  try {
    const { name, phone, state, district, taluk } = req.body;

    // Validate required fields
    if (!name || !phone || !state || !district || !taluk) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: name, phone, state, district, taluk',
      });
    }

    // Normalize phone (strip spaces)
    const normalizedPhone = phone.replace(/\s/g, '');

    // Check for duplicate phone
    const existing = await LaborerBasic.findOne({ phone: normalizedPhone });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'This phone number is already registered. You will receive job updates via SMS.',
      });
    }

    const laborer = await LaborerBasic.create({
      name: name.trim(),
      phone: normalizedPhone,
      state: state.trim(),
      district: district.trim(),
      taluk: taluk.trim(),
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful. You will receive job updates via SMS.',
      data: { id: laborer._id, name: laborer.name, phone: laborer.phone },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This phone number is already registered.',
      });
    }
    console.error('Laborer registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.',
    });
  }
});

// GET /api/laborers/by-location  — for future SMS integration
// Query: ?state=Karnataka&district=Hassan&taluk=Belur
router.get('/by-location', async (req, res) => {
  try {
    const { state, district, taluk } = req.query;
    const filter = {};
    if (state) filter.state = state;
    if (district) filter.district = district;
    if (taluk) filter.taluk = taluk;

    const laborers = await LaborerBasic.find(filter).select('name phone state district taluk');
    res.json({ success: true, count: laborers.length, data: laborers });
  } catch (error) {
    console.error('Laborer query error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
