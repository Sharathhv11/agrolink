import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiRequest } from '../api/apiClient';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Leaf,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  Package,
  Users,
  Info,
  Banknote,
  Search,
  Star
} from 'lucide-react';

const CROPS = [
  {
    id: 'ragi',
    name: { en: 'Ragi (Finger Millet)', kn: 'ರಾಗಿ' },
    emoji: '🌾',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50',
    border: 'border-amber-100',
    season: { en: 'Kharif', kn: 'ಖಾರಿಫ್' },
    duration: { en: '4-5 months', kn: '4-5 ತಿಂಗಳು' },
    desc: {
      en: 'Highly nutritious millet, drought-resistant, ideal for Karnataka.',
      kn: 'ಅತ್ಯಂತ ಪೌಷ್ಟಿಕ ರಾಗಿ, ಬರ ನಿರೋಧಕ, ಕರ್ನಾಟಕಕ್ಕೆ ಸೂಕ್ತ.',
    },
  },
  {
    id: 'wheat',
    name: { en: 'Wheat', kn: 'ಗೋಧಿ' },
    emoji: '🌿',
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
    border: 'border-emerald-100',
    season: { en: 'Rabi', kn: 'ರಬಿ' },
    duration: { en: '4-5 months', kn: '4-5 ತಿಂಗಳು' },
    desc: {
      en: 'Staple grain crop, best grown in cool season with irrigation.',
      kn: 'ಪ್ರಮುಖ ಧಾನ್ಯ ಬೆಳೆ, ತಂಪು ಋತುವಿನಲ್ಲಿ ಉತ್ತಮ.',
    },
  },
  {
    id: 'corn',
    name: { en: 'Corn (Maize)', kn: 'ಮೆಕ್ಕೆಜೋಳ' },
    emoji: '🌽',
    iconColor: 'text-yellow-600',
    iconBg: 'bg-yellow-50',
    border: 'border-yellow-100',
    season: { en: 'Kharif / Rabi', kn: 'ಖಾರಿಫ್ / ರಬಿ' },
    duration: { en: '3-4 months', kn: '3-4 ತಿಂಗಳು' },
    desc: {
      en: 'Versatile cereal crop with high demand for food & feed.',
      kn: 'ಆಹಾರ ಮತ್ತು ಪಶು ಆಹಾರಕ್ಕೆ ಹೆಚ್ಚು ಬೇಡಿಕೆ ಇರುವ ಬಹುಮುಖ ಧಾನ್ಯ.',
    },
  },
  {
    id: 'paddy',
    name: { en: 'Paddy (Rice)', kn: 'ಭತ್ತ' },
    emoji: '🍚',
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-50',
    border: 'border-indigo-100',
    season: { en: 'Kharif', kn: 'ಖಾರಿಫ್' },
    duration: { en: '4-6 months', kn: '4-6 ತಿಂಗಳು' },
    desc: {
      en: 'Major food grain, requires standing water, high yield.',
      kn: 'ಪ್ರಮುಖ ಆಹಾರ ಧಾನ್ಯ, ನಿಂತ ನೀರು ಅಗತ್ಯ, ಹೆಚ್ಚಿನ ಇಳುವರಿ.',
    },
  },
  {
    id: 'sugarcane',
    name: { en: 'Sugarcane', kn: 'ಕಬ್ಬು' },
    emoji: '🎋',
    iconColor: 'text-rose-600',
    iconBg: 'bg-rose-50',
    border: 'border-rose-100',
    season: { en: 'All Year', kn: 'ವರ್ಷಪೂರ್ತಿ' },
    duration: { en: '12-18 months', kn: '12-18 ತಿಂಗಳು' },
    desc: {
      en: 'Cash crop with high profit potential, needs rich soil.',
      kn: 'ಹೆಚ್ಚಿನ ಲಾಭದ ಸಾಮರ್ಥ್ಯ ಹೊಂದಿರುವ ವಾಣಿಜ್ಯ ಬೆಳೆ.',
    },
  },
  {
    id: 'groundnut',
    name: { en: 'Groundnut', kn: 'ಕಡಲೆಕಾಯಿ' },
    emoji: '🥜',
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-50',
    border: 'border-orange-100',
    season: { en: 'Kharif', kn: 'ಖಾರಿಫ್' },
    duration: { en: '3-5 months', kn: '3-5 ತಿಂಗಳು' },
    desc: {
      en: 'Oilseed crop, good for sandy & loamy soils.',
      kn: 'ಎಣ್ಣೆ ಬೀಜ ಬೆಳೆ, ಮರಳು ಮತ್ತು ಲೋಮ ಮಣ್ಣಿಗೆ ಸೂಕ್ತ.',
    },
  },
];

