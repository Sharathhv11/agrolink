import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, User, Phone, MapPin, Building2, Map, Loader2, Sparkles } from 'lucide-react';

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
      <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-6 selection:bg-blue-100 selection:text-blue-900 font-sans">
        <div className="max-w-md w-full bg-white rounded-[2rem] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 text-center animate-[fade-in-up_0.5s_ease-out]">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600 flex items-center justify-center mb-6 shadow-inner ring-[6px] ring-emerald-50">
             <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Registration Successful!</h1>
          <p className="text-slate-500 font-medium leading-relaxed mb-3">
             You will now receive automatic job updates directly via SMS.
          </p>
          <p className="text-sm font-semibold text-slate-400 mb-8 tracking-wide">
             ನೋಂದಣಿ ಯಶಸ್ವಿ! SMS ಮೂಲಕ ಕೆಲಸದ ವಿವರಗಳನ್ನು ಪಡೆಯುತ್ತೀರಿ.
          </p>
          <button 
            onClick={() => navigate('/')} 
            className="w-full py-4 rounded-2xl font-bold bg-slate-900 text-white hover:-translate-y-0.5 hover:shadow-lg transition-all active:scale-[0.98]"
          >
             Return Home
          </button>
        </div>
      </div>
    );
  }

  /* ─── REGISTRATION FORM ─── */
  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col pt-12 pb-16 px-5 sm:px-8">
      
      <div className="w-full max-w-xl mx-auto flex flex-col">
        {/* HEADER */}
        <button 
           onClick={() => navigate('/')} 
           className="self-start mb-8 p-3 bg-white border border-slate-200/80 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-50 hover:shadow-sm transition-all shadow-[0_4px_15px_rgb(0,0,0,0.02)] active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="mb-10 text-center animate-[fade-in-up_0.4s_ease-out]">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/50 border border-blue-100 text-sm font-bold text-blue-700 mb-5 shadow-sm">
             <Sparkles className="w-4 h-4 text-blue-600" /> Waitlist Open
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-3 leading-[1.1]">Join the Labor Network</h1>
           <p className="text-lg font-medium text-slate-500 tracking-tight">ಕಾರ್ಮಿಕ ನೋಂದಣಿ (ಸರಳ)</p>
        </div>

        {/* FORM CONTAINER */}
        <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-10 animate-[fade-in-up_0.6s_ease-out]">
          <div className="space-y-6">
            
            {/* FULL NAME */}
            <div>
              <label className="flex items-center gap-2 mb-2">
                <span className="font-bold text-[15px] text-slate-900 tracking-tight">Full Name</span>
                <span className="text-xs font-semibold text-slate-400">ಹೆಸರು</span>
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                   <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full bg-slate-50/50 border-2 border-slate-200 focus:bg-white focus:border-blue-500 rounded-2xl py-3.5 pl-12 pr-4 font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-inner focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>

            {/* PHONE */}
            <div>
              <label className="flex items-center gap-2 mb-2">
                <span className="font-bold text-[15px] text-slate-900 tracking-tight">Phone Number</span>
                <span className="text-xs font-semibold text-slate-400">ಫೋನ್ ಸಂಖ್ಯೆ</span>
              </label>
              <div className="flex rounded-2xl border-2 border-slate-200 bg-slate-50/50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 shadow-inner overflow-hidden transition-all">
                <div className="flex items-center justify-center bg-transparent pl-4 pr-3 border-r border-slate-200">
                   <Phone className="w-5 h-5 text-slate-400" />
                   <span className="ml-2 font-bold text-slate-500">+91</span>
                </div>
                <input
                  type="tel"
                  required
                  placeholder="98765 43210"
                  maxLength={10}
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, ''))}
                  className="w-full py-3.5 px-4 font-bold tracking-wide text-slate-900 placeholder:text-slate-400 outline-none bg-transparent"
                />
              </div>
              {phoneError && <p className="text-[13px] text-red-500 font-bold mt-2 ml-1 animate-[fade-in-up_0.2s]">{phoneError}</p>}
            </div>

            {/* STATE (LOCKED) */}
            <div>
              <label className="flex items-center gap-2 mb-2">
                <span className="font-bold text-[15px] text-slate-900 tracking-tight">State</span>
                <span className="text-xs font-semibold text-slate-400">ರಾಜ್ಯ</span>
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                   <Map className="w-5 h-5" />
                </div>
                <select
                  value={form.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  className="w-full bg-slate-50/50 hover:bg-slate-100/50 border-2 border-slate-200 focus:bg-white focus:border-blue-500 rounded-2xl py-3.5 pl-12 pr-10 font-semibold text-slate-900 outline-none transition-all shadow-inner appearance-none cursor-pointer"
                >
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>

            <div className="flex gap-4 flex-col sm:flex-row">
               {/* DISTRICT */}
               <div className="flex-1">
                 <label className="flex items-center gap-2 mb-2">
                   <span className="font-bold text-[15px] text-slate-900 tracking-tight">District</span>
                   <span className="text-xs font-semibold text-slate-400">ಜಿಲ್ಲೆ</span>
                 </label>
                 <div className="relative">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <Building2 className="w-5 h-5" />
                   </div>
                   <select
                     required
                     value={form.district}
                     onChange={(e) => handleChange('district', e.target.value)}
                     className="w-full bg-slate-50/50 hover:bg-slate-100/50 border-2 border-slate-200 focus:bg-white focus:border-blue-500 rounded-2xl py-3.5 pl-12 pr-10 font-semibold text-slate-900 outline-none transition-all shadow-inner appearance-none cursor-pointer"
                   >
                     <option value="">Select District</option>
                     {districts.map(d => <option key={d} value={d}>{d}</option>)}
                   </select>
                   <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                   </div>
                 </div>
               </div>

               {/* TALUK */}
               <div className="flex-1">
                 <label className="flex items-center gap-2 mb-2">
                   <span className="font-bold text-[15px] text-slate-900 tracking-tight">Taluk</span>
                   <span className="text-xs font-semibold text-slate-400">ತಾಲ್ಲೂಕು</span>
                 </label>
                 <div className="relative">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <MapPin className="w-5 h-5" />
                   </div>
                   <select
                     required
                     value={form.taluk}
                     onChange={(e) => handleChange('taluk', e.target.value)}
                     disabled={!form.district}
                     className="w-full bg-slate-50/50 hover:bg-slate-100/50 border-2 border-slate-200 focus:bg-white focus:border-blue-500 rounded-2xl py-3.5 pl-12 pr-10 font-semibold text-slate-900 outline-none transition-all shadow-inner appearance-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                   >
                     <option value="">Select Taluk</option>
                     {taluks.map(t => <option key={t} value={t}>{t}</option>)}
                   </select>
                   <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                   </div>
                 </div>
               </div>
            </div>

            {/* Error Message */}
            {status === 'error' && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 font-semibold text-sm flex items-center gap-2 animate-[fade-in-up_0.3s]">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                {errorMsg}
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <div className="pt-4">
               <button
                 type="submit"
                 disabled={status === 'loading'}
                 className="group relative flex items-center justify-center w-full py-4.5 h-[60px] bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 rounded-[1.25rem] shadow-[0_8px_30px_rgb(15,23,42,0.15)] hover:shadow-[0_15px_40px_rgb(15,23,42,0.25)] hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98]"
               >
                 {status === 'loading' ? (
                   <span className="flex items-center gap-2 text-white font-bold tracking-wide">
                     <Loader2 className="w-5 h-5 animate-spin" /> Registering...
                   </span>
                 ) : (
                   <span className="text-white font-semibold text-[16px] tracking-wide flex items-center gap-2">
                     Complete Registration <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                   </span>
                 )}
               </button>
            </div>

            <p className="text-center text-xs font-semibold text-slate-400 mt-2">
              📱 By registering, you agree to receive job alerts via SMS.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LaborRegister;
