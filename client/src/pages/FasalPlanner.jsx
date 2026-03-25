import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiRequest } from '../api/apiClient';

// ── Crop Data ────────────────────────────────────────────────────────
const CROPS = [
  {
    id: 'ragi',
    name: { en: 'Ragi (Finger Millet)', kn: 'ರಾಗಿ' },
    emoji: '🌾',
    color: '#B45309',
    gradient: 'from-amber-600 to-amber-800',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    season: { en: 'Kharif', kn: 'ಖಾರಿಫ್' },
    duration: { en: '4-5 months', kn: '4-5 ತಿಂಗಳು' },
    image: '🌾',
    desc: {
      en: 'Highly nutritious millet, drought-resistant, ideal for Karnataka and South India.',
      kn: 'ಅತ್ಯಂತ ಪೌಷ್ಟಿಕ ರಾಗಿ, ಬರ ನಿರೋಧಕ, ಕರ್ನಾಟಕ ಮತ್ತು ದಕ್ಷಿಣ ಭಾರತಕ್ಕೆ ಸೂಕ್ತ.',
    },
  },
  {
    id: 'wheat',
    name: { en: 'Wheat', kn: 'ಗೋಧಿ' },
    emoji: '🌿',
    color: '#15803D',
    gradient: 'from-green-600 to-green-800',
    bg: 'bg-green-50',
    border: 'border-green-200',
    season: { en: 'Rabi', kn: 'ರಬಿ' },
    duration: { en: '4-5 months', kn: '4-5 ತಿಂಗಳು' },
    image: '🌿',
    desc: {
      en: 'Staple grain crop, best grown in cool season with good irrigation.',
      kn: 'ಪ್ರಮುಖ ಧಾನ್ಯ ಬೆಳೆ, ತಂಪು ಋತುವಿನಲ್ಲಿ ಉತ್ತಮ ನೀರಾವರಿಯೊಂದಿಗೆ ಬೆಳೆಯಿರಿ.',
    },
  },
  {
    id: 'corn',
    name: { en: 'Corn (Maize)', kn: 'ಮೆಕ್ಕೆಜೋಳ' },
    emoji: '🌽',
    color: '#CA8A04',
    gradient: 'from-yellow-600 to-yellow-800',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    season: { en: 'Kharif / Rabi', kn: 'ಖಾರಿಫ್ / ರಬಿ' },
    duration: { en: '3-4 months', kn: '3-4 ತಿಂಗಳು' },
    image: '🌽',
    desc: {
      en: 'Versatile cereal crop with high demand for food, feed & industrial use.',
      kn: 'ಆಹಾರ, ಪಶು ಆಹಾರ ಮತ್ತು ಕೈಗಾರಿಕಾ ಬಳಕೆಗೆ ಹೆಚ್ಚು ಬೇಡಿಕೆ ಇರುವ ಬಹುಮುಖ ಧಾನ್ಯ.',
    },
  },
  {
    id: 'paddy',
    name: { en: 'Paddy (Rice)', kn: 'ಭತ್ತ' },
    emoji: '🍚',
    color: '#0D9488',
    gradient: 'from-teal-600 to-teal-800',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    season: { en: 'Kharif', kn: 'ಖಾರಿಫ್' },
    duration: { en: '4-6 months', kn: '4-6 ತಿಂಗಳು' },
    image: '🍚',
    desc: {
      en: 'Major food grain, requires standing water, high yield with proper management.',
      kn: 'ಪ್ರಮುಖ ಆಹಾರ ಧಾನ್ಯ, ನಿಂತ ನೀರು ಅಗತ್ಯ, ಸರಿಯಾದ ನಿರ್ವಹಣೆಯಿಂದ ಹೆಚ್ಚಿನ ಇಳುವರಿ.',
    },
  },
  {
    id: 'sugarcane',
    name: { en: 'Sugarcane', kn: 'ಕಬ್ಬು' },
    emoji: '🎋',
    color: '#7C3AED',
    gradient: 'from-violet-600 to-violet-800',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    season: { en: 'All Year', kn: 'ವರ್ಷಪೂರ್ತಿ' },
    duration: { en: '12-18 months', kn: '12-18 ತಿಂಗಳು' },
    image: '🎋',
    desc: {
      en: 'Cash crop with high profit potential, needs rich soil and abundant water.',
      kn: 'ಹೆಚ್ಚಿನ ಲಾಭದ ಸಾಮರ್ಥ್ಯ ಹೊಂದಿರುವ ವಾಣಿಜ್ಯ ಬೆಳೆ.',
    },
  },
  {
    id: 'groundnut',
    name: { en: 'Groundnut', kn: 'ಕಡಲೆಕಾಯಿ' },
    emoji: '🥜',
    color: '#DC2626',
    gradient: 'from-red-600 to-red-800',
    bg: 'bg-red-50',
    border: 'border-red-200',
    season: { en: 'Kharif', kn: 'ಖಾರಿಫ್' },
    duration: { en: '3-5 months', kn: '3-5 ತಿಂಗಳು' },
    image: '🥜',
    desc: {
      en: 'Oilseed crop, good for sandy & loamy soils, nitrogen-fixing legume.',
      kn: 'ಎಣ್ಣೆ ಬೀಜ ಬೆಳೆ, ಮರಳು ಮತ್ತು ಲೋಮ ಮಣ್ಣಿಗೆ ಸೂಕ್ತ.',
    },
  },
];

