const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
      type: String,
      enum: ['applied', 'shortlisted', 'rejected', 'hired'],
      default: 'applied',
      index: true,
    },
  },
  { timestamps: true }
);

jobApplicationSchema.index({ jobId: 1, workerId: 1 }, { unique: true });

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
