const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    category: {
      type: String,
      required: true,
      index: true,
    },
    workersRequired: { type: Number, required: true, min: 1, max: 500 },
    durationValue: { type: Number, required: true, min: 1, max: 8760 },
    durationType: { type: String, required: true, enum: ['days', 'hours'], default: 'days' },
    startDate: { type: Date, required: true, index: true },
    wageType: {
      type: String,
      required: true,
      enum: ['hourly', 'daily', 'weekly', 'per_task'],
    },
    wageAmount: { type: Number, required: true, min: 1 },
    facilities: {
      food: { type: Boolean, default: false },
      shelter: { type: Boolean, default: false },
      transport: { type: Boolean, default: false },
      medicalSupport: { type: Boolean, default: false },
    },
    location: {
      village: { type: String, trim: true },
      taluk: { type: String, trim: true },
      district: { type: String, trim: true },
      state: { type: String, trim: true },
      addressLine: { type: String, trim: true },
    },
    locationPoint: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    contactPreference: {
      type: String,
      enum: ['call', 'whatsapp', 'in_app'],
      default: 'call',
    },
    shortCode: { type: String, required: true, unique: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
      type: String,
      enum: ['open', 'filled', 'closed'],
      default: 'open',
      index: true,
    },
  },
  { timestamps: true }
);

jobSchema.index({ locationPoint: '2dsphere' });
jobSchema.index({ createdBy: 1, createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);
