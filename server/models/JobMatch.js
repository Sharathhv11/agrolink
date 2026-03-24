const mongoose = require('mongoose');

const jobMatchSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    distanceKm: { type: Number, required: true, min: 0 },
    matchStatus: {
      type: String,
      enum: ['matched', 'notified', 'failed_notification'],
      default: 'matched',
      index: true,
    },
    radiusUsedKm: { type: Number, enum: [5, 10], required: true },
  },
  { timestamps: true }
);

jobMatchSchema.index({ jobId: 1, workerId: 1 }, { unique: true });
jobMatchSchema.index({ jobId: 1, distanceKm: 1 });

module.exports = mongoose.model('JobMatch', jobMatchSchema);
