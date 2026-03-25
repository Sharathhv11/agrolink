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
  ArrowLeft
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
    <div className="min-h-screen bg-slate-50 p-4 pb-24 md:p-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 pl-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-4 flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-gray-600 shadow-sm ring-1 ring-gray-200 transition-all hover:bg-gray-50 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1 className="text-3xl tracking-tight md:text-4xl font-extrabold text-[#1A6B3C]">
            Post a New Job
          </h1>
          <p className="mt-2 text-base text-gray-500 font-medium">
            Fill in the details below to reach out to the right workers.
          </p>
        </div>

        <form onSubmit={submit} className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          
          {/* LEFT COLUMN */}
          <div className="space-y-6 lg:col-span-7">
            {/* Core Details Card */}
            <div className="overflow-hidden rounded-3xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-gray-100">
              <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-5">
                <h2 className="flex items-center gap-2.5 text-lg font-bold text-gray-800">
                  <Briefcase className="h-5 w-5 text-[#1A6B3C]" />
                  Job Information
                </h2>
              </div>
              <div className="p-6 space-y-5">
                
                {/* Title */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Job Title</label>
                  <input
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3.5 text-gray-800 transition-all outline-none focus:border-[#1A6B3C] focus:bg-white focus:ring-4 focus:ring-[#1A6B3C]/10"
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Need daily wage laborers for paddy harvest"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Description</label>
                  <textarea
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3.5 text-gray-800 transition-all outline-none focus:border-[#1A6B3C] focus:bg-white focus:ring-4 focus:ring-[#1A6B3C]/10"
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Provide clear and specific details about the work required..."
                  />
                </div>

                {/* Category Selection */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Job Category</label>
                  <select
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3.5 text-gray-800 transition-all outline-none focus:border-[#1A6B3C] focus:bg-white focus:ring-4 focus:ring-[#1A6B3C]/10"
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  >
                    {CATEGORY_GROUPS.map((group) => (
                      <optgroup key={group.label} label={group.label} className="font-semibold text-gray-900 border-b">
                        {group.options.map((option) => (
                          <option key={option.value} value={option.value} className="text-gray-700 font-normal">
                            {option.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Requirements & Compensation Card */}
            <div className="overflow-hidden rounded-3xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-gray-100">
              <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-5">
                <h2 className="flex items-center gap-2.5 text-lg font-bold text-gray-800">
                  <DollarSign className="h-5 w-5 text-[#1A6B3C]" />
                  Requirements & Compensation
                </h2>
              </div>
              <div className="p-6 space-y-6">
                
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                      <Users className="h-4 w-4 text-gray-400" />
                      Workers Required
                    </label>
                    <input
                      type="number"
                      min={1}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-800 transition-all outline-none focus:border-[#1A6B3C] focus:bg-white focus:ring-4 focus:ring-[#1A6B3C]/10"
                      value={form.workersRequired}
                      onChange={(e) => setForm((p) => ({ ...p, workersRequired: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                      <Clock className="h-4 w-4 text-gray-400" />
                      Duration
                    </label>
                    <div className="flex w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50/50 transition-all focus-within:border-[#1A6B3C] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#1A6B3C]/10">
                      <input
                        type="number"
                        min={1}
                        className="w-2/3 bg-transparent px-4 py-3 text-gray-800 outline-none"
                        value={form.durationValue}
                        onChange={(e) => setForm((p) => ({ ...p, durationValue: e.target.value }))}
                      />
                      <div className="w-[1px] bg-gray-200" />
                      <select
                        className="w-1/3 appearance-none bg-transparent px-3 py-3 text-center text-sm font-semibold text-gray-700 outline-none"
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
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      Start Date
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-800 transition-all outline-none focus:border-[#1A6B3C] focus:bg-white focus:ring-4 focus:ring-[#1A6B3C]/10"
                      value={form.startDate}
                      onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="mb-1.5 block text-sm font-semibold text-gray-700">Wage / Amount</label>
                      <input
                        type="number"
                        min={1}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-800 transition-all outline-none focus:border-[#1A6B3C] focus:bg-white focus:ring-4 focus:ring-[#1A6B3C]/10"
                        value={form.wageAmount}
                        onChange={(e) => setForm((p) => ({ ...p, wageAmount: e.target.value }))}
                        placeholder="₹"
                      />
                    </div>
                    <div className="w-1/2">
                      <label className="mb-1.5 block text-sm font-semibold text-gray-700">Wage Type</label>
                      <select
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-800 transition-all outline-none focus:border-[#1A6B3C] focus:bg-white focus:ring-4 focus:ring-[#1A6B3C]/10"
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
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6 lg:col-span-5">
            {/* Additional Facilities Card */}
            <div className="overflow-hidden rounded-3xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-gray-100">
              <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-5">
                <h2 className="flex items-center gap-2.5 text-lg font-bold text-gray-800">
                  <HeartPulse className="h-5 w-5 text-[#1A6B3C]" />
                  Provided Facilities
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-3">
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
                      className={`flex cursor-pointer select-none items-center gap-3 rounded-xl border p-3.5 transition-all ${
                        form.facilities[key]
                          ? 'border-[#1A6B3C] bg-green-50 shadow-sm'
                          : 'border-gray-200 hover:border-green-300 hover:bg-gray-50/50'
                      }`}
                    >
                      <div className="relative flex items-center justify-center">
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
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                            form.facilities[key]
                              ? 'border-[#1A6B3C] bg-[#1A6B3C]'
                              : 'border-gray-300'
                          }`}
                        >
                          {form.facilities[key] && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                        </div>
                      </div>
                      <span className={`text-sm font-medium ${form.facilities[key] ? 'text-green-800' : 'text-gray-700'}`}>
                         <Icon className="w-4 h-4 inline-block mr-1.5 opacity-60 mb-0.5" />
                         {label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Location Card */}
            <div className="overflow-hidden rounded-3xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-gray-100 flex flex-col">
              <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                <h2 className="flex items-center gap-2.5 text-lg font-bold text-gray-800">
                  <MapPin className="h-5 w-5 text-[#1A6B3C]" />
                  Job Location
                </h2>
                <button
                  type="button"
                  onClick={onAutoDetectLocation}
                  className="group flex flex-none items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#1A6B3C] shadow-sm ring-1 ring-gray-200 transition-all hover:bg-green-50 hover:ring-green-200"
                >
                  <Navigation className="h-3.5 w-3.5 group-hover:animate-pulse" />
                  Use GPS
                </button>
              </div>
              <div className="p-0">
                <div className="h-[220px] w-full bg-gray-100/50 relative">
                  <LocationPickerMap
                    value={form.location.coordinates}
                    onChange={(coords) =>
                      setForm((p) => ({ ...p, location: { ...p.location, coordinates: coords } }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 p-5">
                  {['village', 'taluk', 'district', 'state'].map((field) => (
                    <div key={field}>
                      <input
                        className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm text-gray-800 transition-all outline-none focus:border-[#1A6B3C] focus:bg-white focus:ring-2 focus:ring-[#1A6B3C]/10"
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

            {/* Contact Preference */}
            <div className="overflow-hidden rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-gray-100">
              <label className="mb-3 block text-sm font-semibold text-gray-700">
                How should workers contact you?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {CONTACT_OPTIONS.map((item) => {
                   const Icon = item.icon;
                   const isSelected = form.contactPreference === item.value;
                   return (
                    <button
                      type="button"
                      key={item.value}
                      onClick={() => setForm((p) => ({ ...p, contactPreference: item.value }))}
                      className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-3 text-sm font-medium transition-all ${
                        isSelected
                          ? 'border-[#1A6B3C] bg-green-50 text-[#1A6B3C] shadow-sm'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-[#1A6B3C]' : 'text-gray-400'}`} />
                      {item.label}
                    </button>
                )})}
              </div>
            </div>

            {/* Error Message */}
            {error ? (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700 ring-1 ring-red-200/50">
                <Info className="h-5 w-5 flex-shrink-0" />
                {error}
              </div>
            ) : null}

            {/* Submit Button */}
            <button
              disabled={!canSubmit || loading}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-[#1A6B3C] px-6 py-4 font-bold tracking-wide text-white transition-all hover:bg-[#124b29] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_20px_rgb(26,107,60,0.25)] hover:shadow-[0_12px_25px_rgb(26,107,60,0.35)] active:scale-[0.98]"
            >
              {loading ? (
                 <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    Posting...
                 </span>
              ) : (
                 <>
                    <Briefcase className="w-5 h-5" />
                    Post Job Now
                 </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
