import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BadgeDollarSign, BookOpen, Briefcase, CheckCircle2, ChevronDown, Cpu, FlaskConical, Globe, Phone, Search, Tractor, Truck, Users, X, Bird, ArrowRight, MapPin, Sparkles, Loader2, ShieldCheck, Navigation
} from 'lucide-react';
import LocationPickerMap from '../components/LocationPickerMap.jsx';
import { TRANSLATIONS } from '../utils/translations.js';
import { useLanguage } from '../context/LanguageContext.jsx';

const CATEGORY_GROUPS = [
  { id: 'core', label: 'Core Farm Workers', icon: Tractor, items: ['farmer', 'laborer', 'machine_owner', 'machine_operator', 'pesticide_sprayer', 'drone_operator', 'irrigation_contractor'] },
  { id: 'transport', label: 'Transport & Storage', icon: Truck, items: ['transport_provider', 'cold_storage_provider', 'warehouse_owner', 'packaging_supplier'] },
  { id: 'trade', label: 'Trade & Commerce', icon: Briefcase, items: ['crop_buyer', 'mandi_agent', 'wholesaler', 'exporter', 'organic_certifier'] },
  { id: 'inputs', label: 'Inputs & Supplies', icon: FlaskConical, items: ['fertilizer_supplier', 'seed_supplier', 'pesticide_supplier', 'equipment_rental', 'tool_supplier'] },
  { id: 'advisory', label: 'Advisory & Knowledge', icon: BookOpen, items: ['agriculture_advisor', 'soil_testing_agent', 'weather_consultant', 'govt_scheme_agent', 'ngo_worker'] },
  { id: 'livestock', label: 'Livestock & Allied', icon: Bird, items: ['veterinarian', 'dairy_collector', 'poultry_supplier', 'fishery_worker'] },
  { id: 'finance', label: 'Finance & Insurance', icon: BadgeDollarSign, items: ['microfinance_agent', 'crop_insurance_agent', 'bank_representative'] },
  { id: 'labour', label: 'Labour Management', icon: Users, items: ['labor_contractor', 'labor_contractor_agent'] },
  { id: 'tech', label: 'Technology & Services', icon: Cpu, items: ['soil_sensor_technician', 'agri_drone_service', 'precision_farming_consultant'] },
];

const titleCase = (s) => s.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
const getRoleLabel = (role, lang) => TRANSLATIONS[lang]?.roles[role] || titleCase(role);

