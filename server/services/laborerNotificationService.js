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


    const message = await client.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER, // Twilio number
      to: "+919731482829",  // Your number
      body: `🌾 AgroLink Job Alert

ಹೊಸ ಕೆಲಸ ಲಭ್ಯವಿದೆ!

📍 ಸ್ಥಳ: ಹಾಸನ್ 
👷 ಕೆಲಸ: ಕೂಲಿ ಕೆಲಸ
💰 ವೇತನ: ₹1000 / ದಿನ

📞 ಸಂಪರ್ಕಿಸಿ: 9731482829`
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