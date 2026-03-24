const mongoose = require('mongoose');

const jobViewEventSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    viewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, default: null },
    viewedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

jobViewEventSchema.index({ jobId: 1, viewedAt: 1 });

module.exports = mongoose.model('JobViewEvent', jobViewEventSchema);
