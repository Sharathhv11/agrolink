const mongoose = require('mongoose');

const laborerBasicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    validate: {
      validator: function (v) {
        return /^(\+91)?[6-9]\d{9}$/.test(v.replace(/\s/g, ''));
      },
      message: 'Please enter a valid Indian phone number',
    },
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
  },
  district: {
    type: String,
    required: [true, 'District is required'],
    trim: true,
  },
  taluk: {
    type: String,
    required: [true, 'Taluk is required'],
    trim: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Index for fast SMS notification queries by location
laborerBasicSchema.index({ state: 1, district: 1, taluk: 1 });

module.exports = mongoose.model('LaborerBasic', laborerBasicSchema);
