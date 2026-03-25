/**
 * WhatsApp job alert copy per worker language (matches User.language: en | kn).
 * Job title/description stay as posted (farmer language); labels are localized.
 */

const COPY = {
  en: {
    alert: '🌾 AgroLink Job Alert',
    work: 'Work',
    wage: 'Wage',
    location: 'Location',
    starts: 'Starts',
    facilities: 'Facilities',
    apply: 'Apply',
    nearby: 'Nearby',
    seeLink: 'See link',
    currency: 'Rs',
    wageSuffix: {
      hourly: '/hour',
      daily: '/day',
      weekly: '/week',
      per_task: '/task',
    },
    facility: {
      food: 'Food',
      shelter: 'Shelter',
      transport: 'Transport',
      medicalSupport: 'Medical',
    },
  },
  kn: {
    alert: '🌾 ಅಗ್ರೋಲಿಂಕ್ ಕೆಲಸ ಸೂಚನೆ',
    work: 'ಕೆಲಸ',
    wage: 'ವೇತನ',
    location: 'ಸ್ಥಳ',
    starts: 'ಪ್ರಾರಂಭ',
    facilities: 'ಸೌಲಭ್ಯಗಳು',
    apply: 'ಅರ್ಜಿ ಸಲ್ಲಿಸಿ',
    nearby: 'ಹತ್ತಿರದಲ್ಲಿ',
    seeLink: 'ಲಿಂಕ್ ತೆರೆಯಿರಿ',
    currency: 'ರೂ',
    wageSuffix: {
      hourly: '/ಗಂಟೆ',
      daily: '/ದಿನ',
      weekly: '/ವಾರ',
      per_task: '/ಕೆಲಸ',
    },
    facility: {
      food: 'ಊಟ',
      shelter: 'ವಸತಿ',
      transport: 'ಸಾರಿಗೆ',
      medicalSupport: 'ವೈದ್ಯಕೀಯ',
    },
  },
};

function resolveLang(language) {
  return language === 'kn' ? 'kn' : 'en';
}

function stringsFor(language) {
  return COPY[resolveLang(language)];
}

module.exports = {
  COPY,
  resolveLang,
  stringsFor,
};
