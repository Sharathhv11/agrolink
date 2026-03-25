const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
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

const CROP_META = {
  ragi: {
    enName: 'Ragi (Finger Millet)',
    knName: 'ರಾಗಿ',
    season: { en: 'Kharif', kn: 'ಖಾರಿಫ್' },
    totalDuration: { en: '4-5 months', kn: '4-5 ತಿಂಗಳು' },
    estimatedCostPerAcre: '₹7,000',
    expectedYieldPerAcre: '8-10 quintals',
  },
  wheat: {
    enName: 'Wheat',
    knName: 'ಗೋಧಿ',
    season: { en: 'Rabi', kn: 'ರಬಿ' },
    totalDuration: { en: '4-5 months', kn: '4-5 ತಿಂಗಳು' },
    estimatedCostPerAcre: '₹9,000',
    expectedYieldPerAcre: '12-15 quintals',
  },
  corn: {
    enName: 'Corn (Maize)',
    knName: 'ಮೆಕ್ಕೆಜೋಳ',
    season: { en: 'Kharif / Rabi', kn: 'ಖಾರಿಫ್ / ರಬಿ' },
    totalDuration: { en: '3-4 months', kn: '3-4 ತಿಂಗಳು' },
    estimatedCostPerAcre: '₹8,000',
    expectedYieldPerAcre: '10-14 quintals',
  },
  paddy: {
    enName: 'Paddy (Rice)',
    knName: 'ಭತ್ತ',
    season: { en: 'Kharif', kn: 'ಖಾರಿಫ್' },
    totalDuration: { en: '4-6 months', kn: '4-6 ತಿಂಗಳು' },
    estimatedCostPerAcre: '₹12,000',
    expectedYieldPerAcre: '18-25 quintals',
  },
  sugarcane: {
    enName: 'Sugarcane',
    knName: 'ಕಬ್ಬು',
    season: { en: 'All Year', kn: 'ವರ್ಷಪೂರ್ತಿ' },
    totalDuration: { en: '12-18 months', kn: '12-18 ತಿಂಗಳು' },
    estimatedCostPerAcre: '₹18,000',
    expectedYieldPerAcre: '60-80 tons',
  },
  groundnut: {
    enName: 'Groundnut',
    knName: 'ಕಡಲೆಕಾಯಿ',
    season: { en: 'Kharif', kn: 'ಖಾರಿಫ್' },
    totalDuration: { en: '3-5 months', kn: '3-5 ತಿಂಗಳು' },
    estimatedCostPerAcre: '₹7,500',
    expectedYieldPerAcre: '8-12 quintals',
  },
};

function normalizeCropKey(cropName) {
  const s = String(cropName || '').toLowerCase();
  if (s.includes('ragi')) return 'ragi';
  if (s.includes('wheat')) return 'wheat';
  if (s.includes('corn') || s.includes('maize')) return 'corn';
  if (s.includes('paddy') || s.includes('rice')) return 'paddy';
  if (s.includes('sugarcane') || s.includes('sugar cane')) return 'sugarcane';
  if (s.includes('groundnut') || s.includes('peanut')) return 'groundnut';
  return null;
}

