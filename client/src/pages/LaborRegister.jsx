import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

/* ─── Karnataka location data ─── */
const KARNATAKA_DATA = {
  'Bagalkot': {
    'Badami': ['Badami', 'Guledgudda', 'Kerur'],
    'Bagalkot': ['Bagalkot', 'Navanagar', 'Vidyagiri'],
    'Bilgi': ['Bilgi', 'Kamatgi'],
    'Hungund': ['Hungund', 'Ilkal', 'Kushtagi'],
    'Jamkhandi': ['Jamkhandi', 'Terdal', 'Mudhol'],
    'Mudhol': ['Mudhol', 'Naldurg'],
  },
  'Bangalore Urban': {
    'Bangalore North': ['Yelahanka', 'Thanisandra', 'Jakkur'],
    'Bangalore South': ['Jayanagar', 'JP Nagar', 'Banashankari'],
    'Anekal': ['Anekal', 'Chandapura', 'Attibele'],
  },
  'Bangalore Rural': {
    'Devanahalli': ['Devanahalli', 'Vijayapura', 'Doddaballapura'],
    'Hosakote': ['Hosakote', 'Nandagudi'],
    'Nelamangala': ['Nelamangala', 'Solur'],
  },
  'Belagavi': {
    'Belagavi': ['Belagavi', 'Shahapur', 'Vadgaon'],
    'Athani': ['Athani', 'Kagwad'],
    'Bailhongal': ['Bailhongal', 'Kittur'],
    'Chikkodi': ['Chikkodi', 'Sadalga', 'Nipani'],
    'Gokak': ['Gokak', 'Mudalgi'],
    'Hukkeri': ['Hukkeri', 'Sankeshwar'],
    'Khanapur': ['Khanapur', 'Jamboti'],
    'Ramdurg': ['Ramdurg', 'Londa'],
    'Raybag': ['Raybag', 'Kudachi'],
    'Savadatti': ['Savadatti', 'Mundargi'],
  },
  'Bellary': {
    'Bellary': ['Bellary', 'Cowl Bazaar'],
    'Hadagalli': ['Hadagalli'],
    'Hospet': ['Hospet', 'Kamalapur'],
    'Sandur': ['Sandur', 'Toranagallu'],
    'Siruguppa': ['Siruguppa'],
  },
  'Bidar': {
    'Aurad': ['Aurad', 'Ladha'],
    'Basavakalyan': ['Basavakalyan', 'Rajeshwar'],
    'Bhalki': ['Bhalki', 'Hallikhed'],
    'Bidar': ['Bidar', 'Manhalli'],
    'Humnabad': ['Humnabad', 'Chitaguppa'],
  },
  'Chamarajanagar': {
    'Chamarajanagar': ['Chamarajanagar'],
    'Gundlupet': ['Gundlupet'],
    'Kollegal': ['Kollegal', 'Hanur'],
    'Yelandur': ['Yelandur'],
  },
  'Chikkaballapur': {
    'Bagepalli': ['Bagepalli'],
    'Chikkaballapur': ['Chikkaballapur'],
    'Chintamani': ['Chintamani'],
    'Gauribidanur': ['Gauribidanur'],
    'Gudibanda': ['Gudibanda'],
    'Sidlaghatta': ['Sidlaghatta'],
  },
  'Chikkamagaluru': {
    'Chikkamagaluru': ['Chikkamagaluru'],
    'Kadur': ['Kadur'],
    'Koppa': ['Koppa'],
    'Mudigere': ['Mudigere'],
    'Narasimharajapura': ['Narasimharajapura'],
    'Sringeri': ['Sringeri'],
    'Tarikere': ['Tarikere'],
  },
  'Chitradurga': {
    'Challakere': ['Challakere'],
    'Chitradurga': ['Chitradurga'],
    'Hiriyur': ['Hiriyur'],
    'Holalkere': ['Holalkere'],
    'Hosadurga': ['Hosadurga'],
    'Molakalmuru': ['Molakalmuru'],
  },
  'Dakshina Kannada': {
    'Bantwal': ['Bantwal', 'Vitla'],
    'Belthangady': ['Belthangady', 'Dharmasthala'],
    'Mangalore': ['Mangalore', 'Surathkal', 'Ullal'],
    'Puttur': ['Puttur', 'Sullia'],
    'Sullia': ['Sullia'],
  },
  'Davanagere': {
    'Channagiri': ['Channagiri'],
    'Davanagere': ['Davanagere'],
    'Harihara': ['Harihara'],
    'Honnali': ['Honnali'],
    'Jagalur': ['Jagalur'],
  },
  'Dharwad': {
    'Dharwad': ['Dharwad', 'Hubli'],
    'Hubli': ['Hubli', 'Keshwapur'],
    'Kalghatgi': ['Kalghatgi'],
    'Kundgol': ['Kundgol'],
    'Navalgund': ['Navalgund'],
  },
  'Gadag': {
    'Gadag': ['Gadag', 'Betgeri'],
    'Mundargi': ['Mundargi'],
    'Nargund': ['Nargund'],
    'Ron': ['Ron'],
    'Shirahatti': ['Shirahatti'],
  },
  'Hassan': {
    'Alur': ['Alur'],
    'Arkalgud': ['Arkalgud'],
    'Arsikere': ['Arsikere'],
    'Belur': ['Belur'],
    'Channarayapatna': ['Channarayapatna'],
    'Hassan': ['Hassan'],
    'Holenarasipura': ['Holenarasipura'],
    'Sakleshpur': ['Sakleshpur'],
  },
  'Haveri': {
    'Byadgi': ['Byadgi'],
    'Hanagal': ['Hanagal'],
    'Haveri': ['Haveri'],
    'Hirekerur': ['Hirekerur'],
    'Ranebennur': ['Ranebennur'],
    'Savanur': ['Savanur'],
    'Shiggaon': ['Shiggaon'],
  },
  'Kalaburagi': {
    'Afzalpur': ['Afzalpur'],
    'Aland': ['Aland'],
    'Chincholi': ['Chincholi'],
    'Chitapur': ['Chitapur'],
    'Kalaburagi': ['Kalaburagi'],
    'Jevargi': ['Jevargi'],
    'Sedam': ['Sedam'],
  },
  'Kodagu': {
    'Madikeri': ['Madikeri'],
    'Somwarpet': ['Somwarpet', 'Kushalnagar'],
    'Virajpet': ['Virajpet'],
  },
  'Kolar': {
    'Bangarapet': ['Bangarapet'],
    'Kolar': ['Kolar'],
    'KGF': ['KGF'],
    'Malur': ['Malur'],
    'Mulbagal': ['Mulbagal'],
    'Srinivaspur': ['Srinivaspur'],
  },
  'Koppal': {
    'Gangavathi': ['Gangavathi'],
    'Koppal': ['Koppal'],
    'Kushtagi': ['Kushtagi'],
    'Yelburga': ['Yelburga'],
  },
  'Mandya': {
    'K R Pet': ['K R Pet'],
    'Maddur': ['Maddur'],
    'Malavalli': ['Malavalli'],
    'Mandya': ['Mandya'],
    'Nagamangala': ['Nagamangala'],
    'Pandavapura': ['Pandavapura'],
    'Srirangapatna': ['Srirangapatna'],
  },
  'Mysuru': {
    'H D Kote': ['H D Kote'],
    'Hunsur': ['Hunsur'],
    'K R Nagar': ['K R Nagar'],
    'Mysuru': ['Mysuru'],
    'Nanjangud': ['Nanjangud'],
    'Periyapatna': ['Periyapatna'],
    'T Narasipura': ['T Narasipura'],
  },
  'Raichur': {
    'Devadurga': ['Devadurga'],
    'Lingasugur': ['Lingasugur'],
    'Manvi': ['Manvi'],
    'Raichur': ['Raichur'],
    'Sindhanur': ['Sindhanur'],
  },
  'Ramanagara': {
    'Channapatna': ['Channapatna'],
    'Kanakapura': ['Kanakapura'],
    'Magadi': ['Magadi'],
    'Ramanagara': ['Ramanagara'],
  },
  'Shimoga': {
    'Bhadravathi': ['Bhadravathi'],
    'Hosanagar': ['Hosanagar'],
    'Sagar': ['Sagar'],
    'Shimoga': ['Shimoga'],
    'Shikaripura': ['Shikaripura'],
    'Sorab': ['Sorab'],
    'Thirthahalli': ['Thirthahalli'],
  },
  'Tumkur': {
    'Gubbi': ['Gubbi'],
    'Kunigal': ['Kunigal'],
    'Madhugiri': ['Madhugiri'],
    'Pavagada': ['Pavagada'],
    'Sira': ['Sira'],
    'Tiptur': ['Tiptur'],
    'Tumkur': ['Tumkur'],
    'Turuvekere': ['Turuvekere'],
  },
  'Udupi': {
    'Karkala': ['Karkala'],
    'Kundapur': ['Kundapur', 'Byndoor'],
    'Udupi': ['Udupi', 'Manipal'],
  },
  'Uttara Kannada': {
    'Ankola': ['Ankola'],
    'Bhatkal': ['Bhatkal'],
    'Haliyal': ['Haliyal'],
    'Honavar': ['Honavar'],
    'Karwar': ['Karwar'],
    'Kumta': ['Kumta'],
    'Mundgod': ['Mundgod'],
    'Siddapur': ['Siddapur'],
    'Sirsi': ['Sirsi'],
    'Yellapur': ['Yellapur'],
  },
  'Vijayapura': {
    'Basavana Bagewadi': ['Basavana Bagewadi'],
    'Bijapur': ['Bijapur'],
    'Indi': ['Indi'],
    'Muddebihal': ['Muddebihal'],
    'Sindagi': ['Sindagi'],
  },
  'Yadgir': {
    'Shahapur': ['Shahapur'],
    'Shorapur': ['Shorapur'],
    'Yadgir': ['Yadgir'],
  },
};

