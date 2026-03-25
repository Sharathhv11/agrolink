import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LocationPickerMap from '../components/LocationPickerMap';
import { createJob } from '../api/jobsApi';
import {
  Briefcase,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Clock,
  Home,
  Truck,
  HeartPulse,
  Info,
  CheckCircle2,
  Navigation,
  Phone,
  MessageCircle,
  Bell,
  Utensils,
  ArrowLeft,
  Sparkles,
  ChevronDown
} from 'lucide-react';

const CATEGORY_GROUPS = [
  {
    label: 'Core Farm Workers',
    options: [
      { value: 'farmer', label: 'Farmer' },
      { value: 'laborer', label: 'Laborer' },
      { value: 'machine_owner', label: 'Machine Owner' },
      { value: 'machine_operator', label: 'Machine Operator' },
      { value: 'pesticide_sprayer', label: 'Pesticide Sprayer' },
      { value: 'drone_operator', label: 'Drone Operator' },
      { value: 'irrigation_contractor', label: 'Irrigation Contractor' },
    ],
  },
  {
    label: 'Transport & Storage',
    options: [
      { value: 'transport_provider', label: 'Transport Provider' },
      { value: 'cold_storage_provider', label: 'Cold Storage' },
      { value: 'warehouse_owner', label: 'Warehouse Owner' },
      { value: 'packaging_supplier', label: 'Packaging Supplier' },
    ],
  },
  {
    label: 'Trade & Commerce',
    options: [
      { value: 'crop_buyer', label: 'Crop Buyer' },
      { value: 'mandi_agent', label: 'Mandi Agent' },
      { value: 'wholesaler', label: 'Wholesaler' },
      { value: 'exporter', label: 'Exporter' },
      { value: 'organic_certifier', label: 'Organic Certifier' },
    ],
  },
  {
    label: 'Inputs & Supplies',
    options: [
      { value: 'fertilizer_supplier', label: 'Fertilizer Supplier' },
      { value: 'seed_supplier', label: 'Seed Supplier' },
      { value: 'pesticide_supplier', label: 'Pesticide Supplier' },
      { value: 'equipment_rental', label: 'Equipment Rental' },
      { value: 'tool_supplier', label: 'Tool Supplier' },
    ],
  },
  {
    label: 'Advisory & Knowledge',
    options: [
      { value: 'agriculture_advisor', label: 'Agriculture Advisor' },
      { value: 'soil_testing_agent', label: 'Soil Testing' },
      { value: 'weather_consultant', label: 'Weather Consultant' },
      { value: 'govt_scheme_agent', label: 'Govt Scheme Agent' },
      { value: 'ngo_worker', label: 'NGO Worker' },
    ],
  },
  {
    label: 'Livestock & Allied',
    options: [
      { value: 'veterinarian', label: 'Veterinarian' },
      { value: 'dairy_collector', label: 'Dairy Collector' },
      { value: 'poultry_supplier', label: 'Poultry Supplier' },
      { value: 'fishery_worker', label: 'Fishery Worker' },
    ],
  },
  {
    label: 'Finance & Insurance',
    options: [
      { value: 'microfinance_agent', label: 'Microfinance' },
      { value: 'crop_insurance_agent', label: 'Crop Insurance' },
      { value: 'bank_representative', label: 'Bank Rep' },
    ],
  },
  {
    label: 'Labour Management',
    options: [
      { value: 'labor_contractor', label: 'Labor Contractor' },
      { value: 'labor_contractor_agent', label: 'Contractor Agent' },
    ],
  },
  {
    label: 'Technology & Services',
    options: [
      { value: 'soil_sensor_technician', label: 'Soil Sensor Tech' },
      { value: 'agri_drone_service', label: 'Agri Drone Service' },
      { value: 'precision_farming_consultant', label: 'Precision Farming' },
    ],
  },
];

const CONTACT_OPTIONS = [
  { value: 'call', label: 'Call', icon: Phone },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { value: 'in_app', label: 'In-app', icon: Bell },
];