function roleTemplate(phaseKey) {
  // Keep categories consistent with User.categories enum (hackathon-friendly)
  switch (phaseKey) {
    case 'land':
      return [
        { role: 'tractor_operator', category: 'machine_operator', count: 2, ratePerDay: '₹800', daysNeeded: 2 },
        { role: 'laborer', category: 'laborer', count: 4, ratePerDay: '₹350', daysNeeded: 2 },
      ];
    case 'sowing':
      return [
        { role: 'laborer', category: 'laborer', count: 6, ratePerDay: '₹350', daysNeeded: 2 },
        { role: 'seed_supplier', category: 'seed_supplier', count: 1, ratePerDay: '₹0', daysNeeded: 1 },
      ];
    case 'irrigation':
      return [
        { role: 'irrigation_contractor', category: 'irrigation_contractor', count: 1, ratePerDay: '₹1200', daysNeeded: 3 },
        { role: 'laborer', category: 'laborer', count: 3, ratePerDay: '₹350', daysNeeded: 3 },
      ];
    case 'fertilizer':
      return [
        { role: 'fertilizer_supplier', category: 'fertilizer_supplier', count: 1, ratePerDay: '₹0', daysNeeded: 1 },
        { role: 'laborer', category: 'laborer', count: 4, ratePerDay: '₹350', daysNeeded: 2 },
      ];
    case 'pest':
      return [
        { role: 'pesticide_sprayer', category: 'pesticide_sprayer', count: 1, ratePerDay: '₹900', daysNeeded: 2 },
        { role: 'pesticide_supplier', category: 'pesticide_supplier', count: 1, ratePerDay: '₹0', daysNeeded: 1 },
      ];
    case 'flowering':
      return [{ role: 'labor_contractor', category: 'labor_contractor', count: 3, ratePerDay: '₹500', daysNeeded: 4 }];
    case 'harvest':
      return [
        { role: 'labor_contractor', category: 'labor_contractor', count: 8, ratePerDay: '₹500', daysNeeded: 3 },
        { role: 'transport_provider', category: 'transport_provider', count: 1, ratePerDay: '₹1200', daysNeeded: 1 },
      ];
    case 'post':
      return [
        { role: 'transport_provider', category: 'transport_provider', count: 1, ratePerDay: '₹1200', daysNeeded: 1 },
        { role: 'laborer', category: 'laborer', count: 3, ratePerDay: '₹350', daysNeeded: 2 },
      ];
    default:
      return [{ role: 'laborer', category: 'laborer', count: 4, ratePerDay: '₹350', daysNeeded: 2 }];
  }
}

function inputsTemplate(phaseKey, cropLabelEn, cropLabelKn) {
  const cropEn = cropLabelEn;
  const cropKn = cropLabelKn;
  switch (phaseKey) {
    case 'land':
      return [
        { item: 'Soil preparation', quantity: '1 acre', estimatedCost: '₹1000' },
        { item: 'Farm yard manure', quantity: '10 cart loads', estimatedCost: '₹2000' },
      ];
    case 'sowing':
      return [
        {
          item: 'Seeds',
          quantity: cropEn === 'Paddy (Rice)' ? 'Seedlings' : 'Seeds',
          estimatedCost: '₹1500',
        },
      ];
    case 'irrigation':
      return [{ item: 'Water management', quantity: 'As required', estimatedCost: '₹1200' }];
    case 'fertilizer':
      return [
        { item: 'Fertilizer', quantity: 'NPK split dose', estimatedCost: '₹2500' },
        { item: 'Weed control', quantity: 'Hand weeding + herbicide (if needed)', estimatedCost: '₹1000' },
      ];
    case 'pest':
      return [
        { item: 'Pesticide / Bio-control', quantity: 'As per infestation', estimatedCost: '₹1800' },
        { item: 'Protective sprays', quantity: '1-2 rounds', estimatedCost: '₹900' },
      ];
    case 'flowering':
      return [{ item: 'Nutrient support', quantity: 'Foliar / top dressing', estimatedCost: '₹1600' }];
    case 'harvest':
      return [{ item: 'Harvesting tools', quantity: 'Manpower + small equipment', estimatedCost: '₹1200' }];
    case 'post':
      return [{ item: 'Drying & storage', quantity: 'Shade drying', estimatedCost: '₹900' }];
    default:
      return [{ item: 'General supplies', quantity: '1 acre', estimatedCost: '₹1000' }];
  }
}