const STATES = ['Karnataka'];

const LaborRegister = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    state: 'Karnataka',
    district: '',
    taluk: '',
  });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const districts = form.state === 'Karnataka' ? Object.keys(KARNATAKA_DATA) : [];
  const taluks = form.district && KARNATAKA_DATA[form.district]
    ? Object.keys(KARNATAKA_DATA[form.district])
    : [];

  const handleChange = (field, value) => {
    if (field === 'phone') {
      setPhoneError('');
    }
    if (field === 'district') {
      setForm(prev => ({ ...prev, district: value, taluk: '' }));
    } else {
      setForm(prev => ({ ...prev, [field]: value }));
    }
  };

  const validatePhone = (phone) => {
    const cleaned = phone.replace(/\s/g, '');
    return /^(\+91)?[6-9]\d{9}$/.test(cleaned);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!validatePhone(form.phone)) {
      setPhoneError('Enter a valid 10-digit Indian phone number');
      return;
    }

    setStatus('loading');

    try {
      const res = await fetch(`${API_URL}/laborers/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMsg(data.message || 'Registration failed. Try again.');
      }
    } catch (err) {
      setStatus('error');
      setErrorMsg('Network error. Please check your connection.');
    }
  };

  /* ─── SUCCESS SCREEN ─── */
  if (status === 'success') {
    return (
      <div style={styles.page}>
        <div style={styles.successContainer}>
          <div style={styles.successIcon}>✅</div>
          <h1 style={styles.successTitle}>Registration Successful!</h1>
          <p style={styles.successText}>
            You will receive job updates via SMS on your registered phone number.
          </p>
          <p style={styles.successSubtext}>ನೋಂದಣಿ ಯಶಸ್ವಿ! SMS ಮೂಲಕ ಕೆಲಸದ ವಿವರಗಳನ್ನು ಪಡೆಯುತ್ತೀರಿ.</p>
          <button style={styles.backBtn} onClick={() => navigate('/')}>
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  /* ─── REGISTRATION FORM ─── */
  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <button style={styles.headerBack} onClick={() => navigate('/')}>←</button>
        <div>
          <h1 style={styles.headerTitle}>Worker Registration</h1>
          <p style={styles.headerSub}>ಕಾರ್ಮಿಕ ನೋಂದಣಿ</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Name */}
        <div style={styles.field}>
          <label style={styles.label}>
            Full Name <span style={styles.labelKn}>ಹೆಸರು</span>
          </label>
          <input
            id="labor-name"
            type="text"
            required
            placeholder="Enter your full name"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            style={styles.input}
          />
        </div>

        {/* Phone */}
        <div style={styles.field}>
          <label style={styles.label}>
            Phone Number <span style={styles.labelKn}>ಫೋನ್ ಸಂಖ್ಯೆ</span>
          </label>
          <div style={styles.phoneRow}>
            <span style={styles.phonePrefix}>+91</span>
            <input
              id="labor-phone"
              type="tel"
              required
              placeholder="98765 43210"
              maxLength={10}
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, ''))}
              style={{ ...styles.input, ...styles.phoneInput }}
            />
          </div>
          {phoneError && <p style={styles.fieldError}>{phoneError}</p>}
        </div>

        {/* State (locked to Karnataka) */}
        <div style={styles.field}>
          <label style={styles.label}>
            State <span style={styles.labelKn}>ರಾಜ್ಯ</span>
          </label>
          <select
            id="labor-state"
            value={form.state}
            onChange={(e) => handleChange('state', e.target.value)}
            style={styles.select}
          >
            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* District */}
        <div style={styles.field}>
          <label style={styles.label}>
            District <span style={styles.labelKn}>ಜಿಲ್ಲೆ</span>
          </label>
          <select
            id="labor-district"
            required
            value={form.district}
            onChange={(e) => handleChange('district', e.target.value)}
            style={styles.select}
          >
            <option value="">-- Select District --</option>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Taluk */}
        <div style={styles.field}>
          <label style={styles.label}>
            Taluk <span style={styles.labelKn}>ತಾಲ್ಲೂಕು</span>
          </label>
          <select
            id="labor-taluk"
            required
            value={form.taluk}
            onChange={(e) => handleChange('taluk', e.target.value)}
            style={styles.select}
            disabled={!form.district}
          >
            <option value="">-- Select Taluk --</option>
            {taluks.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Error message */}
        {status === 'error' && (
          <div style={styles.errorBanner}>
            <span>⚠️</span> {errorMsg}
          </div>
        )}

        {/* Submit */}
        <button
          id="labor-submit"
          type="submit"
          disabled={status === 'loading'}
          style={{
            ...styles.submitBtn,
            ...(status === 'loading' ? styles.submitBtnDisabled : {}),
          }}
        >
          {status === 'loading' ? (
            <span style={styles.loadingText}>
              <span style={styles.spinner}></span> Registering...
            </span>
          ) : (
            'Register Now →'
          )}
        </button>

        <p style={styles.note}>
          📱 After registration, you will receive job alerts via SMS.
          <br />
          <span style={styles.noteKn}>ನೋಂದಣಿ ನಂತರ SMS ಮೂಲಕ ಕೆಲಸದ ಮಾಹಿತಿ ಬರುತ್ತದೆ.</span>
        </p>
      </form>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

/* ─── Inline styles (no framework needed) ─── */
const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0f9ff 100%)',
    fontFamily: "'Inter', 'Segoe UI', -apple-system, sans-serif",
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  header: {
    width: '100%',
    maxWidth: '480px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '20px 24px 12px',
    animation: 'fadeInUp 0.5s ease-out',
  },
  headerBack: {
    width: '44px',
    height: '44px',
    borderRadius: '14px',
    border: '1px solid rgba(0,0,0,0.08)',
    background: 'white',
    fontSize: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    transition: 'transform 0.2s',
  },
  headerTitle: {
    margin: 0,
    fontSize: '22px',
    fontWeight: 800,
    color: '#065f46',
    letterSpacing: '-0.02em',
  },
  headerSub: {
    margin: 0,
    fontSize: '13px',
    color: '#6b7280',
    fontWeight: 500,
  },
  form: {
    width: '100%',
    maxWidth: '480px',
    padding: '8px 24px 40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    animation: 'fadeInUp 0.6s ease-out 0.1s both',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#1f2937',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  labelKn: {
    fontSize: '12px',
    color: '#9ca3af',
    fontWeight: 500,
  },
  input: {
    width: '100%',
    height: '56px',
    padding: '0 18px',
    fontSize: '17px',
    fontWeight: 500,
    border: '2px solid #e5e7eb',
    borderRadius: '16px',
    background: 'white',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
    color: '#111827',
  },
  select: {
    width: '100%',
    height: '56px',
    padding: '0 18px',
    fontSize: '17px',
    fontWeight: 500,
    border: '2px solid #e5e7eb',
    borderRadius: '16px',
    background: 'white',
    outline: 'none',
    cursor: 'pointer',
    color: '#111827',
    WebkitAppearance: 'none',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%236b7280' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 16px center',
    backgroundSize: '20px',
    boxSizing: 'border-box',
  },
  phoneRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0',
  },
  phonePrefix: {
    height: '56px',
    padding: '0 14px',
    fontSize: '17px',
    fontWeight: 700,
    color: '#065f46',
    background: '#ecfdf5',
    border: '2px solid #e5e7eb',
    borderRight: 'none',
    borderRadius: '16px 0 0 16px',
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
  },
  phoneInput: {
    borderRadius: '0 16px 16px 0',
    flex: 1,
  },
  fieldError: {
    fontSize: '13px',
    color: '#dc2626',
    fontWeight: 600,
    margin: '2px 0 0 4px',
  },
  errorBanner: {
    padding: '14px 18px',
    background: '#fef2f2',
    borderRadius: '14px',
    border: '1px solid #fecaca',
    color: '#dc2626',
    fontSize: '14px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  submitBtn: {
    width: '100%',
    height: '60px',
    fontSize: '18px',
    fontWeight: 800,
    color: 'white',
    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    border: 'none',
    borderRadius: '18px',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(5, 150, 105, 0.35)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    marginTop: '8px',
    letterSpacing: '-0.01em',
  },
  submitBtnDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
  loadingText: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '3px solid rgba(255,255,255,0.3)',
    borderTop: '3px solid white',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.8s linear infinite',
  },
  note: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#6b7280',
    lineHeight: 1.6,
    fontWeight: 500,
  },
  noteKn: {
    color: '#9ca3af',
    fontSize: '12px',
  },

  /* Success screen */
  successContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px',
    textAlign: 'center',
    animation: 'fadeInUp 0.6s ease-out',
    maxWidth: '420px',
  },
  successIcon: {
    fontSize: '72px',
    marginBottom: '20px',
    animation: 'pulse 2s ease-in-out infinite',
  },
  successTitle: {
    fontSize: '28px',
    fontWeight: 800,
    color: '#065f46',
    marginBottom: '12px',
    letterSpacing: '-0.02em',
  },
  successText: {
    fontSize: '16px',
    color: '#374151',
    lineHeight: 1.6,
    fontWeight: 500,
    marginBottom: '8px',
  },
  successSubtext: {
    fontSize: '14px',
    color: '#9ca3af',
    marginBottom: '28px',
  },
  backBtn: {
    padding: '14px 28px',
    fontSize: '15px',
    fontWeight: 700,
    color: '#065f46',
    background: 'white',
    border: '2px solid #d1fae5',
    borderRadius: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
};

export default LaborRegister;
