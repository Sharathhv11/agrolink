import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BadgeDollarSign,
  BookOpen,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  Cpu,
  FlaskConical,
  Globe,
  Phone,
  Search,
  Tractor,
  Truck,
  Users,
  X,
  Bird,
} from 'lucide-react';
import LocationPickerMap from '../components/LocationPickerMap.jsx';
import { TRANSLATIONS } from '../utils/translations.js';
import { useLanguage } from '../context/LanguageContext.jsx';

const CATEGORY_GROUPS = [
  {
    id: 'core',
    label: 'Core Farm Workers',
    icon: Tractor,
    gradient: 'from-emerald-500 to-green-600',
    glowColor: 'shadow-emerald-500/20',
    items: ['farmer', 'laborer', 'machine_owner', 'machine_operator', 'pesticide_sprayer', 'drone_operator', 'irrigation_contractor'],
  },
  {
    id: 'transport',
    label: 'Transport & Storage',
    icon: Truck,
    gradient: 'from-blue-500 to-cyan-600',
    glowColor: 'shadow-blue-500/20',
    items: ['transport_provider', 'cold_storage_provider', 'warehouse_owner', 'packaging_supplier'],
  },
  {
    id: 'trade',
    label: 'Trade & Commerce',
    icon: Briefcase,
    gradient: 'from-amber-500 to-orange-500',
    glowColor: 'shadow-amber-500/20',
    items: ['crop_buyer', 'mandi_agent', 'wholesaler', 'exporter', 'organic_certifier'],
  },
  {
    id: 'inputs',
    label: 'Inputs & Supplies',
    icon: FlaskConical,
    gradient: 'from-rose-500 to-pink-600',
    glowColor: 'shadow-rose-500/20',
    items: ['fertilizer_supplier', 'seed_supplier', 'pesticide_supplier', 'equipment_rental', 'tool_supplier'],
  },
  {
    id: 'advisory',
    label: 'Advisory & Knowledge',
    icon: BookOpen,
    gradient: 'from-indigo-500 to-violet-600',
    glowColor: 'shadow-indigo-500/20',
    items: ['agriculture_advisor', 'soil_testing_agent', 'weather_consultant', 'govt_scheme_agent', 'ngo_worker'],
  },
  {
    id: 'livestock',
    label: 'Livestock & Allied',
    icon: Bird,
    gradient: 'from-orange-500 to-red-500',
    glowColor: 'shadow-orange-500/20',
    items: ['veterinarian', 'dairy_collector', 'poultry_supplier', 'fishery_worker'],
  },
  {
    id: 'finance',
    label: 'Finance & Insurance',
    icon: BadgeDollarSign,
    gradient: 'from-teal-500 to-emerald-600',
    glowColor: 'shadow-teal-500/20',
    items: ['microfinance_agent', 'crop_insurance_agent', 'bank_representative'],
  },
  {
    id: 'labour',
    label: 'Labour Management',
    icon: Users,
    gradient: 'from-pink-500 to-fuchsia-600',
    glowColor: 'shadow-pink-500/20',
    items: ['labor_contractor', 'labor_contractor_agent'],
  },
  {
    id: 'tech',
    label: 'Technology & Services',
    icon: Cpu,
    gradient: 'from-cyan-500 to-blue-600',
    glowColor: 'shadow-cyan-500/20',
    items: ['soil_sensor_technician', 'agri_drone_service', 'precision_farming_consultant'],
  },
];

const titleCase = (s) => s.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

const getRoleLabel = (role, lang) => {
  return TRANSLATIONS[lang]?.roles[role] || titleCase(role);
};