export default function JobCreate() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const defaultCoords = user?.location?.coordinates;

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'laborer',
    workersRequired: 5,
    durationValue: 2,
    durationType: 'days',
    startDate: '',
    wageType: 'daily',
    wageAmount: '',
    contactPreference: 'call',
    facilities: { food: false, shelter: false, transport: false, medicalSupport: false },
    location: {
      village: user?.location?.village || '',
      taluk: user?.location?.taluk || '',
      district: user?.location?.district || '',
      state: user?.location?.state || '',
      addressLine: user?.location?.addressLine || '',
      coordinates: {
        lat: defaultCoords?.lat || 12.9716,
        lng: defaultCoords?.lng || 77.5946,
      },
    },
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(
    () => form.title.trim() && form.description.trim() && form.startDate && Number(form.wageAmount) > 0,
    [form]
  );

  const onAutoDetectLocation = () => {
    if (!navigator.geolocation) {
      setError('GPS is not supported on this device.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          location: {
            ...prev.location,
            coordinates: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
          },
        }));
      },
      () => setError('Unable to fetch GPS. Use map/manual location.')
    );
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        workersRequired: Number(form.workersRequired),
        durationValue: Number(form.durationValue),
        wageAmount: Number(form.wageAmount),
      };
      if (form.durationType === 'hours') {
        payload.facilities = { ...form.facilities, shelter: false };
      }
      const result = await createJob(payload, token);
      navigate(`/jobs/${result.jobId}/analytics`);
    } catch (err) {
      setError(err.message || 'Unable to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-4 pb-32 md:p-8 lg:px-12 selection:bg-slate-200 selection:text-slate-900 mx-auto w-full font-sans">
      <div className="mx-auto max-w-6xl">
        
        {/* PREMIUM HEADER SECTION */}
        <div className="mb-12 pt-4 pl-2 animate-[fade-in-up_0.3s_ease-out]">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2 text-[13px] font-bold tracking-tight text-slate-500 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all hover:bg-slate-50 hover:text-slate-900 mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-slate-900 flex items-center gap-4">
            Post a New Job <Sparkles className="w-8 h-8 text-indigo-500" />
          </h1>
          <p className="mt-3 text-lg font-medium tracking-tight text-slate-500 max-w-xl">
            Fill in the details below to reach out to the right workers. Make it precise.
          </p>
        </div>

        <form onSubmit={submit} className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* LEFT COLUMN - CORE DETAILS */}
          <div className="space-y-8 lg:col-span-7 animate-[fade-in-up_0.4s_ease-out_both] animation-delay-100">
            
            {/* Core Info Bento */}
            <div className="overflow-hidden rounded-[2rem] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 p-8">
              <div className="mb-8">
                <h2 className="flex items-center gap-3 text-xl font-black tracking-tight text-slate-900">
                  <div className="w-10 h-10 rounded-[1rem] bg-slate-100 border border-slate-200 flex items-center justify-center shadow-inner">
                    <Briefcase className="h-5 w-5 text-slate-700" strokeWidth={2.5}/>
                  </div>
                  Job Information
                </h2>
              </div>
              
              <div className="space-y-8">
                {/* Title */}
                <div>
                  <label className="mb-2.5 block text-[11px] font-black uppercase tracking-widest text-slate-400">Job Title</label>
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-slate-900 font-bold transition-all outline-none focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/10 placeholder:font-medium placeholder:text-slate-400"
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Need daily wage laborers for paddy harvest"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="mb-2.5 block text-[11px] font-black uppercase tracking-widest text-slate-400">Description</label>
                  <textarea
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-slate-900 font-bold transition-all outline-none focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/10 placeholder:font-medium placeholder:text-slate-400 resize-none min-h-[120px]"
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Provide clear and specific details about the work required..."
                  />
                </div>

                {/* Category Selection */}
                <div>
                  <label className="mb-2.5 block text-[11px] font-black uppercase tracking-widest text-slate-400">Job Category</label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-slate-900 font-bold transition-all outline-none focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/10"
                      value={form.category}
                      onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    >
                      {CATEGORY_GROUPS.map((group) => (
                        <optgroup key={group.label} label={group.label} className="font-extrabold text-slate-900 bg-white">
                          {group.options.map((option) => (
                            <option key={option.value} value={option.value} className="text-slate-700 font-medium">
                              {option.label}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-5 flex items-center">
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Logistics & Compensation Bento */}
            <div className="overflow-hidden rounded-[2rem] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 p-8">
              <div className="mb-8">
                <h2 className="flex items-center gap-3 text-xl font-black tracking-tight text-slate-900">
                  <div className="w-10 h-10 rounded-[1rem] bg-emerald-50 border border-emerald-100/50 flex items-center justify-center shadow-inner text-emerald-600">
                    <DollarSign className="h-5 w-5" strokeWidth={2.5} />
                  </div>
                  Logistics & Compensation
                </h2>
              </div>
              
              <div className="space-y-8">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Workers */}
                  <div>
                    <label className="mb-2.5 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
                      <Users className="h-3.5 w-3.5" />
                      Workers Required
                    </label>
                    <input
                      type="number"
                      min={1}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-slate-900 font-bold transition-all outline-none focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/10"
                      value={form.workersRequired}
                      onChange={(e) => setForm((p) => ({ ...p, workersRequired: e.target.value }))}
                    />
                  </div>
                  
                  {/* Duration */}
                  <div>
                    <label className="mb-2.5 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
                      <Clock className="h-3.5 w-3.5" />
                      Duration Limit
                    </label>
                    <div className="flex w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/50 transition-all focus-within:border-slate-900 focus-within:bg-white focus-within:ring-4 focus-within:ring-slate-900/10">
                      <input
                        type="number"
                        min={1}
                        className="w-1/2 bg-transparent px-5 py-4 text-slate-900 font-bold outline-none"
                        value={form.durationValue}
                        onChange={(e) => setForm((p) => ({ ...p, durationValue: e.target.value }))}
                      />
                      <div className="w-[1px] bg-slate-200 my-3" />
                      <div className="relative w-1/2">
                        <select
                          className="w-full h-full appearance-none bg-transparent px-5 py-4 text-sm font-bold text-slate-700 outline-none"
                          value={form.durationType}
                          onChange={(e) => {
                            const type = e.target.value;
                            setForm((p) => {
                              let newWageType = p.wageType;
                              if (type === 'hours' && (p.wageType === 'daily' || p.wageType === 'weekly')) {
                                newWageType = 'hourly';
                              } else if (type === 'days' && p.wageType === 'hourly') {
                                newWageType = 'daily';
                              }
                              return {
                                ...p,
                                durationType: type,
                                wageType: newWageType,
                                facilities: type === 'hours' ? { ...p.facilities, shelter: false } : p.facilities
                              };
                            });
                          }}
                        >
                          <option value="days">Days</option>
                          <option value="hours">Hours</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Start Date */}
                  <div>
                    <label className="mb-2.5 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
                      <Calendar className="h-3.5 w-3.5" />
                      Start Date
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-slate-900 font-bold transition-all outline-none focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/10"
                      value={form.startDate}
                      onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                    />
                  </div>
                  
                  {/* Wage Config */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="mb-2.5 block text-[11px] font-black uppercase tracking-widest text-slate-400">Total Wage</label>
                      <input
                        type="number"
                        min={1}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-slate-900 font-bold transition-all outline-none focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/10"
                        value={form.wageAmount}
                        onChange={(e) => setForm((p) => ({ ...p, wageAmount: e.target.value }))}
                        placeholder="₹ Amount"
                      />
                    </div>
                    <div className="w-[45%]">
                      <label className="mb-2.5 block text-[11px] font-black uppercase tracking-widest text-transparent select-none">.</label>
                      <div className="relative">
                        <select
                          className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-4 text-sm text-slate-700 font-bold transition-all outline-none focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/10"
                          value={form.wageType}
                          onChange={(e) => setForm((p) => ({ ...p, wageType: e.target.value }))}
                        >
                          {(form.durationType === 'hours'
                            ? [
                                { value: 'hourly', label: 'Hourly' },
                                { value: 'per_task', label: 'Per Task' },
                              ]
                            : [
                                { value: 'daily', label: 'Daily' },
                                { value: 'weekly', label: 'Weekly' },
                                { value: 'per_task', label: 'Per Task' },
                              ]
                          ).map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - FACILITIES & LOCATION */}
          <div className="space-y-8 lg:col-span-5 animate-[fade-in-up_0.5s_ease-out_both] animation-delay-200 flex flex-col">
            
            {/* Provided Facilities Bento */}
            <div className="overflow-hidden rounded-[2rem] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 p-8">
              <div className="mb-6">
                <h2 className="flex items-center gap-3 text-xl font-black tracking-tight text-slate-900">
                  <div className="w-10 h-10 rounded-[1rem] bg-rose-50 border border-rose-100/50 flex items-center justify-center shadow-inner text-rose-500">
                    <HeartPulse className="h-5 w-5" strokeWidth={2.5}/>
                  </div>
                  Facilities Provided
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'food', label: 'Food', icon: Utensils },
                  { key: 'shelter', label: 'Shelter', icon: Home, hideForHours: true },
                  { key: 'transport', label: 'Transport', icon: Truck },
                  { key: 'medicalSupport', label: 'Medical', icon: HeartPulse },
                ]
                .filter(item => !(item.hideForHours && form.durationType === 'hours'))
                .map(({ key, label, icon: Icon }) => (
                  <label
                    key={key}
                    className={`flex cursor-pointer select-none items-center justify-center gap-2 rounded-2xl border p-4 transition-all ${
                      form.facilities[key]
                        ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={Boolean(form.facilities[key])}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          facilities: { ...p.facilities, [key]: e.target.checked },
                        }))
                      }
                    />
                    <Icon className={`w-4 h-4 ${form.facilities[key] ? 'opacity-100' : 'opacity-60'}`} />
                    <span className="text-[13px] font-bold tracking-tight">
                        {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Location Bento */}
            <div className="overflow-hidden rounded-[2rem] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 flex flex-col flex-1">
              <div className="flex items-center justify-between p-8 pb-6 border-b border-slate-50">
                <h2 className="flex items-center gap-3 text-xl font-black tracking-tight text-slate-900">
                  <div className="w-10 h-10 rounded-[1rem] bg-indigo-50 border border-indigo-100/50 flex items-center justify-center shadow-inner text-indigo-500">
                    <MapPin className="h-5 w-5" strokeWidth={2.5} />
                  </div>
                  Job Location
                </h2>
                <button
                  type="button"
                  onClick={onAutoDetectLocation}
                  className="group flex flex-none items-center gap-2 rounded-xl bg-slate-50 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-slate-600 transition-all hover:bg-slate-100"
                >
                  <Navigation className="h-3.5 w-3.5 group-hover:animate-pulse" />
                  Use GPS
                </button>
              </div>
              
              <div className="p-0 flex flex-col flex-1">
                <div className="h-[200px] w-full bg-slate-100/50 relative border-b border-slate-50 overflow-hidden z-0">
                  <LocationPickerMap
                    value={form.location.coordinates}
                    onChange={(coords) =>
                      setForm((p) => ({ ...p, location: { ...p.location, coordinates: coords } }))
                    }
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 p-8">
                  {['village', 'taluk', 'district', 'state'].map((field) => (
                    <div key={field}>
                      <input
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm font-bold text-slate-900 transition-all outline-none focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/10 placeholder:text-slate-400 placeholder:font-medium"
                        placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                        value={form.location[field]}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            location: { ...p.location, [field]: e.target.value },
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Preference Bento */}
            <div className="overflow-hidden rounded-[2rem] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 p-8">
              <label className="mb-4 block text-[11px] font-black uppercase tracking-widest text-slate-400">
                Contact Method
              </label>
              <div className="grid grid-cols-3 gap-3">
                {CONTACT_OPTIONS.map((item) => {
                   const Icon = item.icon;
                   const isSelected = form.contactPreference === item.value;
                   return (
                    <button
                      type="button"
                      key={item.value}
                      onClick={() => setForm((p) => ({ ...p, contactPreference: item.value }))}
                      className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 text-[13px] font-bold tracking-tight transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-[0_2px_8px_rgba(79,70,229,0.15)] ring-1 ring-indigo-600/20'
                          : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-1 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} strokeWidth={2.5} />
                      {item.label}
                    </button>
                )})}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 rounded-[1.5rem] bg-rose-50 p-5 text-sm font-bold text-rose-600 border border-rose-100 shadow-sm animate-[fade-in-up_0.2s_ease-out]">
                <Info className="h-5 w-5 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Action Bar / Submit */}
            <div className="pt-2">
               <button
                 disabled={!canSubmit || loading}
                 className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-[1.5rem] bg-slate-900 px-8 py-5 font-black tracking-wide text-white transition-all hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.25)] active:scale-[0.98] text-lg"
               >
                 {loading ? (
                    <span className="flex items-center gap-3">
                       <span className="w-5 h-5 rounded-full border-[3px] border-white/20 border-t-white animate-spin" />
                       Creating Posting...
                    </span>
                 ) : (
                    <>
                       <Briefcase className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" strokeWidth={3} />
                       Publish Job Workspace
                    </>
                 )}
               </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
