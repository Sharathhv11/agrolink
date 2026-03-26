const twilio = require("twilio");


const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

// 📲 Create client
const client = twilio(accountSid, authToken);

/**
 * Simple SMS sender (for demo)
 */
async function notifyLaborersByLocation(job) {
  try {
    console.log("🚀 Sending SMS...");

    // Format date specifically as requested e.g. "26 Mar, 6 AM"
    const stDate = job.startDate ? new Date(job.startDate) : new Date();
    const dateStr = stDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    
    // Fallback if no shortCode is available
    const sc = job.shortCode || "j123";

    const message = await client.messages.create({
      from: "+12603085905", // Twilio number
      to: "+919731482829",  // Your number
      body: `🌾 AgroLink Job Alert

Work: ${job.title} | ₹${job.wageAmount} | ${job.location?.district || "N/A"}
Date: ${dateStr}, 6 AM

Link: https://agrolink.in/j/${sc}

Reply:
${sc} 1 = Accept
${sc} 2 = Reject
${sc} 3 = Cancel`
    });

    console.log("✅ SMS SENT:", message.sid);

    return {
      success: true,
      sid: message.sid
    };

  } catch (error) {
    console.error("❌ SMS FAILED:", error.message);

    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  notifyLaborersByLocation
};