export default function Onboarding() {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categoryQuery, setCategoryQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState(() => {
    const initial = {};
    CATEGORY_GROUPS.forEach((g, idx) => {
      initial[g.id] = idx < 2;
    });
    return initial;
  });

  const [locationFields, setLocationFields] = useState({
    village: '',
    taluk: '',
    district: '',
    state: '',
  });
  const [coordinates, setCoordinates] = useState(null); // { lat, lng }
  const [geoError, setGeoError] = useState('');

  // Separate phone and language fields
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const { language, setLanguage } = useLanguage();

  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rippleId, setRippleId] = useState(null);

  // OTP flow state
  const [otpStep, setOtpStep] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpSent, setOtpSent] = useState(false);

  const navigate = useNavigate();
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setGeoError(t.sections.location.fields.notSupported || 'Geolocation is not supported on this device/browser.');
    }
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

    return CATEGORY_GROUPS
      .map((g) => {
        const filteredItems = g.items.filter((item) => {
          const label = getRoleLabel(item, language).toLowerCase();
          return label.includes(q) || item.toLowerCase().includes(q);
        });
        return { ...g, filteredItems };
      })
      .filter((g) => g.filteredItems.length > 0);
  }, [categoryQuery, language]);

  // Validate Indian phone number: must start with 6-9 after optional +91, 10 digits total
  const validatePhone = (value) => {
    if (!value.trim()) {
      setPhoneError('');
      return true; // optional field
    }
    const cleaned = value.replace(/[\s-]/g, '');
    const indianPhoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
    if (!indianPhoneRegex.test(cleaned)) {
      setPhoneError(t.sections.preferences.phoneError);
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handlePhoneChange = (e) => {
    let val = e.target.value;
    // Only allow digits, +, spaces, and hyphens
    val = val.replace(/[^0-9+\s-]/g, '');
    setPhone(val);
    if (phoneError) validatePhone(val);
  };

  const canContinue = useMemo(
    () => selectedCategories.length > 0 && !!coordinates,
    [selectedCategories.length, coordinates]
  );

  const toggleCategory = (id) => {
    setRippleId(id);
    setTimeout(() => setRippleId(null), 400);
    setSelectedCategories((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  const requestCurrentLocation = () => {
    setGeoError('');
    setSubmitError('');

    if (!('geolocation' in navigator)) {
      setGeoError('Geolocation is not supported on this device/browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoordinates(next);
      },
      (err) => {
        setGeoError(err?.message || t.sections.location.geoError);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60_000 }
    );
  };

  const handleContinue = async () => {
    setSubmitError('');
    if (!canContinue) {
      if (!selectedCategories.length) setSubmitError(t.sections.roles.pickOne);
      else setSubmitError(t.sections.location.pickLocation);
      return;
    }

    // Validate phone if provided
    if (phone.trim() && !validatePhone(phone)) {
      setSubmitError(t.sections.preferences.phoneError);
      return;
    }

    if (phone.trim() && !otpStep) {
      await sendOtp();
      return;
    }

    if (otpStep) {
      await verifyOtp();
      return;
    }

    await submitOnboarding();
  };

  const sendOtp = async () => {
    setOtpSending(true);
    setSubmitError('');
    setOtpError('');
    try {
      const token = localStorage.getItem('agrolink_token') || localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      const response = await fetch('http://localhost:5000/api/otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone: phone.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setOtpStep(true);
        setOtpSent(true);
        setOtpCountdown(60);
      } else {
        setSubmitError(data.message || 'Failed to send OTP.');
      }
    } catch (error) {
      console.error('OTP send error:', error);
      setSubmitError('Network error, please try again.');
    } finally {
      setOtpSending(false);
    }
  };

  const verifyOtp = async () => {
    if (!otpValue || otpValue.length < 6) {
      setOtpError('Please enter the 6-digit OTP.');
      return;
    }

    setOtpVerifying(true);
    setOtpError('');
    try {
      const token = localStorage.getItem('agrolink_token') || localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      const response = await fetch('http://localhost:5000/api/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone: phone.trim(), otp: otpValue }),
      });

      const data = await response.json();

      if (response.ok) {
        await submitOnboarding();
      } else {
        setOtpError(data.message || 'Failed to verify OTP.');
      }
    } catch (error) {
      console.error('OTP verify error:', error);
      setOtpError('Network error, please try again.');
    } finally {
      setOtpVerifying(false);
    }
  };

  const submitOnboarding = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('agrolink_token') || localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      const response = await fetch('http://localhost:5000/api/users/onboard', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          categories: selectedCategories,
          location: { ...locationFields, coordinates },
          phone: phone.trim() || undefined,
          language,
        }),
      });

      if (response.ok) navigate('/home');
      else {
        const data = await response.json();
        setSubmitError(data.message || t.footer.errorUpdate || 'Error updating profile');
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      setSubmitError(t.footer.networkError || 'Network error, please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans pb-36 overflow-hidden">
      {/* ─── Hero Header ─── */}
      <div className="relative gradient-hero px-6 py-14 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="particle w-3 h-3 top-[18%] left-[12%] opacity-20" style={{ animationDelay: '0s' }}></div>
          <div className="particle w-2 h-2 top-[30%] right-[15%] opacity-15" style={{ animationDelay: '1.5s' }}></div>
          <div className="particle w-4 h-4 bottom-[22%] left-[20%] opacity-10" style={{ animationDelay: '3s' }}></div>
          <div className="particle w-2 h-2 top-[55%] right-[25%] opacity-20" style={{ animationDelay: '2s' }}></div>
          <div
            className="absolute w-48 h-48 rounded-full bg-white/5 blur-3xl top-[-20%] right-[-10%] animate-float"
            style={{ animationDuration: '8s' }}
          ></div>
        </div>

        <div className="relative z-10 mx-auto inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark text-white/90 text-xs font-semibold border border-white/10 opacity-0 animate-fade-in-up anim-delay-100">
          <span className="w-2 h-2 rounded-full bg-emerald-300/80"></span>
          {t.hero.badge}
        </div>

        <h1 className="relative z-10 mt-5 text-4xl sm:text-5xl font-black text-white tracking-tight mb-3 opacity-0 animate-fade-in-up anim-delay-200 drop-shadow-lg">
          {t.hero.title}
        </h1>
        <p className="relative z-10 text-lg text-white/70 max-w-2xl mx-auto opacity-0 animate-fade-in-up anim-delay-300">
          {t.hero.subtitle}
        </p>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-12">
            <path d="M0 80V30C360 70 720 0 1080 30C1260 50 1380 60 1440 30V80H0Z" fill="#FAFAF7" />
          </svg>
        </div>
      </div>

      {/* ─── Main Content with proper padding ─── */}
      <div className="max-w-7xl mx-auto w-full px-6 sm:px-8 lg:px-12 py-10">
        {!otpStep ? (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          {/* ─── Left: Category Selection ─── */}
          <div className="xl:col-span-2">
            <div className="glass-premium rounded-3xl p-6 sm:p-8 border border-white/40">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-left">
                  <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">{t.sections.roles.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">{t.sections.roles.subtitle}</p>
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-white/70 border border-gray-200 px-3.5 py-2.5 shadow-sm">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    value={categoryQuery}
                    onChange={(e) => setCategoryQuery(e.target.value)}
                    className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400"
                    placeholder={t.sections.roles.searchPlaceholder}
                  />
                  {categoryQuery ? (
                    <button
                      type="button"
                      onClick={() => setCategoryQuery('')}
                      className="p-1 rounded-lg hover:bg-gray-100 transition"
                      aria-label="Clear search"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredCategoryGroups.map((group) => {
                  const selectedInGroup = group.items.filter((i) => selectedCategories.includes(i)).length;
                  const isOpen = categoryQuery.trim() ? true : !!expandedGroups[group.id];
                  const GroupIcon = group.icon;

                  return (
                    <div key={group.id} className="premium-card overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setExpandedGroups((p) => ({ ...p, [group.id]: !p[group.id] }))}
                        disabled={!!categoryQuery.trim()}
                        className="w-full px-5 py-4 flex items-center justify-between gap-3 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-2xl bg-gradient-to-br ${group.gradient} shadow-lg ${group.glowColor}`}>
                            <GroupIcon className="w-5 h-5 text-white" strokeWidth={1.5} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-extrabold text-gray-900">{t.categories[group.id]}</h3>
                              {selectedInGroup ? (
                                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  {selectedInGroup}
                                </span>
                              ) : null}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {group.items.length} {group.items.length > 1 ? t.sections.roles.rolesSuffix : t.sections.roles.roleSuffix}
                            </p>
                          </div>
                        </div>
                        <ChevronDown
                          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''} ${
                            categoryQuery.trim() ? 'opacity-40' : ''
                          }`}
                        />
                      </button>

                      {isOpen ? (
                        <div className="px-5 pb-5">
                          <div className="flex flex-wrap gap-2">
                            {group.filteredItems.map((item) => {
                              const isSelected = selectedCategories.includes(item);
                              const isRippling = rippleId === item;
                              return (
                                <button
                                  key={item}
                                  type="button"
                                  onClick={() => toggleCategory(item)}
                                  className={`
                                    relative px-3.5 py-2 rounded-2xl text-sm font-semibold border overflow-hidden
                                    ${isSelected
                                      ? `text-white border-transparent shadow-md ${group.glowColor} bg-gradient-to-r ${group.gradient}`
                                      : 'bg-white/80 text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-white'}
                                  `}
                                >
                                  {isRippling ? (
                                    <span className="absolute inset-0 flex items-center justify-center">
                                      <span className="w-2 h-2 rounded-full bg-white/30 animate-ripple"></span>
                                    </span>
                                  ) : null}
                                  <span className="relative z-10 inline-flex items-center gap-1.5">
                                    {getRoleLabel(item, language)}
                                    {isSelected ? <CheckCircle2 className="w-4 h-4 text-white/90" /> : null}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ─── Right: Location, Phone, Language ─── */}
          <div className="xl:col-span-1">
            <div className="glass-premium rounded-3xl p-6 sm:p-8 border border-white/40 shadow-sm xl:sticky xl:top-6">
              {/* ── Map Section ── */}
              <div className="flex items-start justify-between gap-3 mb-5">
                <div className="text-left">
                  <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">{t.sections.location.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">{t.sections.location.subtitle}</p>
                </div>
                <button
                  type="button"
                  onClick={requestCurrentLocation}
                  className="px-4 py-2 rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 text-white font-semibold text-sm shadow-sm hover:shadow-md active:scale-[0.98] transition"
                >
                  {t.sections.location.useCurrent}
                </button>
              </div>

              {geoError ? (
                <div className="mb-4 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-amber-800 text-sm">
                  {geoError}
                </div>
              ) : null}

              <div className="rounded-3xl overflow-hidden border border-gray-200 shadow-sm">
                <LocationPickerMap
                  value={coordinates}
                  onChange={(next) => {
                    setSubmitError('');
                    setCoordinates(next);
                  }}
                />
              </div>

              <div className="mt-3 text-xs text-gray-500">
                {coordinates ? `${t.sections.location.selectedCoords}: ${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}` : t.sections.location.noSelection}
              </div>

              {/* ── Selected Roles Summary ── */}
              {selectedCategories.length ? (
                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">{t.sections.roles.selectedTitle}</span>
                    <span className="text-xs text-gray-500">{selectedCategories.length}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedCategories.slice(0, 10).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleCategory(c)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/80 border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-white hover:border-gray-300 transition"
                        title="Click to remove"
                      >
                        {getRoleLabel(c, language)}
                        <X className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                    ))}
                    {selectedCategories.length > 10 ? (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-600">
                        +{selectedCategories.length - 10} {t.sections.roles.more}
                      </span>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {/* ── Location Address Fields ── */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">{t.sections.location.fields.village}</span>
                  <input
                    value={locationFields.village}
                    onChange={(e) => setLocationFields((p) => ({ ...p, village: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white/70 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                    placeholder={t.sections.location.fields.villagePlaceholder}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">{t.sections.location.fields.taluk}</span>
                  <input
                    value={locationFields.taluk}
                    onChange={(e) => setLocationFields((p) => ({ ...p, taluk: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white/70 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                    placeholder={t.sections.location.fields.talukPlaceholder}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">{t.sections.location.fields.district}</span>
                  <input
                    value={locationFields.district}
                    onChange={(e) => setLocationFields((p) => ({ ...p, district: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white/70 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                    placeholder={t.sections.location.fields.districtPlaceholder}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">{t.sections.location.fields.state}</span>
                  <input
                    value={locationFields.state}
                    onChange={(e) => setLocationFields((p) => ({ ...p, state: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white/70 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                    placeholder={t.sections.location.fields.statePlaceholder}
                  />
                </label>
              </div>

              {/* ── Divider ── */}
              <div className="mt-7 mb-6 border-t border-gray-200/60"></div>

              {/* ── Phone Number (Indian only) ── */}
              <div>
                <label className="block">
                  <div className="flex items-center gap-2 mb-1">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-semibold text-gray-700">{t.sections.preferences.phoneTitle}</span>
                    <span className="text-xs text-gray-400">{t.sections.preferences.phoneOptional}</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500 select-none pointer-events-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={handlePhoneChange}
                      onBlur={() => validatePhone(phone)}
                      maxLength={15}
                      className={`w-full rounded-xl border bg-white/70 pl-12 pr-3.5 py-2.5 text-sm outline-none focus:ring-2 transition-colors ${
                        phoneError
                          ? 'border-red-300 focus:ring-red-200'
                          : 'border-gray-200 focus:ring-emerald-200'
                      }`}
                      placeholder="98765 43210"
                    />
                  </div>
                </label>
                {phoneError ? (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-red-400 inline-block"></span>
                    {phoneError}
                  </p>
                ) : (
                  <p className="mt-1.5 text-xs text-gray-400">{t.sections.preferences.phoneNote}</p>
                )}
              </div>

              {/* ── Language Selection ── */}
              <div className="mt-5">
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-semibold text-gray-700">{t.sections.preferences.languageTitle}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`relative px-4 py-3.5 rounded-2xl border-2 text-sm font-bold transition-all duration-200 ${
                      language === 'en'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-md shadow-emerald-500/10'
                        : 'border-gray-200 bg-white/70 text-gray-600 hover:border-gray-300 hover:bg-white'
                    }`}
                  >
                    <span className="text-lg block mb-0.5">🇬🇧</span>
                    {t.sections.preferences.english}
                    {language === 'en' ? (
                      <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-emerald-500" />
                    ) : null}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('kn')}
                    className={`relative px-4 py-3.5 rounded-2xl border-2 text-sm font-bold transition-all duration-200 ${
                      language === 'kn'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-md shadow-emerald-500/10'
                        : 'border-gray-200 bg-white/70 text-gray-600 hover:border-gray-300 hover:bg-white'
                    }`}
                  >
                    <span className="text-lg block mb-0.5">🇮🇳</span>
                    {t.sections.preferences.kannada}
                    {language === 'kn' ? (
                      <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-emerald-500" />
                    ) : null}
                  </button>
                </div>
              </div>

              {/* ── Error Message ── */}
              {submitError ? (
                <div className="mt-5 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
                  {submitError}
                </div>
              ) : null}
            </div>
          </div>
        </div>
        ) : (
          <div className="max-w-md mx-auto py-12 animate-fade-in-up">
            <div className="glass-premium rounded-3xl p-8 sm:p-12 border border-white/40 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <button
                type="button"
                onClick={() => {
                  setOtpStep(false);
                  setOtpError('');
                }}
                className="absolute top-6 left-6 inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-colors"
                title="Go Back"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mt-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 mb-6 shadow-sm border border-blue-100 rotate-12">
                  <Phone className="w-8 h-8 -rotate-12" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Verify Phone</h2>
                <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                  We sent a 6-digit code to <br/><span className="font-mono font-bold text-gray-900 text-lg">{phone}</span><br/> Valid for 10 minutes.
                </p>

                <div className="max-w-[16rem] mx-auto mb-8 relative">
                  <input
                    type="text"
                    maxLength={6}
                    value={otpValue}
                    onChange={(e) => {
                      setOtpValue(e.target.value.replace(/\D/g, ''));
                      setOtpError('');
                    }}
                    placeholder="------"
                    className={`w-full bg-white/70 border-2 rounded-2xl px-6 py-4 text-center text-3xl tracking-[0.3em] outline-none transition-all font-mono font-black shadow-sm ${otpError ? 'border-red-400 focus:border-red-500 text-red-600' : 'border-gray-200 focus:border-blue-500 text-gray-800'}`}
                  />
                  {otpError && (
                    <p className="absolute -bottom-6 left-0 right-0 text-xs font-bold text-red-500">{otpError}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={verifyOtp}
                  disabled={otpValue.length < 6 || otpVerifying || loading}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] text-white text-lg font-bold shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {otpVerifying || loading ? 'Verifying...' : 'Verify Code'}
                </button>

                <div className="mt-8">
                  <button
                    type="button"
                    onClick={sendOtp}
                    disabled={otpCountdown > 0 || otpSending}
                    className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    {otpCountdown > 0 ? `Resend code in ${otpCountdown}s` : 'Resend Code'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Sticky Footer Bar ─── */}
      {!otpStep && (
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <div className="glass border-t border-white/30 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] px-6 py-5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="hidden sm:block">
              {!selectedCategories.length ? (
                <p className="text-gray-400 font-medium">{t.footer.pickRole}</p>
              ) : !coordinates ? (
                <p className="text-gray-400 font-medium">{t.footer.selectLocation}</p>
              ) : (
                <p className="text-gray-800 font-bold text-lg flex items-center gap-2">
                  <span
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white text-sm font-black shadow-md animate-bounce-in"
                    key={selectedCategories.length}
                  >
                    {selectedCategories.length}
                  </span>
                  <span>{t.footer.ready}</span>
                </p>
              )}
            </div>
            <button
              onClick={handleContinue}
              disabled={!canContinue || loading || otpSending}
              className={`
                relative w-full sm:w-auto px-10 py-4 rounded-2xl font-bold text-lg overflow-hidden
                transition-all duration-300
                ${!canContinue || loading || otpSending
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-primary to-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 active:scale-95'}
              `}
            >
              <span className="relative z-10">
                {loading || otpSending ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      ></path>
                    </svg>
                    {t.footer.loading}
                  </span>
                ) : (
                  t.footer.submit
                )}
              </span>
            </button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
