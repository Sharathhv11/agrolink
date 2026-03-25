const twilio = require("twilio");


// const accountSid = "";
// const authToken = "";

// 📲 Create client
const client = twilio(accountSid, authToken);

/**
 * Simple SMS sender (for demo)
 */
async function notifyLaborersByLocation(job) {
  try {
    console.log("🚀 Sending SMS...");

    const message = await client.messages.create({
      from: "+12603085905", // Twilio number
      to: "+919731482829",  // Your number
      body: `🌾 AgroLink Job Alert

Work: ${job.title}
Wage: ₹${job.wageAmount}
Location: ${job.location?.district || "N/A"}

Time: ${new Date().toLocaleString()}`
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