const TEXT = {
  en: {
    title: 'Fasal Planner',
    subtitle: 'AI-Powered Smart Roadmap',
    selectCrop: 'Select a crop below to generate an exact agricultural sequence tailored to your region.',
    planNow: 'Generate Plan',
    generating: 'Structuring AI Roadmap',
    roadmapTitle: 'Sequential Field Guide',
    back: 'Select Another Crop',
    totalDuration: 'Total Cycle',
    bestSeason: 'Optimal Season',
    costPerAcre: 'Est. Cost/Acre',
    yieldPerAcre: 'Est. Yield/Acre',
    tasksLabel: 'Core Tasks',
    workersLabel: 'Labour Requirements',
    inputsLabel: 'Logistics & Inputs',
    tipsLabel: 'Pro Insight',
    findWorkers: 'Source Local Workers',
    nearbyWorkers: 'Local Worker Matching',
    noWorkers: 'No workers matching these skills within 5km.',
    workerDistance: 'km',
    jobsDone: 'jobs tracked',
    ratePerDay: '/day',
    daysNeeded: 'days',
    item: 'Resource',
    qty: 'Volume',
    cost: 'Est. Target',
    loading: 'Sourcing...',
    errorRetry: 'Unable to establish secure connection. Retry.',
    retry: 'Reattempt',
  },
  kn: {
    title: 'ಫಸಲ್ ಯೋಜನಾಕಾರ',
    subtitle: 'AI-ಆಧಾರಿತ ಬೆಳೆ ಯೋಜನೆ',
    selectCrop: 'ಸಂಪೂರ್ಣ AI ಮಾರ್ಗಸೂಚಿ ಪಡೆಯಲು ನಿಮ್ಮ ಬೆಳೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    planNow: 'ಯೋಜನೆ ಮಾಡಿ',
    generating: 'AI ನಿಮ್ಮ ಮಾರ್ಗಸೂಚಿ ರಚಿಸುತ್ತಿದೆ...',
    roadmapTitle: 'ಬೆಳೆ ಮಾರ್ಗಸೂಚಿ',
    back: 'ಬೆಳೆಗಳಿಗೆ ಹಿಂತಿರುಗಿ',
    totalDuration: 'ಒಟ್ಟು ಅವಧಿ',
    bestSeason: 'ಉತ್ತಮ ಋತು',
    costPerAcre: 'ವೆಚ್ಚ / ಎಕರೆ',
    yieldPerAcre: 'ಇಳುವರಿ / ಎಕರೆ',
    tasksLabel: 'ಕಾರ್ಯಗಳು',
    workersLabel: 'ಬೇಕಾದ ಕಾರ್ಮಿಕರು',
    inputsLabel: 'ಅಗತ್ಯ ಸಾಮಗ್ರಿ',
    tipsLabel: 'ಸಲಹೆ',
    findWorkers: 'ಹತ್ತಿರದ ಕಾರ್ಮಿಕರನ್ನು ಹುಡುಕಿ',
    nearbyWorkers: 'ಹತ್ತಿರದ ಲಭ್ಯ ಕಾರ್ಮಿಕರು',
    noWorkers: '5km ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ಕಾರ್ಮಿಕರು ಕಂಡುಬಂದಿಲ್ಲ.',
    workerDistance: 'km ದೂರ',
    jobsDone: 'ಕೆಲಸ ಮುಗಿಸಿದ್ದಾರೆ',
    ratePerDay: '/ ದಿನ',
    daysNeeded: 'ದಿನಗಳು',
    item: 'ವಸ್ತು',
    qty: 'ಪ್ರಮಾಣ',
    cost: 'ಅಂದಾಜು ವೆಚ್ಚ',
    loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    errorRetry: 'ಏನೋ ತಪ್ಪಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    retry: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
  },
};

const LoadingDots = () => (
  <span className="inline-flex gap-1 ml-1">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"
        style={{ animationDelay: `${i * 0.15}s` }}
      />
    ))}
  </span>
);

