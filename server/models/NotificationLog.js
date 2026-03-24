const mongoose = require('mongoose');

const notificationLogSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    channel: {
      type: String,
      enum: ['whatsapp'],
      default: 'whatsapp',
      index: true,
    },
    status: {
      type: String,
      enum: ['queued', 'sent', 'failed'],
      default: 'queued',
      index: true,
    },
    attempts: { type: Number, default: 0 },
    providerMessageId: { type: String, default: null },
    errorMessage: { type: String, default: null },
  },
  { timestamps: true }
);

notificationLogSchema.index({ jobId: 1, workerId: 1, channel: 1 }, { unique: true });

module.exports = mongoose.model('NotificationLog', notificationLogSchema);
