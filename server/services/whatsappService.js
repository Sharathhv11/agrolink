const path = require('path');
const dotenv = require('dotenv');
const twilio = require('twilio');
const { stringsFor, resolveLang } = require('../utils/notificationStrings');

// Ensure .env is loaded when this module is required (e.g. workers, tests)
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

let twilioClient = null;


function getTwilioClient() {
  if (!twilioClient) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials not configured (set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env)');
    }
    twilioClient = twilio(accountSid, authToken);
  }
  return twilioClient;
}

/** Twilio WhatsApp Sandbox / API: whatsapp:+E164 */
function normalizeWhatsAppAddress(addr) {
  if (!addr || typeof addr !== 'string') return addr;
  const trimmed = addr.trim();
  if (/^whatsapp:/i.test(trimmed)) return trimmed;
  return `whatsapp:${trimmed}`;
}

function stringifyTwilioError(err) {
  if (!err) return 'Unknown error';
  const payload = {
    message: err.message,
    code: err.code,
    status: err.status,
    moreInfo: err.moreInfo,
    details: err.details,
  };
  try {
    return JSON.stringify(payload);
  } catch (_e) {
    return String(err.message || err);
  }
}

function formatTwilioError(err) {
  if (!err) return 'Unknown error';
  const code = err.code ?? err.status;
  if (code !== undefined && code !== null) {
    const parts = [err.message || 'Twilio API error'];
    parts.push(`code=${code}`);
    if (err.moreInfo) parts.push(String(err.moreInfo));
    if (err.details && Object.keys(err.details).length) {
      try {
        parts.push(`details=${JSON.stringify(err.details)}`);
      } catch (_e) {
        parts.push('details=(unserializable)');
      }
    }
    return parts.join(' | ');
  }
  return err.message || String(err);
}

function formatWageLine(job, language) {
  const t = stringsFor(language);
  const suffix = t.wageSuffix[job.wageType] || '';
  return `${t.currency} ${job.wageAmount}${suffix}`;
}

function formatLocationLine(job) {
  const loc = job?.location;
  if (!loc || typeof loc !== 'object') return null;
  const parts = [loc.addressLine, loc.village, loc.taluk, loc.district, loc.state].filter(
    (p) => typeof p === 'string' && p.trim()
  );
  return parts.length ? parts.join(', ') : null;
}

function formatStartDateLine(job, language) {
  if (!job?.startDate) return null;
  const d = new Date(job.startDate);
  if (Number.isNaN(d.getTime())) return null;
  const locale = resolveLang(language) === 'kn' ? 'kn-IN' : 'en-IN';
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatFacilitiesLine(job, language) {
  const f = job?.facilities;
  const t = stringsFor(language);
  if (!f || typeof f !== 'object') return null;
  const labels = [];
  if (f.food) labels.push(t.facility.food);
  if (f.shelter) labels.push(t.facility.shelter);
  if (f.transport) labels.push(t.facility.transport);
  if (f.medicalSupport) labels.push(t.facility.medicalSupport);
  return labels.length ? labels.join(', ') : null;
}

/** Apply link uses MongoDB job id (see /jobs/view/:jobId on client) */
function buildApplyUrl(job) {
  const base = process.env.PUBLIC_APP_URL || process.env.CLIENT_URL || 'http://localhost:5173';
  const id = job?._id != null ? String(job._id) : '';
  if (!id) {
    throw new Error('Job _id is required for apply link');
  }
  return `${String(base).replace(/\/$/, '')}/jobs/view/${id}`;
}

function buildMessageBody(job, language = 'en') {
  const t = stringsFor(language);
  const where = formatLocationLine(job) || t.nearby;
  const starts = formatStartDateLine(job, language) || t.seeLink;
  const facilities = formatFacilitiesLine(job, language);

  const lines = [
    t.alert,
    `${t.work}: ${job.title}`,
    `${t.wage}: ${formatWageLine(job, language)}`,
    `${t.location}: ${where}`,
    `${t.starts}: ${starts}`,
  ];

  if (facilities) {
    lines.push(`${t.facilities}: ${facilities}`);
  }

  lines.push(`${t.apply}: ${buildApplyUrl(job)}`);

  return lines.join('\n');
}

/**
 * Plain-text WhatsApp (same pattern as Twilio Sandbox: messages.create({ from, to, body })).
 * Credentials must come from .env — never hardcode Account SID / Auth Token.
 *
 * @param {string} phone - E.164, e.g. +919876543210
 * @param {object} job - Mongoose doc or plain object
 * @param {{ language?: 'en'|'kn' }} [options] - worker's stored language preference
 */
async function sendWhatsAppMessage(phone, job, options = {}) {
  const rawFrom = process.env.TWILIO_WHATSAPP_FROM;
  if (!rawFrom) {
    const err = new Error('TWILIO_WHATSAPP_FROM is not configured');
    console.error('[WhatsApp] FAILED! (config)');
    console.error('[WhatsApp] Error:', err.message);
    throw err;
  }

  const from = normalizeWhatsAppAddress(rawFrom);
  const to = normalizeWhatsAppAddress(phone);
  const lang = resolveLang(options.language);
  const body = buildMessageBody(job, lang);
  const client = getTwilioClient();

  try {
    console.log('[WhatsApp] Sending WhatsApp message...', `(lang=${lang})`);

    const message = await client.messages.create({
      from,
      to,
      body,
    });

    console.log('[WhatsApp] SUCCESS!');
    console.log('[WhatsApp] Message SID:', message.sid);
    console.log('[WhatsApp] from=', from, 'to=', to);

    return message;
  } catch (error) {
    console.error('[WhatsApp] FAILED!');
    console.error('[WhatsApp] Error:', error.message);

    if (error.code != null) {
      console.error('[WhatsApp] Code:', error.code);
      console.error('[WhatsApp] More info:', error.moreInfo);
    }

    console.error('[WhatsApp] Full debug (JSON):', stringifyTwilioError(error));

    const wrapped = new Error(formatTwilioError(error));
    wrapped.twilioCode = error.code;
    wrapped.twilioMoreInfo = error.moreInfo;
    wrapped.twilioRaw = stringifyTwilioError(error);
    wrapped.cause = error;
    throw wrapped;
  }
}

module.exports = {
  sendWhatsAppMessage,
  buildApplyUrl,
  formatWageLine,
  formatTwilioError,
  normalizeWhatsAppAddress,
  buildMessageBody,
};