export default function Onboarding() {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categoryQuery, setCategoryQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState(() => {
    const initial = {};
    CATEGORY_GROUPS.forEach((g, idx) => { initial[g.id] = idx < 2; });
    return initial;
  });

  const [locationFields, setLocationFields] = useState({ village: '', taluk: '', district: '', state: '' });
  const [coordinates, setCoordinates] = useState(null);
  const [geoError, setGeoError] = useState('');

  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const { language, setLanguage } = useLanguage();

  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP State
  const [otpStep, setOtpStep] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(0);

  const navigate = useNavigate();
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  useEffect(() => {
    if (!('geolocation' in navigator)) setGeoError(t.sections.location.fields.notSupported || 'Geolocation is not supported.');
  }, []);

  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  const filteredCategoryGroups = useMemo(() => {
    const q = categoryQuery.trim().toLowerCase();
    if (!q) return CATEGORY_GROUPS.map((g) => ({ ...g, filteredItems: g.items }));
    return CATEGORY_GROUPS.map((g) => {
      const filteredItems = g.items.filter((item) => getRoleLabel(item, language).toLowerCase().includes(q) || item.toLowerCase().includes(q));
      return { ...g, filteredItems };
    }).filter((g) => g.filteredItems.length > 0);
  }, [categoryQuery, language]);

  const validatePhone = (value) => {
    if (!value.trim()) { setPhoneError(''); return true; }
    const cleaned = value.replace(/[\s-]/g, '');
    if (!/^(\+91|91)?[6-9]\d{9}$/.test(cleaned)) {
      setPhoneError(t.sections.preferences.phoneError);
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/[^0-9+\s-]/g, '');
    setPhone(val);
    if (phoneError) validatePhone(val);
  };

  const canContinue = selectedCategories.length > 0 && !!coordinates;

  const toggleCategory = (id) => setSelectedCategories((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);

  const requestCurrentLocation = () => {
    setGeoError(''); setSubmitError('');
    if (!('geolocation' in navigator)) return setGeoError('Geolocation not supported.');
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoordinates({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => setGeoError(err?.message || t.sections.location.geoError),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  };

  const handleContinue = async () => {
    setSubmitError('');
    if (!canContinue) return setSubmitError(!selectedCategories.length ? t.sections.roles.pickOne : t.sections.location.pickLocation);
    if (phone.trim() && !validatePhone(phone)) return setSubmitError(t.sections.preferences.phoneError);
    if (phone.trim() && !otpStep) return await sendOtp();
    if (otpStep) return await verifyOtp();
    await submitOnboarding();
  };

  const sendOtp = async () => {
    setOtpSending(true); setSubmitError(''); setOtpError('');
    try {
      const token = localStorage.getItem('agrolink_token') || localStorage.getItem('token');
      if (!token) return navigate('/');
      const response = await fetch('http://localhost:5000/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      if (response.ok) { setOtpStep(true); setOtpCountdown(60); }
      else setSubmitError((await response.json()).message || 'Failed to send OTP.');
    } catch { setSubmitError('Network error, please try again.'); }
    finally { setOtpSending(false); }
  };

  const verifyOtp = async () => {
    if (!otpValue || otpValue.length < 6) return setOtpError('Please enter the 6-digit OTP.');
    setOtpVerifying(true); setOtpError('');
    try {
      const token = localStorage.getItem('agrolink_token') || localStorage.getItem('token');
      if (!token) return navigate('/');
      const response = await fetch('http://localhost:5000/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ phone: phone.trim(), otp: otpValue }),
      });
      if (response.ok) await submitOnboarding();
      else setOtpError((await response.json()).message || 'Failed to verify OTP.');
    } catch { setOtpError('Network error, please try again.'); }
    finally { setOtpVerifying(false); }
  };

  const submitOnboarding = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('agrolink_token') || localStorage.getItem('token');
      if (!token) return navigate('/');
      const response = await fetch('http://localhost:5000/api/users/onboard', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          categories: selectedCategories, location: { ...locationFields, coordinates },
          phone: phone.trim() || undefined, language,
        }),
      });
      if (response.ok) navigate('/home');
      else setSubmitError((await response.json()).message || t.footer.errorUpdate || 'Error updating profile');
    } catch { setSubmitError(t.footer.networkError || 'Network error, please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans selection:bg-blue-100 selection:text-blue-900 pb-32">
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-20 flex flex-col gap-10">
        
        {/* PREMIUM HEADER */}
        <div className="text-center max-w-2xl mx-auto animate-[fade-in-up_0.4s_ease-out]">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200/60 text-sm font-bold text-slate-700 mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-blue-600" /> Complete Setup
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-4 leading-tight">
            {t.hero.title}
          </h1>
          <p className="text-lg font-medium text-slate-500 tracking-tight">
            {t.hero.subtitle}
          </p>
        </div>

        {otpStep ? (
          /* PREMUIM OTP VERIFICATION */
          <div className="max-w-md mx-auto w-full animate-[fade-in-up_0.4s_ease-out]">
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden text-center">
              <button onClick={() => { setOtpStep(false); setOtpError(''); }} className="absolute top-6 left-6 p-2 rounded-full bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors">
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm ring-4 ring-blue-50/50">
                <ShieldCheck className="w-8 h-8" />
              </div>
              
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Verify Phone</h2>
              <p className="text-sm font-medium text-slate-500 mb-8">
                We sent a 6-digit code to <span className="font-bold text-slate-900">{phone}</span>
              </p>

              <input
                type="text"
                maxLength={6}
                value={otpValue}
                onChange={(e) => { setOtpValue(e.target.value.replace(/\D/g, '')); setOtpError(''); }}
                placeholder="------"
                className={`w-full bg-slate-50/50 border-2 rounded-2xl px-6 py-4 text-center text-3xl tracking-[0.3em] font-mono font-black outline-none transition-all shadow-inner focus:bg-white ${otpError ? 'border-red-300 focus:border-red-500 text-red-600' : 'border-slate-200 focus:border-blue-500 text-slate-900'}`}
              />
              {otpError && <p className="text-sm font-bold text-red-500 mt-3">{otpError}</p>}

              <button
                onClick={verifyOtp}
                disabled={otpValue.length < 6 || otpVerifying || loading}
                className="w-full mt-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {otpVerifying || loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</> : 'Verify & Setup Profile'}
              </button>

              <button onClick={sendOtp} disabled={otpCountdown > 0 || otpSending} className="mt-6 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                {otpCountdown > 0 ? `Resend code in ${otpCountdown}s` : 'Resend Code'}
              </button>
            </div>
          </div>
        ) : (
          /* BENTO GRID LAYOUT */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-[fade-in-up_0.6s_ease-out]">
            
            {/* LEFT COLUMN: ROLES */}
            <div className="lg:col-span-7 bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-fit">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t.sections.roles.title}</h2>
                  <p className="text-sm font-medium text-slate-500">{t.sections.roles.subtitle}</p>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-slate-50/80 border border-slate-200 px-3 py-2 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    value={categoryQuery}
                    onChange={(e) => setCategoryQuery(e.target.value)}
                    className="w-32 sm:w-48 bg-transparent outline-none text-sm font-semibold text-slate-900 placeholder:text-slate-400"
                    placeholder={t.sections.roles.searchPlaceholder}
                  />
                  {categoryQuery && <button onClick={() => setCategoryQuery('')}><X className="w-4 h-4 text-slate-400 hover:text-slate-900" /></button>}
                </div>
              </div>

              <div className="space-y-4">
                {filteredCategoryGroups.map((group) => {
                  const selectedInGroup = group.items.filter((i) => selectedCategories.includes(i)).length;
                  const isOpen = categoryQuery.trim() ? true : !!expandedGroups[group.id];
                  const GroupIcon = group.icon;

                  return (
                    <div key={group.id} className="border border-slate-100 rounded-2xl overflow-hidden bg-white hover:border-slate-200 transition-colors shadow-sm">
                      <button
                        type="button"
                        onClick={() => setExpandedGroups((p) => ({ ...p, [group.id]: !p[group.id] }))}
                        disabled={!!categoryQuery.trim()}
                        className="w-full px-5 py-4 flex items-center justify-between gap-3 text-left focus:outline-none"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700">
                            <GroupIcon className="w-5 h-5" strokeWidth={2} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">{t.categories[group.id]}</h3>
                              {selectedInGroup > 0 && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-white">{selectedInGroup}</span>}
                            </div>
                            <p className="text-xs font-semibold text-slate-400 mt-0.5">{group.items.length} Options</p>
                          </div>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isOpen && (
                        <div className="px-5 pb-5 pt-1">
                          <div className="flex flex-wrap gap-2">
                            {group.filteredItems.map((item) => {
                              const isSelected = selectedCategories.includes(item);
                              return (
                                <button
                                  key={item}
                                  type="button"
                                  onClick={() => toggleCategory(item)}
                                  className={`px-3 py-1.5 rounded-xl text-sm font-bold border transition-all active:scale-95 ${
                                    isSelected
                                      ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-900'
                                  }`}
                                >
                                  {getRoleLabel(item, language)}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT COLUMN: LOCATION & PREFERENCES */}
            <div className="lg:col-span-5 flex flex-col gap-8">
              
              {/* LOCATION BENTO */}
              <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col h-full">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">{t.sections.location.title}</h2>
                    <p className="text-sm font-medium text-slate-500 mt-1">{t.sections.location.subtitle}</p>
                  </div>
                  <button onClick={requestCurrentLocation} className="shrink-0 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors" title={t.sections.location.useCurrent}>
                    <Navigation className="w-5 h-5" />
                  </button>
                </div>

                {geoError && <div className="mb-4 text-xs font-bold text-red-500">{geoError}</div>}

                <div className="rounded-[1.5rem] overflow-hidden border border-slate-200/80 shadow-inner bg-slate-50 aspect-video mb-4 relative z-0">
                  <LocationPickerMap value={coordinates} onChange={(n) => { setSubmitError(''); setCoordinates(n); }} />
                </div>

                <div className="grid grid-cols-2 gap-3 mt-auto pt-2">
                  <input value={locationFields.village} onChange={(e) => setLocationFields(p => ({ ...p, village: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 outline-none transition-all" placeholder={t.sections.location.fields.villagePlaceholder} />
                  <input value={locationFields.taluk} onChange={(e) => setLocationFields(p => ({ ...p, taluk: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 outline-none transition-all" placeholder={t.sections.location.fields.talukPlaceholder} />
                  <input value={locationFields.district} onChange={(e) => setLocationFields(p => ({ ...p, district: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 outline-none transition-all" placeholder={t.sections.location.fields.districtPlaceholder} />
                  <input value={locationFields.state} onChange={(e) => setLocationFields(p => ({ ...p, state: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 outline-none transition-all" placeholder={t.sections.location.fields.statePlaceholder} />
                </div>
              </div>

              {/* PREFERENCES BENTO */}
              <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                {/* Phone */}
                <div className="mb-6">
                  <label className="flex items-center gap-2 mb-2 font-black text-[15px] text-slate-900 tracking-tight">
                     <Phone className="w-4 h-4 text-slate-400" /> WhatsApp / Phone
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 pointer-events-none">+91</span>
                    <input type="tel" value={phone} onChange={handlePhoneChange} onBlur={() => validatePhone(phone)} maxLength={15} placeholder="98765 43210" className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 outline-none transition-all" />
                  </div>
                  {phoneError ? <p className="text-xs font-bold text-red-500 mt-2">{phoneError}</p> : <p className="text-xs font-medium text-slate-400 mt-2">Optional. Needed for direct contact.</p>}
                </div>

                {/* Language */}
                <div>
                  <label className="flex items-center gap-2 mb-2 font-black text-[15px] text-slate-900 tracking-tight">
                     <Globe className="w-4 h-4 text-slate-400" /> Platform Language
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setLanguage('en')} className={`px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all ${language === 'en' ? 'border-slate-900 bg-slate-900 text-white shadow-md' : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-300'}`}>
                      English
                    </button>
                    <button onClick={() => setLanguage('kn')} className={`px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all ${language === 'kn' ? 'border-slate-900 bg-slate-900 text-white shadow-md' : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-300'}`}>
                      ಕನ್ನಡ
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* FLOAT CTA BAR */}
      {!otpStep && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-3rem)] max-w-2xl">
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-[2rem] p-2 flex items-center justify-between shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)]">
            <div className="hidden sm:flex items-center px-4 font-bold text-sm tracking-tight text-slate-500">
               {!selectedCategories.length ? 'Pick at least 1 role' : !coordinates ? 'Select location on map' : <span className="text-slate-900"><CheckCircle2 className="inline w-5 h-5 text-emerald-500 mr-2" /> All set</span>}
            </div>
            
            {submitError && <div className="px-4 text-xs font-bold text-red-500">{submitError}</div>}

            <button
               onClick={handleContinue}
               disabled={!canContinue || loading || otpSending}
               className={`ml-auto px-8 py-3.5 rounded-[1.5rem] font-bold text-[15px] tracking-wide transition-all ${
                 !canContinue || loading || otpSending
                   ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                   : 'bg-slate-900 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95'
               }`}
            >
              {loading || otpSending ? <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin"/> Loading</span> : 'Continue Setup'}
            </button>
          </div>
        </div>
      )}
      
    </div>
  );
}