function localizedCheckpoint(phaseKey, idx, language, cropLabelEn, cropLabelKn) {
  const t = language === 'kn';
  const week = idx + 1;
  const weekRange = t
    ? `ವಾರ ${week}-${week + 1}`
    : `Week ${week}-${week + 1}`;

  const phases = {
    land: {
      en: { phase: 'Land Preparation', title: 'Plough, level & layout', icon: '🚜', summary: 'Prepare the field for uniform germination.' },
      kn: { phase: 'ಭೂಮಿ ಸಿದ್ಧತೆ', title: 'ಉಳುಮೆ, ಸಮತಟ್ಟಾಗಿಸಿ', icon: '🚜', summary: 'ಬೆಳೆ ಸಮವಾಗಿ ಮೊಳಕೆ ಬರಲು ಕ್ಷೇತ್ರ ಸಿದ್ಧಪಡಿಸಿ.' },
    },
    sowing: {
      en: { phase: 'Seed Treatment & Sowing', title: 'Treat seeds & sow', icon: '🌱', summary: 'Use quality seeds and correct spacing.' },
      kn: { phase: 'ಬೀಜ ಚಿಕಿತ್ಸೆ ಮತ್ತು ಬಿತ್ತನೆ', title: 'ಬೀಜ ಚಿಕಿತ್ಸೆ ಮಾಡಿ', icon: '🌱', summary: 'ಗುಣಮಟ್ಟದ ಬೀಜ ಮತ್ತು ಸರಿಯಾದ ಅಂತರ ಬಳಸಿ.' },
    },
    irrigation: {
      en: { phase: 'Irrigation & Early Growth', title: 'First irrigation plan', icon: '💧', summary: 'Water at critical early stages.' },
      kn: { phase: 'ನೀರಾವರಿ ಮತ್ತು ಆರಂಭಿಕ ಬೆಳವಣಿಗೆ', title: 'ಮೊದಲ ನೀರಾವರಿ', icon: '💧', summary: 'ಆರಂಭದ ಹಂತಗಳಲ್ಲಿ ನೀರು ಸರಿಯಾಗಿ ನೀಡಿ.' },
    },
    fertilizer: {
      en: { phase: 'Fertilizer & Weed Control', title: 'Top dressing & weeding', icon: '🧪', summary: 'Feed crop and reduce weeds.' },
      kn: { phase: 'ಗೊಬ್ಬರ ಮತ್ತು ಕಳೆ ನಿಯಂತ್ರಣ', title: 'ಮೇಲಿನ ಗೊಬ್ಬರ + ಕಳೆಯ ತೆಗೆದು', icon: '🧪', summary: 'ಬೆಳೆಗೆ ಪೋಷಕಾಂಶ ನೀಡಿ ಮತ್ತು ಕಳೆ ಕಡಿಮೆ ಮಾಡಿ.' },
    },
    pest: {
      en: { phase: 'Pest & Disease Management', title: 'Monitor & spray', icon: '🛡️', summary: 'Act early to prevent spread.' },
      kn: { phase: 'ಕೀಟ ಮತ್ತು ರೋಗ ನಿರ್ವಹಣೆ', title: 'ನಿರೀಕ್ಷಿಸಿ ಮತ್ತು ಸಿಂಪಡಣೆ', icon: '🛡️', summary: 'ಬೆಳೆ ಹರಡುವಿಕೆ ತಪ್ಪಿಸಲು ಆರಂಭದಲ್ಲೇ ಕ್ರಮ.' },
    },
    flowering: {
      en: { phase: 'Flowering & Grain Formation', title: 'Support flowering', icon: '🌼', summary: 'Maintain nutrients and moisture.' },
      kn: { phase: 'ಹೂಬಿಡುವಿಕೆ ಮತ್ತು ದಾಣ್ಯ ರಚನೆ', title: 'ಹೂಬಿಡುವಿಕೆಗೆ ಬೆಂಬಲ', icon: '🌼', summary: 'ಪೋಷಕಾಂಶ ಮತ್ತು ತೇವಾಂಶ ಕಾಪಾಡಿ.' },
    },
    harvest: {
      en: { phase: 'Harvesting', title: 'Harvest at right time', icon: '🌾', summary: 'Harvest when maturity is reached.' },
      kn: { phase: 'ಕೊಯ್ಲು', title: 'ಸರಿಯಾದ ಸಮಯದಲ್ಲಿ ಕೊಯ್ಲು', icon: '🌾', summary: 'ಪಕ್ವತೆ ಬಂದಾಗ ಕೊಯ್ಯಿರಿ.' },
    },
    post: {
      en: { phase: 'Post-harvest', title: 'Dry, store & market', icon: '📦', summary: 'Reduce losses after harvesting.' },
      kn: { phase: 'ಕೊಯ್ಲಿನ ನಂತರ', title: 'ಒಣಗಿಸಿ, ಸಂಗ್ರಹಿಸಿ', icon: '📦', summary: 'ಕೊಯ್ಲಿನ ನಂತರ ನಷ್ಟ ಕಡಿಮೆ ಮಾಡಿ.' },
    },
  };

  const phase = phases[phaseKey] || phases.land;
  const phaseObj = t ? phase.kn : phase.en;
  const roleWorkers = roleTemplate(phaseKey);
  const inputs = inputsTemplate(phaseKey, cropLabelEn, cropLabelKn);

  const baseDescriptionEn = {
    land: 'Plough and level the field. Remove stones and ensure proper drainage.',
    sowing: 'Treat seeds (where applicable) and sow using recommended spacing for strong roots.',
    irrigation: 'Plan irrigation intervals based on soil moisture. Avoid water stress.',
    fertilizer: 'Apply fertilizer in split doses and do timely weeding for healthier growth.',
    pest: 'Inspect crop regularly. Spray only when needed and follow safe intervals.',
    flowering: 'Keep field moisture steady and support flowering with nutrients.',
    harvest: 'Harvest at maturity to avoid grain loss. Keep harvested crop protected.',
    post: 'Dry produce properly, store safely, and plan transport to market.',
  }[phaseKey];

  const baseDescriptionKn = {
    land: 'ಉಳುಮೆ ಮಾಡಿ ಸಮತಟ್ಟಾಗಿಸಿ. ಕಲ್ಲುಗಳನ್ನು ತೆಗೆದು, ನೀರು ಹರಿಯುವಿಕೆ ಸರಿಯಾಗಿ ಇರಲಿ.',
    sowing: 'ಬೀಜ (ಅಗತ್ಯ ಇದ್ದರೆ) ಚಿಕಿತ್ಸೆ ಮಾಡಿ ಮತ್ತು ಶಿಫಾರಸು ಮಾಡಿದ ಅಂತರದಲ್ಲಿ ಬಿತ್ತನೆ ಮಾಡಿ.',
    irrigation: 'ಮಣ್ಣಿನ ತೇವಾಂಶಕ್ಕೆ ಅನುಗುಣವಾಗಿ ನೀರಾವರಿ ಅವಧಿ ಯೋಜಿಸಿ. ನೀರಿನ ಒತ್ತಡ ತಪ್ಪಿಸಿ.',
    fertilizer: 'ಗೊಬ್ಬರವನ್ನು ಹಂತವಾಗಿ ನೀಡಿ ಮತ್ತು ಸಮಯಕ್ಕೆ ಕಳೆ ತೆಗೆಯಿರಿ.',
    pest: 'ಬೆಳೆ ನಿಯಮಿತವಾಗಿ ಪರಿಶೀಲಿಸಿ. ಅಗತ್ಯ ಇದ್ದಾಗ ಮಾತ್ರ ಸಿಂಪಡಣೆ ಮಾಡಿ.',
    flowering: 'ತೇವಾಂಶ ಕಾಪಾಡಿ ಮತ್ತು ಹೂಬಿಡುವಿಕೆಗೆ ಪೋಷಕಾಂಶ ನೀಡಿ.',
    harvest: 'ಪಕ್ವತೆ ಬಂದಾಗ ಕೊಯ್ಯಿರಿ. ಕೊಯ್ಲು ಮಾಡಿದ ಉತ್ಪನ್ನವನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಕಾಪಾಡಿ.',
    post: 'ಉತ್ಪನ್ನವನ್ನು ಸರಿಯಾಗಿ ಒಣಗಿಸಿ, ಸುರಕ್ಷಿತವಾಗಿ ಸಂಗ್ರಹಿಸಿ ಮತ್ತು ಮಾರುಕಟ್ಟೆಗೆ ಯೋಜನೆ ಮಾಡಿ.',
  }[phaseKey];

  const tasksEn = {
    land: ['Plough and level', 'Remove weeds & stones', 'Arrange drainage channels'],
    sowing: ['Prepare seed bed', 'Seed treatment (if needed)', 'Sow with correct spacing'],
    irrigation: ['First irrigation', 'Maintain moisture', 'Check standing water/drying'],
    fertilizer: ['Apply basal + top dressing', 'Weed management', 'Irrigation after fertilizer'],
    pest: ['Scout crop weekly', 'Identify pest early', 'Spray as per guidance'],
    flowering: ['Support nutrient uptake', 'Remove weak plants (if needed)', 'Prevent water stress'],
    harvest: ['Harvest at maturity', 'Collect and shade', 'Avoid grain losses'],
    post: ['Dry under shade/sun', 'Sort and store', 'Transport to mandi/market'],
  }[phaseKey];

  const tasksKn = {
    land: ['ಉಳುಮೆ ಮಾಡಿ ಸಮತಟ್ಟಾಗಿಸಿ', 'ಕಳೆ ಮತ್ತು ಕಲ್ಲು ತೆಗೆದು', 'ನೀರು ಹರಿಯುವ ಚಾನಲ್ ಸಿದ್ದಪಡಿಸಿ'],
    sowing: ['ಬೀಜಮಾಳ ಸಿದ್ಧತೆ', 'ಬೀಜ ಚಿಕಿತ್ಸೆ (ಅಗತ್ಯ ಇದ್ದರೆ)', 'ಸರಿಯಾದ ಅಂತರದಲ್ಲಿ ಬಿತ್ತನೆ'],
    irrigation: ['ಮೊದಲ ನೀರಾವರಿ', 'ತೇವಾಂಶ ಕಾಪಾಡಿ', 'ನಿಂತ ನೀರು/ಒಣಗಿಕೆ ಪರಿಶೀಲಿಸಿ'],
    fertilizer: ['ಆಧಾರ + ಮೇಲಿನ ಗೊಬ್ಬರ', 'ಕಳೆ ನಿಯಂತ್ರಣ', 'ಗೊಬ್ಬರ ನಂತರ ನೀರಾವರಿ'],
    pest: ['ವಾರಕ್ಕೊಮ್ಮೆ ಪರಿಶೀಲನೆ', 'ಕೀಟವನ್ನು ಬೇಗ ಗುರುತಿಸಿ', 'ಮಾರ್ಗದರ್ಶನಂತೆ ಸಿಂಪಡಣೆ'],
    flowering: ['ಪೋಷಕಾಂಶ ಶೋಷಣೆಗೆ ಬೆಂಬಲ', 'ದುರ್ಬಲ ಗಿಡಗಳು ತೆಗೆದು (ಅಗತ್ಯ ಇದ್ದರೆ)', 'ನೀರಿನ ಒತ್ತಡ ತಪ್ಪಿಸಿ'],
    harvest: ['ಪಕ್ವತೆ ಬಂದಾಗ ಕೊಯ್ಲು', 'ಸಂಗ್ರಹಿಸಿ ನೆರಳಲ್ಲಿ ಇಡಿ', 'ದಾಣ್ಯ ನಷ್ಟ ಕಡಿಮೆ ಮಾಡಿ'],
    post: ['ನೆರಳಲ್ಲಿ/ಸೂರ್ಯನಲ್ಲಿ ಒಣಗಿಸಿ', 'ವಿಂಗಡಿಸಿ ಸಂಗ್ರಹಿಸಿ', 'ಮಂಡಿ/ಮಾರುಕಟ್ಟೆಗೆ ಸಾಗಣೆ'],
  }[phaseKey];

  const tipsEn = {
    land: 'Avoid compact soil—better tilth helps germination.',
    sowing: 'Use recommended seed rate and keep field weed-free early.',
    irrigation: 'Early stress reduces yield later—plan irrigation carefully.',
    fertilizer: 'Split doses improve efficiency and reduce waste.',
    pest: 'Start with scouting; unnecessary sprays waste money.',
    flowering: 'Maintain steady moisture to protect flowering.',
    harvest: 'Harvest in dry weather for easier drying.',
    post: 'Good drying prevents mold and increases shelf life.',
  }[phaseKey];

  const tipsKn = {
    land: 'ಮಣ್ಣು ಗಟ್ಟಿಯಾಗದಂತೆ ನೋಡಿ—ಬೆಳೆಯ ಮೊಳಕೆ ಉತ್ತಮವಾಗುತ್ತದೆ.',
    sowing: 'ಶಿಫಾರಸಿನ ಬೀಜ ಪ್ರಮಾಣ ಬಳಸಿ ಮತ್ತು ಆರಂಭದಲ್ಲಿ ಕಳೆ ತೆಗೆದು.',
    irrigation: 'ಆರಂಭದ ಒತ್ತಡ ಇಳುವರಿ ಕಡಿಮೆ ಮಾಡುತ್ತದೆ—ಕಾಳಜಿಯಿಂದ ನೀರು ನೀಡಿ.',
    fertilizer: 'ಹಂತವಾಗಿ ಗೊಬ್ಬರ ನೀಡಿದರೆ ಪರಿಣಾಮಕಾರಿತ್ವ ಹೆಚ್ಚುತ್ತದೆ.',
    pest: 'ಮೊದಲು ಪರಿಶೀಲಿಸಿ; ಅಗತ್ಯವಿಲ್ಲದ ಸಿಂಪಡಣೆ ತಪ್ಪಿಸಿ.',
    flowering: 'ಹೂಬಿಡುವಿಕೆಗೆ ಸ್ಥಿರ ತೇವಾಂಶ ಮುಖ್ಯ.',
    harvest: 'ಒಣ ಹವಾಮಾನದಲ್ಲಿ ಕೊಯ್ಯಿರಿ—ಒಣಗಿಸುವಿಕೆ ಸುಲಭ.',
    post: 'ಒಳ್ಳೆಯ ಒಣಗಿಸುವಿಕೆ ಮೋಲ್ಡ್ ಕಡಿಮೆ ಮಾಡುತ್ತದೆ.',
  }[phaseKey];

  return {
    week,
    weekRange,
    phase: phaseObj.phase,
    title: phaseObj.title,
    description: t ? baseDescriptionKn : baseDescriptionEn,
    tasks: t ? tasksKn : tasksEn,
    workersNeeded: roleWorkers,
    inputsRequired: inputs,
    tips: t ? tipsKn : tipsEn,
    icon: phaseObj.icon,
    // Keep workerData UI happy (it uses weekRange/week only)
  };
}