// ── Text constants ───────────────────────────────────────────────────
const TEXT = {
  en: {
    title: 'Fasal Planner',
    subtitle: 'AI-Powered Crop Planning for Smart Farming',
    selectCrop: 'Choose your crop to get a complete AI-powered roadmap',
    season: 'Season',
    duration: 'Duration',
    planNow: 'Plan Now',
    generating: 'AI is creating your roadmap...',
    roadmapTitle: 'Crop Roadmap',
    back: '← Back to Crops',
    totalDuration: 'Total Duration',
    bestSeason: 'Best Season',
    costPerAcre: 'Cost / Acre',
    yieldPerAcre: 'Yield / Acre',
    tasksLabel: 'Tasks',
    workersLabel: 'Workers Needed',
    inputsLabel: 'Inputs Required',
    tipsLabel: 'Pro Tip',
    findWorkers: 'Find Nearby Workers',
    nearbyWorkers: 'Available Workers Nearby',
    noWorkers: 'No workers found in 5km radius. Try expanding your search.',
    workerDistance: 'km away',
    jobsDone: 'jobs done',
    ratePerDay: '/ day',
    daysNeeded: 'days',
    item: 'Item',
    qty: 'Qty',
    cost: 'Est. Cost',
    loading: 'Loading...',
    errorRetry: 'Something went wrong. Please try again.',
    retry: 'Retry',
  },
  kn: {
    title: 'ಫಸಲ್ ಯೋಜನಾಕಾರ',
    subtitle: 'AI-ಆಧಾರಿತ ಬೆಳೆ ಯೋಜನೆ',
    selectCrop: 'ಸಂಪೂರ್ಣ AI ಮಾರ್ಗಸೂಚಿ ಪಡೆಯಲು ನಿಮ್ಮ ಬೆಳೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    season: 'ಋತು',
    duration: 'ಅವಧಿ',
    planNow: 'ಯೋಜನೆ ಮಾಡಿ',
    generating: 'AI ನಿಮ್ಮ ಮಾರ್ಗಸೂಚಿ ರಚಿಸುತ್ತಿದೆ...',
    roadmapTitle: 'ಬೆಳೆ ಮಾರ್ಗಸೂಚಿ',
    back: '← ಬೆಳೆಗಳಿಗೆ ಹಿಂತಿರುಗಿ',
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

// ── Animated dots component ──────────────────────────────────────────
const LoadingDots = () => (
  <span className="inline-flex gap-1 ml-2">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"
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

  // ── State ──
  const [view, setView] = useState('crops'); // 'crops' | 'loading' | 'roadmap'
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [error, setError] = useState('');
  const [expandedCheckpoint, setExpandedCheckpoint] = useState(null);
  const [workerData, setWorkerData] = useState({}); // { checkpointIndex: workers[] }
  const [loadingWorkers, setLoadingWorkers] = useState({});
  const [animatedCards, setAnimatedCards] = useState([]);

  // ── Animate cards on mount ──
  useEffect(() => {
    const timers = CROPS.map((_, i) =>
      setTimeout(() => {
        setAnimatedCards((prev) => [...prev, i]);
      }, i * 100)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  // ── Generate roadmap ──
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

  // ── Find nearby workers ──
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

  // ── Go back ──
  const handleBack = () => {
    setView('crops');
    setSelectedCrop(null);
    setRoadmap(null);
    setError('');
    setExpandedCheckpoint(null);
    setWorkerData({});
  };

  return (
    <div className="min-h-[100dvh] bg-[#FAFAF7] font-sans text-gray-900 overflow-x-hidden">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 h-16 px-4 md:px-8 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/home')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌱</span>
            <h1 className="font-extrabold text-[#1A6B3C] text-xl tracking-tight">{t.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1A6B3C] to-emerald-500 text-white flex items-center justify-center font-bold text-sm">
            {user?.name?.charAt(0) || 'U'}
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/*  VIEW: CROP SELECTION CARDS                                     */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {view === 'crops' && (
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
          {/* Hero Section */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-[#E8F5EE] text-[#1A6B3C] px-4 py-1.5 rounded-full text-sm font-bold mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1A6B3C] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1A6B3C]"></span>
              </span>
              AI-Powered
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">{t.subtitle}</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">{t.selectCrop}</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mx-auto max-w-md mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-center text-sm font-medium animate-fadeIn">
              {error}
            </div>
          )}

          {/* Crop Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CROPS.map((crop, index) => (
              <div
                key={crop.id}
                className={`group relative bg-white rounded-2xl border ${crop.border} overflow-hidden
                  transition-all duration-500 cursor-pointer hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-1
                  ${animatedCards.includes(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
                `}
                style={{ transitionDelay: `${index * 60}ms` }}
                onClick={() => handlePlanCrop(crop)}
              >
                {/* Card gradient top bar */}
                <div className={`h-1.5 bg-gradient-to-r ${crop.gradient}`} />

                <div className="p-5">
                  {/* Crop icon + name */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-14 h-14 ${crop.bg} rounded-2xl flex items-center justify-center text-3xl
                        group-hover:scale-110 transition-transform duration-300`}
                      >
                        {crop.emoji}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 leading-tight">
                          {crop.name[language]}
                        </h3>
                        <span
                          className="inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-bold text-white"
                          style={{ backgroundColor: crop.color }}
                        >
                          {crop.season[language]}
                        </span>
                      </div>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>

                  {/* Description */}
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{crop.desc[language]}</p>

                  {/* Meta */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {crop.duration[language]}
                      </span>
                    </div>
                    <span
                      className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all
                      bg-gray-100 text-gray-600 group-hover:bg-[#1A6B3C] group-hover:text-white"
                    >
                      {t.planNow} →
                    </span>
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
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <div className="relative mb-8">
            {/* Pulsing rings */}
            <div className="absolute inset-0 rounded-full bg-[#1A6B3C]/10 animate-ping" style={{ animationDuration: '2s' }} />
            <div className="absolute inset-2 rounded-full bg-[#1A6B3C]/10 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
            <div className="relative w-24 h-24 bg-gradient-to-tr from-[#1A6B3C] to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200">
              <span className="text-4xl animate-bounce">{selectedCrop?.emoji || '🌱'}</span>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{t.generating}</h3>
          <p className="text-gray-500 text-sm max-w-xs text-center">
            {selectedCrop?.name[language]}
          </p>

          {/* Skeleton timeline preview */}
          <div className="mt-10 w-full max-w-md space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}>
                <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded-full w-3/4" />
                  <div className="h-2 bg-gray-100 rounded-full w-1/2" />
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
        <div ref={roadmapRef} className="max-w-4xl mx-auto px-4 md:px-6 py-6 pb-24">
          {/* Back button */}
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#1A6B3C] mb-6 transition-colors"
          >
            {t.back}
          </button>

          {/* Roadmap Header Card */}
          <div
            className="relative overflow-hidden rounded-2xl p-6 md:p-8 mb-8 text-white"
            style={{
              background: `linear-gradient(135deg, ${selectedCrop?.color || '#1A6B3C'}dd, ${selectedCrop?.color || '#1A6B3C'}88)`,
            }}
          >
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{selectedCrop?.emoji}</span>
                <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                    {roadmap.cropName || selectedCrop?.name[language]}
                  </h2>
                  <p className="text-white/80 text-sm mt-1">{roadmap.summary}</p>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                {[
                  { label: t.totalDuration, value: roadmap.totalDuration, icon: '⏱️' },
                  { label: t.bestSeason, value: roadmap.bestSeason, icon: '🌤️' },
                  { label: t.costPerAcre, value: roadmap.estimatedCostPerAcre, icon: '💰' },
                  { label: t.yieldPerAcre, value: roadmap.expectedYieldPerAcre, icon: '📦' },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="bg-white/15 backdrop-blur-sm rounded-xl p-3 border border-white/10"
                  >
                    <span className="text-lg">{stat.icon}</span>
                    <p className="text-white/70 text-[11px] font-medium mt-1 uppercase tracking-wider">{stat.label}</p>
                    <p className="font-bold text-sm mt-0.5">{stat.value || '-'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── TIMELINE ──────────────────────────────────────────── */}
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#1A6B3C] rounded-full" />
            {t.roadmapTitle}
          </h3>

          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#1A6B3C] via-emerald-300 to-gray-200" />

            <div className="space-y-4">
              {(roadmap.checkpoints || []).map((cp, idx) => {
                const isExpanded = expandedCheckpoint === idx;
                const workers = workerData[idx];
                const isLoadingW = loadingWorkers[idx];

                return (
                  <div key={idx} className="relative pl-16 group">
                    {/* Timeline dot */}
                    <div
                      className={`absolute left-4 w-5 h-5 rounded-full border-[3px] transition-all duration-300 flex items-center justify-center
                        ${isExpanded
                          ? 'bg-[#1A6B3C] border-[#1A6B3C] scale-125 shadow-lg shadow-green-200'
                          : 'bg-white border-[#1A6B3C]/40 group-hover:border-[#1A6B3C] group-hover:scale-110'
                        }`}
                      style={{ top: '1.25rem' }}
                    >
                      {isExpanded && (
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      )}
                    </div>

                    {/* Checkpoint Card */}
                    <div
                      className={`bg-white rounded-2xl border overflow-hidden transition-all duration-300 cursor-pointer
                        ${isExpanded
                          ? 'border-[#1A6B3C]/30 shadow-[0_10px_40px_rgba(26,107,60,0.1)]'
                          : 'border-gray-100 hover:border-gray-200 hover:shadow-md'
                        }`}
                      onClick={() => setExpandedCheckpoint(isExpanded ? null : idx)}
                    >
                      {/* Card Header */}
                      <div className="p-4 md:p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <span className="text-2xl mt-0.5">{cp.icon || '📌'}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="px-2 py-0.5 bg-[#E8F5EE] text-[#1A6B3C] rounded text-[11px] font-bold uppercase tracking-wider">
                                  {cp.weekRange || `Week ${cp.week}`}
                                </span>
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[11px] font-bold">
                                  {cp.phase}
                                </span>
                              </div>
                              <h4 className="font-bold text-[15px] text-gray-900">{cp.title}</h4>
                              <p className="text-gray-500 text-sm mt-1 line-clamp-2">{cp.description}</p>
                            </div>
                          </div>

                          <svg
                            className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300 mt-1 ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="border-t border-gray-100 animate-fadeIn">
                          {/* Tasks */}
                          {cp.tasks && cp.tasks.length > 0 && (
                            <div className="p-4 md:p-5 border-b border-gray-50">
                              <h5 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                <span className="w-5 h-5 bg-[#E8F5EE] rounded flex items-center justify-center text-xs">✓</span>
                                {t.tasksLabel}
                              </h5>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {cp.tasks.map((task, tIdx) => (
                                  <div key={tIdx} className="flex items-start gap-2 text-sm text-gray-600">
                                    <span className="text-[#1A6B3C] mt-0.5 text-xs">●</span>
                                    <span>{task}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Workers Needed */}
                          {cp.workersNeeded && cp.workersNeeded.length > 0 && (
                            <div className="p-4 md:p-5 border-b border-gray-50 bg-amber-50/30">
                              <h5 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                <span className="w-5 h-5 bg-amber-100 rounded flex items-center justify-center text-xs">👷</span>
                                {t.workersLabel}
                              </h5>
                              <div className="space-y-2">
                                {cp.workersNeeded.map((w, wIdx) => (
                                  <div
                                    key={wIdx}
                                    className="flex items-center justify-between bg-white rounded-xl p-3 border border-amber-100"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center text-lg">
                                        {w.role?.includes('tractor') || w.category?.includes('machine')
                                          ? '🚜'
                                          : w.role?.includes('spray') || w.category?.includes('pesticide')
                                          ? '🧪'
                                          : w.role?.includes('irrigat') || w.category?.includes('irrigat')
                                          ? '💧'
                                          : '🧑‍🌾'}
                                      </div>
                                      <div>
                                        <p className="font-semibold text-sm text-gray-900 capitalize">
                                          {(w.role || w.category || '').replace(/_/g, ' ')}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                          {w.count} {language === 'kn' ? 'ಜನ' : 'workers'} × {w.daysNeeded} {t.daysNeeded}
                                        </p>
                                      </div>
                                    </div>
                                    <span className="text-sm font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg">
                                      {w.ratePerDay} {t.ratePerDay}
                                    </span>
                                  </div>
                                ))}
                              </div>

                              {/* Find Nearby Workers Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const cats = cp.workersNeeded.map((w) => w.category).filter(Boolean);
                                  handleFindWorkers(idx, cats);
                                }}
                                disabled={isLoadingW}
                                className="mt-4 w-full flex items-center justify-center gap-2 bg-[#1A6B3C] text-white font-bold text-sm py-3 rounded-xl
                                  hover:bg-[#145530] active:scale-[0.98] transition-all shadow-sm disabled:opacity-50"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {isLoadingW
                                  ? <>{t.loading}<LoadingDots /></>
                                  : t.findWorkers
                                }
                              </button>

                              {/* Nearby Workers List */}
                              {workers !== undefined && (
                                <div className="mt-4 space-y-2 animate-fadeIn">
                                  <h6 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                    {t.nearbyWorkers}
                                  </h6>
                                  {workers.length === 0 ? (
                                    <p className="text-sm text-gray-400 text-center py-4 bg-white rounded-xl border border-dashed border-gray-200">
                                      {t.noWorkers}
                                    </p>
                                  ) : (
                                    workers.map((wk, wkIdx) => (
                                      <div
                                        key={wkIdx}
                                        className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100 hover:border-[#1A6B3C]/20 transition-colors"
                                      >
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1A6B3C] to-emerald-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                                          {wk.name?.charAt(0) || '?'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="font-bold text-sm text-gray-900 truncate">{wk.name}</p>
                                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                                            <span>📍 {wk.distanceKm} {t.workerDistance}</span>
                                            {wk.location?.village && <span>· {wk.location.village}</span>}
                                          </div>
                                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            {(wk.categoryLabels || []).slice(0, 2).map((cl, clIdx) => (
                                              <span key={clIdx} className="px-1.5 py-0.5 bg-[#E8F5EE] text-[#1A6B3C] rounded text-[10px] font-medium">
                                                {cl}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                          {wk.rating?.average > 0 && (
                                            <p className="text-sm font-bold text-gray-900">
                                              ⭐ {wk.rating.average.toFixed(1)}
                                            </p>
                                          )}
                                          <p className="text-[11px] text-gray-400">
                                            {wk.totalJobsCompleted || 0} {t.jobsDone}
                                          </p>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Inputs Required */}
                          {cp.inputsRequired && cp.inputsRequired.length > 0 && (
                            <div className="p-4 md:p-5 border-b border-gray-50">
                              <h5 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                <span className="w-5 h-5 bg-blue-50 rounded flex items-center justify-center text-xs">📦</span>
                                {t.inputsLabel}
                              </h5>
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="text-left text-xs text-gray-400 uppercase tracking-wider">
                                      <th className="pb-2 font-semibold">{t.item}</th>
                                      <th className="pb-2 font-semibold">{t.qty}</th>
                                      <th className="pb-2 font-semibold text-right">{t.cost}</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-50">
                                    {cp.inputsRequired.map((inp, iIdx) => (
                                      <tr key={iIdx}>
                                        <td className="py-2 text-gray-700 font-medium">{inp.item}</td>
                                        <td className="py-2 text-gray-500">{inp.quantity}</td>
                                        <td className="py-2 text-gray-700 font-semibold text-right">{inp.estimatedCost}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {/* Pro Tip */}
                          {cp.tips && (
                            <div className="p-4 md:p-5 bg-gradient-to-r from-emerald-50 to-teal-50">
                              <div className="flex items-start gap-3">
                                <span className="text-lg mt-0.5">💡</span>
                                <div>
                                  <h5 className="text-sm font-bold text-[#1A6B3C] mb-1">{t.tipsLabel}</h5>
                                  <p className="text-sm text-gray-600 leading-relaxed">{cp.tips}</p>
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

              {/* End marker */}
              <div className="relative pl-16">
                <div
                  className="absolute left-4 w-5 h-5 rounded-full bg-gradient-to-tr from-[#1A6B3C] to-emerald-500 border-2 border-white shadow-lg flex items-center justify-center"
                  style={{ top: '0.25rem' }}
                >
                  <span className="text-[8px]">✓</span>
                </div>
                <div className="bg-[#E8F5EE] rounded-xl p-4 border border-[#1A6B3C]/10">
                  <p className="font-bold text-[#1A6B3C] text-sm">
                    🎉 {language === 'kn' ? 'ಬೆಳೆ ಯೋಜನೆ ಸಂಪೂರ್ಣ!' : 'Crop Plan Complete!'}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    {language === 'kn'
                      ? 'ಶುಭಕಾಮನೆಗಳು! ಉತ್ತಮ ಫಸಲು ಪಡೆಯಿರಿ.'
                      : 'Best wishes for a bountiful harvest!'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Retry button */}
          <div className="mt-8 text-center">
            <button
              onClick={() => handlePlanCrop(selectedCrop)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:border-[#1A6B3C] hover:text-[#1A6B3C] transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {language === 'kn' ? 'ಮತ್ತೆ ಯೋಜನೆ ರಚಿಸಿ' : 'Regenerate Plan'}
            </button>
          </div>
        </div>
      )}

      {/* ── CUSTOM CSS ────────────────────────────────────────────── */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.35s ease-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
