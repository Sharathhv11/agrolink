const { Worker } = require('bullmq');
const twilio = require('twilio');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const { getRedisConnection } = require('../config/redis');
const { notificationQueueName } = require('../queues/notificationQueue');
const NotificationLog = require('../models/NotificationLog');
const JobMatch = require('../models/JobMatch');

dotenv.config();

let twilioClient = null;
function getTwilioClient() {
  if (!twilioClient) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return twilioClient;
}

function formatWhatsAppBody(payload) {
  return [
    'AgroLink Job Alert',
    `Work: ${payload.title}`,
    `Distance: ${payload.distanceKm} km`,
    `Wage: ${payload.wageLabel}`,
    `Apply now: ${payload.shortUrl}`,
  ].join('\n');
}

async function boot() {
  await connectDB();

  const worker = new Worker(
    notificationQueueName,
    async (job) => {
      const payload = job.data;
      if (!payload?.toPhone) {
        throw new Error('Missing target phone');
      }

      const notification = await NotificationLog.findOne({
        jobId: new mongoose.Types.ObjectId(payload.jobId),
        workerId: new mongoose.Types.ObjectId(payload.workerId),
        channel: 'whatsapp',
      });

      if (!notification || notification.status === 'sent') {
        return;
      }

      const fromWhatsApp = process.env.TWILIO_WHATSAPP_FROM;
      if (!fromWhatsApp) {
        throw new Error('TWILIO_WHATSAPP_FROM missing');
      }

      try {
        const message = await getTwilioClient().messages.create({
          body: formatWhatsAppBody(payload),
          from: fromWhatsApp,
          to: `whatsapp:${payload.toPhone}`,
        });

        notification.status = 'sent';
        notification.providerMessageId = message.sid;
        notification.attempts += 1;
        notification.errorMessage = null;
        await notification.save();

        await JobMatch.updateOne(
          { jobId: payload.jobId, workerId: payload.workerId },
          { $set: { matchStatus: 'notified' } }
        );
      } catch (error) {
        notification.status = 'failed';
        notification.attempts += 1;
        notification.errorMessage = error.message;
        await notification.save();

        await JobMatch.updateOne(
          { jobId: payload.jobId, workerId: payload.workerId },
          { $set: { matchStatus: 'failed_notification' } }
        );

        throw error;
      }
    },
    {
      connection: getRedisConnection(),
      concurrency: 5,
      limiter: {
        max: 20,
        duration: 1000,
      },
    }
  );

  worker.on('failed', (job, err) => {
    console.error(`Notification job failed ${job?.id}:`, err.message);
  });

  console.log('Notification worker started');
}

boot().catch((error) => {
  console.error('Failed to start notification worker:', error);
  process.exit(1);
});