export default function FasalPlanner() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { language } = useLanguage();
  const t = TEXT[language] || TEXT.en;
  const roadmapRef = useRef(null);

  const [view, setView] = useState('crops');
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [error, setError] = useState('');
  const [expandedCheckpoint, setExpandedCheckpoint] = useState(null);
  const [workerData, setWorkerData] = useState({});
  const [loadingWorkers, setLoadingWorkers] = useState({});
  const [animatedCards, setAnimatedCards] = useState([]);

  useEffect(() => {
    const timers = CROPS.map((_, i) =>
      setTimeout(() => {
        setAnimatedCards((prev) => [...prev, i]);
      }, i * 80)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const handlePlanCrop = async (crop) => {
    setSelectedCrop(crop);
    setView('loading');
    setError('');
    setRoadmap(null);
    setExpandedCheckpoint(null);
    setWorkerData({});

    try {
      const data = await apiRequest('/fasal-planner/generate-roadmap', {
        method: 'POST',
        token,
        timeoutMs: 60000,
        body: {
          cropName: crop.name.en,
          region: user?.location?.district || user?.location?.state || 'Karnataka',
          soilType: '',
          language,
        },
      });
      setRoadmap(data.roadmap);
      setView('roadmap');
      setTimeout(() => {
        roadmapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    } catch (err) {
      console.error(err);
      setError(err.message || t.errorRetry);
      setView('crops');
    }
  };

  const handleFindWorkers = async (checkpointIndex, categories) => {
    setLoadingWorkers((prev) => ({ ...prev, [checkpointIndex]: true }));
    try {
      const data = await apiRequest('/fasal-planner/nearby-workers', {
        method: 'POST',
        token,
        body: {
          categories,
          lat: user?.location?.coordinates?.lat,
          lng: user?.location?.coordinates?.lng,
          radiusKm: 5,
        },
      });
      setWorkerData((prev) => ({ ...prev, [checkpointIndex]: data.workers }));
    } catch (err) {
      console.error(err);
      setWorkerData((prev) => ({ ...prev, [checkpointIndex]: [] }));
    } finally {
      setLoadingWorkers((prev) => ({ ...prev, [checkpointIndex]: false }));
    }
  };

  const handleBack = () => {
    setView('crops');
    setSelectedCrop(null);
    setRoadmap(null);
    setError('');
    setExpandedCheckpoint(null);
    setWorkerData({});
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans selection:bg-slate-200 selection:text-slate-900 overflow-x-hidden">
      
      {/* Premium Minimalist Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100/50 h-16 px-4 md:px-8 flex justify-between items-center w-full">
        <div className="flex items-center gap-4 max-w-6xl mx-auto w-full">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-50 border border-slate-200/60 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-indigo-500" strokeWidth={2.5} />
            <h1 className="font-black text-slate-900 text-[15px] tracking-tight">{t.title}</h1>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/*  VIEW: CROP SELECTION CARDS                                     */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {view === 'crops' && (
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 lg:py-16">
          <div className="mb-14 max-w-2xl animate-[fade-in-up_0.3s_ease-out]">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-6 rounded-full bg-indigo-50 border border-indigo-100/80 text-[11px] font-black uppercase tracking-widest text-indigo-600 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Machine Learning Engine
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black tracking-tighter text-slate-900 leading-[1.05] mb-5">
              {t.subtitle}
            </h1>
            <p className="text-lg font-medium tracking-tight text-slate-500">
              {t.selectCrop}
            </p>
          </div>

          {error && (
            <div className="mb-8 flex items-center gap-3 rounded-[1.5rem] bg-rose-50 p-5 text-sm font-bold text-rose-600 border border-rose-100 shadow-sm animate-[fade-in-up_0.2s_ease-out]">
              <Info className="h-5 w-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CROPS.map((crop, index) => (
              <div
                key={crop.id}
                onClick={() => handlePlanCrop(crop)}
                className={`group relative bg-white rounded-[2rem] border border-slate-200/60 p-6 md:p-8 overflow-hidden
                  transition-all duration-500 cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1
                  ${animatedCards.includes(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
                `}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-16 h-16 ${crop.iconBg} rounded-[1.25rem] border ${crop.border} flex items-center justify-center text-3xl shadow-inner group-hover:scale-105 transition-transform duration-300`}>
                    {crop.emoji}
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] font-black uppercase tracking-widest text-slate-500">
                    {crop.season[language]}
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h3 className="font-black text-xl text-slate-900 mb-2.5 tracking-tight group-hover:text-indigo-600 transition-colors">
                    {crop.name[language]}
                  </h3>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed mb-6">
                    {crop.desc[language]}
                  </p>
                </div>

                {/* Footer details */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-100/80">
                  <div className="flex items-center gap-2 text-[12px] font-black uppercase tracking-widest text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    {crop.duration[language]}
                  </div>
                  <div className="flex items-center text-[13px] font-black tracking-tight text-indigo-600 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                    {t.planNow} <ArrowLeft className="w-4 h-4 ml-1 rotate-180" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/*  VIEW: LOADING STATE                                            */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {view === 'loading' && (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 animate-[fade-in-up_0.3s_ease-out]">
          <div className="relative mb-10 group">
            <div className="absolute inset-0 rounded-[2rem] bg-indigo-500/10 blur-xl animate-pulse" style={{ animationDuration: '2s' }} />
            <div className="relative w-24 h-24 bg-white border border-slate-200/60 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex items-center justify-center overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-tr from-slate-50 to-white" />
               <span className="text-4xl relative z-10 animate-bounce">{selectedCrop?.emoji || '🌱'}</span>
            </div>
          </div>
          <h3 className="text-2xl font-black tracking-tight text-slate-900 mb-3">{t.generating}</h3>
          <p className="text-slate-500 font-medium text-sm px-6 py-2 rounded-full bg-slate-50 border border-slate-100">
            {selectedCrop?.name[language]} Architecture
          </p>

          <div className="mt-12 w-full max-w-md space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-5 p-4 rounded-3xl bg-white border border-slate-100/50 shadow-sm opacity-50 animate-pulse" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex-shrink-0" />
                <div className="flex-1 space-y-2.5">
                  <div className="h-2.5 bg-slate-200 rounded-full w-2/3" />
                  <div className="h-2 bg-slate-100 rounded-full w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/*  VIEW: ROADMAP                                                  */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {view === 'roadmap' && roadmap && (
        <div ref={roadmapRef} className="max-w-4xl mx-auto px-4 md:px-6 py-10 pb-32 animate-[fade-in-up_0.4s_ease-out]">
          
          {/* Header Action */}
          <button
            onClick={handleBack}
            className="flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-[13px] font-bold tracking-tight text-slate-500 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.back}
          </button>

          {/* Epic Roadmap Hero Card */}
          <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 mb-12 shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col items-center text-center p-10 md:p-14">
            {/* Subtle mesh background effect inside dark card */}
             <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
             
            <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
              <div className="w-20 h-20 bg-white/10 rounded-[1.5rem] flex items-center justify-center text-4xl mb-6 shadow-inner backdrop-blur-md border border-white/10">
                {selectedCrop?.emoji}
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-4 line-clamp-2 leading-[1.1]">
                {roadmap.cropName || selectedCrop?.name[language]}
              </h2>
              <p className="text-slate-400 font-medium text-lg leading-relaxed mb-10">
                {roadmap.summary}
              </p>

              {/* Data Pills Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
                {[
                  { label: t.totalDuration, value: roadmap.totalDuration, icon: Clock },
                  { label: t.bestSeason, value: roadmap.bestSeason, icon: Calendar },
                  { label: t.costPerAcre, value: roadmap.estimatedCostPerAcre, icon: Banknote },
                  { label: t.yieldPerAcre, value: roadmap.expectedYieldPerAcre, icon: Package },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center text-center backdrop-blur-sm transition-colors hover:bg-white/10">
                      <Icon className="w-5 h-5 text-slate-300 mb-2" strokeWidth={2.5}/>
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
                      <p className="text-white font-bold tracking-tight text-sm">{stat.value || '-'}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mb-10 flex items-center justify-between">
             <h3 className="text-2xl font-black tracking-tighter text-slate-900">
               {t.roadmapTitle}
             </h3>
             <div className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[11px] font-black uppercase tracking-widest">
                {roadmap.checkpoints?.length} Phases
             </div>
          </div>

          {/* Structured Timeline Sequence */}
          <div className="relative">
            {/* The crisp gray spine line tracking down */}
            <div className="absolute left-[29px] top-6 bottom-8 w-[2px] bg-slate-100 rounded-full" />

            <div className="space-y-6">
              {(roadmap.checkpoints || []).map((cp, idx) => {
                const isExpanded = expandedCheckpoint === idx;
                const workers = workerData[idx];
                const isLoadingW = loadingWorkers[idx];

                return (
                  <div key={idx} className="relative group pl-[70px]">
                    {/* Minimalist marker node */}
                    <div
                      className={`absolute left-5 w-6 h-6 rounded-full border-[3px] transition-all duration-300 flex items-center justify-center top-6 z-10
                        ${isExpanded
                          ? 'bg-indigo-600 border-white ring-4 ring-indigo-50 shadow-sm scale-110'
                          : 'bg-white border-slate-200 group-hover:border-slate-400 group-hover:scale-105'
                        }`}
                    />

                    {/* Bento Checkpoint Block */}
                    <div
                      className={`bg-white rounded-[2rem] border transition-all duration-300 overflow-hidden cursor-pointer
                        ${isExpanded
                          ? 'border-indigo-100 shadow-[0_10px_40px_rgba(79,70,229,0.06)]'
                          : 'border-slate-200/60 shadow-sm hover:border-slate-300 hover:shadow-md'
                        }`}
                      onClick={() => setExpandedCheckpoint(isExpanded ? null : idx)}
                    >
                      {/* Block Header */}
                      <div className="p-6 md:p-8">
                        <div className="flex items-start justify-between gap-4">
                           <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-2.5">
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${isExpanded ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-500'}`}>
                                  {cp.weekRange || `Week ${cp.week}`}
                                </span>
                                <span className="px-2.5 py-1 bg-slate-50 border border-slate-100/50 text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                  {cp.phase}
                                </span>
                              </div>
                              <h4 className="font-black text-[18px] tracking-tight text-slate-900 leading-snug">{cp.title}</h4>
                              <p className={`text-sm mt-2 font-medium transition-all ${isExpanded ? 'text-slate-600' : 'text-slate-500 line-clamp-2'}`}>{cp.description}</p>
                           </div>
                           <div className={`flex w-9 h-9 items-center justify-center rounded-full border transition-all ${isExpanded ? 'bg-slate-50 border-slate-200' : 'bg-transparent border-slate-100 group-hover:bg-slate-50'}`}>
                             <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                           </div>
                        </div>
                      </div>

                      {/* Expanded Sub-pane Data */}
                      {isExpanded && (
                        <div className="border-t border-slate-100 bg-slate-50/30 animate-[fade-in-up_0.3s_ease-out]">
                          
                          {/* Core Tasks Subgrid */}
                          {cp.tasks && cp.tasks.length > 0 && (
                            <div className="p-6 md:p-8 border-b border-slate-100/80">
                              <h5 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-slate-300" />
                                {t.tasksLabel}
                              </h5>
                              <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-4">
                                {cp.tasks.map((task, tIdx) => (
                                  <li key={tIdx} className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 flex-shrink-0" />
                                    <span className="text-sm font-medium text-slate-700 leading-relaxed">{task}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Inputs Table Pane */}
                          {cp.inputsRequired && cp.inputsRequired.length > 0 && (
                            <div className="p-6 md:p-8 border-b border-slate-100/80">
                              <h5 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                <Package className="w-4 h-4 text-slate-300" />
                                {t.inputsLabel}
                              </h5>
                              <div className="rounded-2xl border border-slate-200/60 overflow-hidden bg-white">
                                <table className="w-full text-sm text-left">
                                  <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                      <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">{t.item}</th>
                                      <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">{t.qty}</th>
                                      <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">{t.cost}</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-50">
                                    {cp.inputsRequired.map((inp, iIdx) => (
                                      <tr key={iIdx}>
                                        <td className="px-5 py-3.5 font-bold text-slate-700">{inp.item}</td>
                                        <td className="px-5 py-3.5 font-medium text-slate-500">{inp.quantity}</td>
                                        <td className="px-5 py-3.5 font-bold text-slate-900 text-right">{inp.estimatedCost}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {/* Labour Match Pane (Advanced) */}
                          {cp.workersNeeded && cp.workersNeeded.length > 0 && (
                            <div className="p-6 md:p-8 bg-blue-50/30 border-b border-slate-100/80">
                               <h5 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                <Users className="w-4 h-4 text-slate-300" />
                                {t.workersLabel}
                              </h5>
                              <div className="space-y-3">
                                {cp.workersNeeded.map((w, wIdx) => (
                                  <div key={wIdx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-[1.5rem] p-5 border border-slate-200/60 shadow-sm">
                                     <div className="flex items-center gap-4">
                                       <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl shadow-inner">
                                         {w.role?.includes('tractor') || w.category?.includes('machine') ? '🚜' : w.role?.includes('spray') ? '🧪' : '🧑‍🌾'}
                                       </div>
                                       <div>
                                         <p className="font-bold text-base text-slate-900 capitalize tracking-tight">{(w.role || w.category || '').replace(/_/g, ' ')}</p>
                                         <p className="text-[13px] font-medium text-slate-500">
                                            {w.count} limit × {w.daysNeeded} {t.daysNeeded}
                                         </p>
                                       </div>
                                     </div>
                                     <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-center">
                                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Rate</p>
                                       <p className="text-sm font-black text-slate-900">{w.ratePerDay}{t.ratePerDay}</p>
                                     </div>
                                  </div>
                                ))}
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const cats = cp.workersNeeded.map((w) => w.category).filter(Boolean);
                                  handleFindWorkers(idx, cats);
                                }}
                                disabled={isLoadingW}
                                className="mt-5 w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold text-sm py-4 rounded-xl hover:bg-slate-800 active:scale-[0.98] transition-all shadow-[0_8px_20px_rgba(0,0,0,0.1)] disabled:opacity-50 tracking-tight"
                              >
                                {isLoadingW ? (
                                   <><span className="w-4 h-4 rounded-full border-2 border-slate-500 border-t-white animate-spin" /> {t.loading}</>
                                ) : (
                                   <><Search className="w-4 h-4" /> {t.findWorkers}</>
                                )}
                              </button>

                              {workers !== undefined && (
                                <div className="mt-6 space-y-3 animate-[fade-in-up_0.3s_ease-out]">
                                  <h6 className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1 mb-2">
                                    {t.nearbyWorkers} Results
                                  </h6>
                                  {workers.length === 0 ? (
                                    <div className="px-6 py-8 bg-white rounded-[1.5rem] border border-dashed border-slate-200 text-center">
                                      <p className="text-sm font-bold text-slate-500">{t.noWorkers}</p>
                                    </div>
                                  ) : (
                                    workers.map((wk, wkIdx) => (
                                      <div key={wkIdx} className="flex items-center gap-4 bg-white rounded-[1.5rem] p-5 border border-slate-200/60 transition-all hover:border-slate-300 shadow-sm">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-black text-lg border border-slate-200 flex-shrink-0">
                                          {wk.name?.charAt(0) || '?'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                           <div className="flex items-center justify-between mb-1">
                                             <p className="font-bold text-base text-slate-900 truncate tracking-tight">{wk.name}</p>
                                             {wk.rating?.average > 0 && (
                                               <p className="flex items-center gap-1 text-[13px] font-black text-slate-900 bg-amber-50 px-2 py-0.5 rounded-md">
                                                 <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> {wk.rating.average.toFixed(1)}
                                               </p>
                                             )}
                                           </div>
                                           <div className="flex items-center gap-2 text-[12px] font-medium text-slate-500 mb-2">
                                             <MapPin className="w-3.5 h-3.5" /> {wk.distanceKm} {t.workerDistance} {wk.location?.village && `· ${wk.location.village}`}
                                           </div>
                                           <div className="flex flex-wrap gap-2">
                                              {(wk.categoryLabels || []).slice(0, 2).map((cl, clIdx) => (
                                                <span key={clIdx} className="px-2 py-1 bg-slate-50 border border-slate-100 text-slate-600 rounded drop-shadow-sm text-[10px] font-black uppercase tracking-widest">
                                                  {cl}
                                                </span>
                                              ))}
                                           </div>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Quick Pro Tip */}
                          {cp.tips && (
                            <div className="p-6 md:p-8 bg-indigo-50/30">
                              <div className="flex gap-4 p-5 rounded-2xl bg-white border border-indigo-100/50 shadow-sm">
                                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                                   <Sparkles className="w-4 h-4" />
                                </span>
                                <div>
                                  <h5 className="text-[11px] font-black uppercase tracking-widest text-indigo-400 mb-1">{t.tipsLabel}</h5>
                                  <p className="text-[13px] font-bold tracking-tight text-slate-700 leading-relaxed">{cp.tips}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* End sequence finisher */}
              <div className="relative pl-[70px] pt-4">
                 <div
                   className="absolute left-[13px] w-9 h-9 rounded-full bg-slate-900 border-4 border-[#FDFDFD] shadow-sm flex items-center justify-center top-3 z-10"
                 >
                   <CheckCircle2 className="w-4 h-4 text-white" />
                 </div>
                 <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="font-black tracking-tight text-slate-900 text-lg">
                        Plan Complete!
                      </p>
                      <p className="text-slate-500 text-sm font-medium mt-0.5">
                        Follow the sequential steps to ensure high yield.
                      </p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
