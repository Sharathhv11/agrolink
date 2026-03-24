const { getNotificationQueue } = require('../queues/notificationQueue');
const NotificationLog = require('../models/NotificationLog');

function buildJobShortUrl(job) {
  const base = process.env.PUBLIC_APP_URL || process.env.CLIENT_URL || 'http://localhost:5173';
  return `${base.replace(/\/$/, '')}/j/${job.shortCode}`;
}

function getWageLabel(job) {
  const suffixMap = {
    hourly: '/hour',
    daily: '/day',
    weekly: '/week',
    per_task: '/task',
  };
  return `Rs ${job.wageAmount}${suffixMap[job.wageType] || ''}`;
}

function normalizeIndianPhone(phone) {
  if (!phone || typeof phone !== 'string') return null;
  const cleaned = phone.replace(/[\s-]/g, '');
  const indianPhoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
  if (!indianPhoneRegex.test(cleaned)) return null;
  if (cleaned.startsWith('+91')) return cleaned;
  if (cleaned.startsWith('91')) return `+${cleaned}`;
  return `+91${cleaned}`;
}

async function queueNotificationsForMatchedWorkers(job, workers) {
  const queued = [];
  const shortUrl = buildJobShortUrl(job);

  const queue = getNotificationQueue();

  for (const worker of workers) {
    const normalizedPhone = normalizeIndianPhone(worker.phone);
    if (!normalizedPhone) {
      continue;
    }

    const existing = await NotificationLog.findOne({
      jobId: job._id,
      workerId: worker._id,
      channel: 'whatsapp',
    });

    if (existing) {
      continue;
    }

    await NotificationLog.create({
      jobId: job._id,
      workerId: worker._id,
      channel: 'whatsapp',
      status: 'queued',
      attempts: 0,
    });

    try {
      await queue.add('send-whatsapp', {
        jobId: String(job._id),
        workerId: String(worker._id),
        toPhone: normalizedPhone,
        title: job.title,
        wageLabel: getWageLabel(job),
        distanceKm: worker.distanceKm,
        shortUrl,
      });
    } catch (error) {
      await NotificationLog.updateOne(
        { jobId: job._id, workerId: worker._id, channel: 'whatsapp' },
        { $set: { status: 'failed', errorMessage: `Queue unavailable: ${error.message}` } }
      );
      continue;
    }

    queued.push(worker._id);
  }

  return { queuedCount: queued.length };
}

module.exports = {
  queueNotificationsForMatchedWorkers,
  buildJobShortUrl,
};