function buildRoadmap(cropName, language) {
  const key = normalizeCropKey(cropName);
  const cropKey = key || 'ragi';
  const meta = CROP_META[cropKey];

  const cropLabelEn = meta.enName;
  const cropLabelKn = meta.knName;
  const lang = language === 'kn' ? 'kn' : 'en';

  const summaryEn = {
    ragi: 'Prepare land well and focus on early weeding. With correct moisture, ragi grows strong.',
    wheat: 'Use quality seed and timed irrigation. Split fertilization helps achieve steady growth.',
    corn: 'Maintain plant spacing and consistent watering. Timely fertilizer and pest control improves yield.',
    paddy: 'Rice needs stable water and careful nutrient management. Follow timely fertilizer and pest steps.',
    sugarcane: 'Provide deep tillage and strong planting material. Manage irrigation and pest across the season.',
    groundnut: 'Select good soil and ensure proper irrigation. Weed control early supports pod development.',
  }[cropKey];

  const summaryKn = {
    ragi: 'ಭೂಮಿಯನ್ನು ಚೆನ್ನಾಗಿ ಸಿದ್ಧಪಡಿಸಿ ಮತ್ತು ಆರಂಭದಲ್ಲೇ ಕಳೆ ನಿಯಂತ್ರಣಕ್ಕೆ ಗಮನ ಕೊಡಿ. ಸರಿಯಾದ ತೇವಾಂಶ ಇದ್ದರೆ ರಾಗಿ ಚೆನ್ನಾಗಿ ಬೆಳೆಯುತ್ತದೆ.',
    wheat: 'ಗುಣಮಟ್ಟದ ಬೀಜ ಬಳಸಿ ಮತ್ತು ಸಮಯಕ್ಕೆ ನೀರು ನೀಡಿ. ಹಂತವಾಗಿ ಗೊಬ್ಬರ ನೀಡಿದರೆ ಬೆಳವಣಿಗೆ ಸ್ಥಿರವಾಗಿರುತ್ತದೆ.',
    corn: 'ಸರಿಯಾದ ಅಂತರ ಮತ್ತು ನಿರಂತರ ನೀರು ಕಾಪಾಡಿ. ಸಮಯಕ್ಕೆ ಗೊಬ್ಬರ ಮತ್ತು ಕೀಟ ನಿಯಂತ್ರಣ ಇಳುವರಿಗೆ ಸಹಾಯ ಮಾಡುತ್ತದೆ.',
    paddy: 'ಅಕ್ಕಿಗೆ ಸ್ಥಿರ ನೀರು ಮತ್ತು ಪೋಷಕಾಂಶ ನಿರ್ವಹಣೆ ಮುಖ್ಯ. ಸಮಯಕ್ಕೆ ಗೊಬ್ಬರ ಹಾಗೂ ಕೀಟ ನಿಯಂತ್ರಣ ಮಾಡಿ.',
    sugarcane: 'ಆಳದ ಉಳುಮೆ ಮತ್ತು ಉತ್ತಮ ನೆಟ್ಟ ವಸ್ತುಗಳನ್ನು ಬಳಸಿ. ನೀರಾವರಿ ಮತ್ತು ಕೀಟ ನಿಯಂತ್ರಣ ಮಾಡಿ.',
    groundnut: 'ಒಳ್ಳೆಯ ಮಣ್ಣು ಆಯ್ಕೆ ಮಾಡಿ ಮತ್ತು ನೀರು ಸರಿಯಾಗಿ ನೀಡಿ. ಆರಂಭದಲ್ಲೇ ಕಳೆ ಕಡಿಮೆ ಮಾಡಿದರೆ ಬೀಜಕೋಶ ಚೆನ್ನಾಗಿ ಬೆಳೆಯುತ್ತದೆ.',
  }[cropKey];

  const checkpointsPhaseOrder = [
    { key: 'land' },
    { key: 'sowing' },
    { key: 'irrigation' },
    { key: 'fertilizer' },
    { key: 'pest' },
    { key: 'flowering' },
    { key: 'harvest' },
    { key: 'post' },
  ];

  const checkpoints = checkpointsPhaseOrder.map((p, idx) =>
    localizedCheckpoint(p.key, idx, lang, cropLabelEn, cropLabelKn)
  );

  return {
    cropName: cropLabelEn,
    totalDuration: meta.totalDuration[lang],
    bestSeason: meta.season[lang],
    estimatedCostPerAcre: meta.estimatedCostPerAcre,
    expectedYieldPerAcre: meta.expectedYieldPerAcre,
    summary: lang === 'kn' ? summaryKn : summaryEn,
    checkpoints,
  };
}

// ═══════════════════════════════════════════════════════════════════
//  POST /api/fasal-planner/generate-roadmap
//  Body: { cropName, soilType?, region?, language? }
//  Returns a preloaded crop roadmap (no external AI calls)
// ═══════════════════════════════════════════════════════════════════
router.post('/generate-roadmap', authMiddleware, async (req, res) => {
  try {
    const { cropName, language = 'en' } = req.body || {};

    if (!cropName) {
      return res.status(400).json({ message: 'cropName is required' });
    }

    const roadmap = buildRoadmap(cropName, language);
    return res.json({ roadmap });
  } catch (err) {
    console.error('Fasal Planner generate-roadmap error:', err);
    return res.status(500).json({ message: err.message || 'Internal server error' });
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
          key: 'locationPoint',
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
