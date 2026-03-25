const path = require('path');
const dotenv = require('dotenv');
const twilio = require('twilio');
const LaborerBasic = require('../models/LaborerBasic');
const { stringsFor } = require('../utils/notificationStrings');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

let twilioClient = null;

function getTwilioClient() {
  if (!twilioClient) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials not configured');
    }
    twilioClient = twilio(accountSid, authToken);
  }
  return twilioClient;
}

/**
 * Normalize phone to E.164 Indian format (+91XXXXXXXXXX)
 */
function normalizePhone(phone) {
  if (!phone || typeof phone !== 'string') return null;
  const cleaned = phone.replace(/[\s\-]/g, '');
  const regex = /^(\+91|91)?[6-9]\d{9}$/;
  if (!regex.test(cleaned)) return null;
  if (cleaned.startsWith('+91')) return cleaned;
  if (cleaned.startsWith('91')) return `+${cleaned}`;
  return `+91${cleaned}`;
}

/**
 * Build a bilingual WhatsApp message body for laborer notification
 */
function buildLaborerMessageBody(job) {
  const t = stringsFor('en');
  const tKn = stringsFor('kn');

  const wageSuffix = t.wageSuffix[job.wageType] || '';
  const wageSuffixKn = tKn.wageSuffix[job.wageType] || '';
  const locationParts = [job.location?.village, job.location?.taluk, job.location?.district].filter(Boolean);
  const where = locationParts.length ? locationParts.join(', ') : 'Nearby';

  const startDate = job.startDate
    ? new Date(job.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  const base = process.env.PUBLIC_APP_URL || process.env.CLIENT_URL || 'http://localhost:5173';
  const applyUrl = `${base.replace(/\/$/, '')}/jobs/view/${job._id}`;

  const lines = [
    `🌾 AgroLink Job Alert`,
    ``,
    `${t.work}: ${job.title}`,
    `${t.wage}: Rs ${job.wageAmount}${wageSuffix}`,
    `${t.location}: ${where}`,
  ];

  if (startDate) {
    lines.push(`${t.starts}: ${startDate}`);
  }

  lines.push(``);
  lines.push(`--- ಕನ್ನಡ ---`);
  lines.push(`${tKn.alert}`);
  lines.push(`${tKn.work}: ${job.title}`);
  lines.push(`${tKn.wage}: ರೂ ${job.wageAmount}${wageSuffixKn}`);
  lines.push(`${tKn.location}: ${where}`);

  lines.push(``);
  lines.push(`👉 ${t.apply}: ${applyUrl}`);

  return lines.join('\n');
}

/**
 * Find laborers in the same district and taluk as the job, then send
 * WhatsApp messages via Twilio (same approach as OTP / existing notifications).
 */
async function notifyLaborersByLocation(job) {
  const district = job.location?.district;
  const taluk = job.location?.taluk;

  if (!district) {
    console.log('[LaborerNotify] No district on job — skipping laborer notifications');
    return { sentCount: 0, failedCount: 0, matchedCount: 0 };
  }

  // Match by district; if taluk is available, narrow further
  const filter = { district };
  if (taluk) {
    filter.taluk = taluk;
  }

  let laborers;
  try {
    laborers = await LaborerBasic.find(filter).select('name phone');
  } catch (err) {
    console.error('[LaborerNotify] DB query failed:', err.message);
    return { sentCount: 0, failedCount: 0, matchedCount: 0 };
  }

  console.log(`[LaborerNotify] Job ${job._id} | district=${district} taluk=${taluk || 'any'} | matched ${laborers.length} laborers`);

  if (!laborers.length) {
    return { sentCount: 0, failedCount: 0, matchedCount: 0 };
  }

  // Use the SAME WhatsApp sender as the OTP / existing notification system
  const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM;
  const smsFrom = process.env.TWILIO_PHONE_NUMBER;

  if (!whatsappFrom && !smsFrom) {
    console.error('[LaborerNotify] Neither TWILIO_WHATSAPP_FROM nor TWILIO_PHONE_NUMBER configured');
    return { sentCount: 0, failedCount: 0, matchedCount: laborers.length };
  }

  const body = buildLaborerMessageBody(job);
  const client = getTwilioClient();

  let sentCount = 0;
  let failedCount = 0;

  for (const laborer of laborers) {
    const phone = normalizePhone(laborer.phone);
    if (!phone) {
      console.log(`[LaborerNotify] SKIP laborer=${laborer._id} reason=invalid_phone`);
      failedCount += 1;
      continue;
    }

    // Try WhatsApp first (works on Twilio trial), fallback to SMS
    let sent = false;

    // Attempt 1: WhatsApp (same as existing worker notifications)
   

    // Attempt 2: Plain SMS fallback
    if (!sent && smsFrom) {
      try {
        const msg = await client.messages.create({
          from: smsFrom,
          to: "+918660029884",
          body,
        });

        sentCount += 1;
        sent = true;
        console.log(`[LaborerNotify] SMS OK laborer=${laborer._id} phone=${phone} sid=${msg.sid}`);
      } catch (err) {
        console.warn(`[LaborerNotify] SMS FAIL laborer=${laborer._id} phone=${phone}: ${err.message}`);
      }
    }

    if (!sent) {
      failedCount += 1;
    }
  }

  console.log(`[LaborerNotify] Job ${job._id} summary: sent=${sentCount} failed=${failedCount} total=${laborers.length}`);
  return { sentCount, failedCount, matchedCount: laborers.length };
}

module.exports = {
  notifyLaborersByLocation,
  buildLaborerMessageBody,
};
