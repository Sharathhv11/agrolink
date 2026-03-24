const JobMatch = require('../models/JobMatch');
const NotificationLog = require('../models/NotificationLog');
const { sendWhatsAppMessage, formatTwilioError } = require('./whatsappService');

function normalizeIndianPhone(phone) {
  if (!phone || typeof phone !== 'string') return null;
  const cleaned = phone.replace(/[\s-]/g, '');
  const indianPhoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
  if (!indianPhoneRegex.test(cleaned)) return null;
  if (cleaned.startsWith('+91')) return cleaned;
  if (cleaned.startsWith('91')) return `+${cleaned}`;
  return `+91${cleaned}`;
}

/**
 * Sends WhatsApp to each matched worker immediately (no queue).
 * One failure does not stop others.
 */
async function notifyMatchedWorkersDirectly(job, workers) {
  let sentCount = 0;
  let failedCount = 0;
  let skippedCount = 0;

  for (const worker of workers) {
    const phone = normalizeIndianPhone(worker.phone);
    if (!phone) {
      skippedCount += 1;
      console.log(`[WhatsApp] SKIP worker=${worker._id} reason=invalid_or_missing_phone job=${job._id}`);
      continue;
    }

    try {
      const message = await sendWhatsAppMessage(phone, job);
      sentCount += 1;
      console.log(`[WhatsApp] OK worker=${worker._id} phone=${phone} job=${job._id} sid=${message.sid}`);

      await JobMatch.updateOne(
        { jobId: job._id, workerId: worker._id },
        { $set: { matchStatus: 'notified' } }
      );

      await NotificationLog.findOneAndUpdate(
        { jobId: job._id, workerId: worker._id, channel: 'whatsapp' },
        {
          $set: {
            status: 'sent',
            attempts: 1,
            providerMessageId: message.sid,
            errorMessage: null,
          },
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      failedCount += 1;
      const detail =
        error.twilioRaw ||
        error.message ||
        formatTwilioError(error.cause || error);
      console.error(
        `[WhatsApp] FAIL worker=${worker._id} phone=${phone} job=${job._id}`,
        detail,
        error.twilioCode != null ? `twilioCode=${error.twilioCode}` : ''
      );

      await JobMatch.updateOne(
        { jobId: job._id, workerId: worker._id },
        { $set: { matchStatus: 'failed_notification' } }
      );

      await NotificationLog.findOneAndUpdate(
        { jobId: job._id, workerId: worker._id, channel: 'whatsapp' },
        {
          $set: {
            status: 'failed',
            attempts: 1,
            errorMessage: detail.slice(0, 500),
          },
        },
        { upsert: true, new: true }
      );
    }
  }

  console.log(
    `[WhatsApp] Job ${job._id} summary: sent=${sentCount} failed=${failedCount} skippedInvalidPhone=${skippedCount}`
  );

  return { sentCount, failedCount, skippedCount };
}

module.exports = {
  notifyMatchedWorkersDirectly,
};
