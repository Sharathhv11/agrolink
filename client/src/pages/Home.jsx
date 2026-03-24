import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { TRANSLATIONS } from '../utils/translations.js';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const t = (TRANSLATIONS[language] || TRANSLATIONS.en).home;

  const [activeTab, setActiveTab] = useState('following');
  const [likedPosts, setLikedPosts] = useState({});
  const [repostedPosts, setRepostedPosts] = useState({});
  const [toastMessage, setToastMessage] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [sharePost, setSharePost] = useState(null);

  // New states for Navbar and Sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [mandiPrices, setMandiPrices] = useState([]);
  
  // Fetch Mandi Prices
  useEffect(() => {
    const fetchMandiPrices = async () => {
      try {
        const apiKey = import.meta.env.VITE_MANDI_API_KEY;
        const params = new URLSearchParams({
          'api-key': apiKey,
          format: 'json',
          limit: '10'
        });
        
        if (user?.location?.state) {
          params.append('filters[state.keyword]', user.location.state);
        } else {
          params.append('filters[state.keyword]', 'Karnataka'); // default
        }
        
        if (user?.location?.district) {
           params.append('filters[district]', user.location.district);
        }

        const res = await fetch(`https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?${params.toString()}`);
        const data = await res.json();
        if (data && data.records && data.records.length > 0) {
          const formattedPrices = data.records.map(record => ({
            commodity: record.commodity,
            price: record.modal_price,
            trend: Math.random() > 0.5 ? 'up' : 'down',
            percentage: (Math.random() * 5).toFixed(1)
          }));
          setMandiPrices(formattedPrices);
        } else {
          throw new Error("No data");
        }
      } catch (err) {
        // Fallback to dummy data
        setMandiPrices([
          { commodity: language === 'en' ? 'Paddy' : 'ಭತ್ತ', price: 2150, trend: 'up', percentage: '3.0' },
          { commodity: language === 'en' ? 'Maize' : 'ಮೆಕ್ಕೆಜೋಳ', price: 1820, trend: 'down', percentage: '1.2' },
          { commodity: language === 'en' ? 'Ragi' : 'ರಾಗಿ', price: 3400, trend: 'up', percentage: '5.1' },
          { commodity: language === 'en' ? 'Onion' : 'ಈರುಳ್ಳಿ', price: 1200, trend: 'flat', percentage: '0.0' },
          { commodity: language === 'en' ? 'Tomato' : 'ಟೊಮೆಟೊ', price: 890, trend: 'up', percentage: '8.4' },
          { commodity: language === 'en' ? 'Cotton' : 'ಹತ್ತಿ', price: 7200, trend: 'down', percentage: '2.1' },
          { commodity: language === 'en' ? 'Groundnut' : 'ಕಡಲೆಕಾಯಿ', price: 5400, trend: 'up', percentage: '4.5' },
        ]);
      }
    };
    fetchMandiPrices();
  }, [language]);

  const posts = [
    {
      id: 1,
      author: { en: "Raju Kumar", kn: "ರಾಜು ಕುಮಾರ್" },
      initials: "RK", colorBg: "bg-[#E8F5EE]", colorText: "text-[#1A6B3C]",
      category: { en: "Farmer", kn: "ರೈತ" }, catBg: "bg-[#1A6B3C]", catText: "text-[#E8F5EE]",
      village: { en: "Doddaballapur, Hassan", kn: "ದೊಡ್ಡಬಳ್ಳಾಪುರ, ಹಾಸನ" },
      time: { en: "2 mins", kn: "2 ನಿಮಿಷಗಳ" },
      crop: { en: "🌾 Paddy Harvesting", kn: "🌾 ಭತ್ತದ ಕೊಯ್ಲು" },
      date: { en: "Dec 15–18", kn: "ಡಿಸೆಂಬರ್ 15–18" },
      wage: "₹600",
      workersNeeded: "8",
      distance: "3.2 km",
      reposts: 5,
      interested: 12,
    },
    {
      id: 2,
      repostedBy: { en: "Mahesh Kumar", kn: "ಮಹೇಶ್ ಕುಮಾರ್" },
      author: { en: "Sunita Devi", kn: "ಸುನೀತಾ ದೇವಿ" },
      initials: "SD", colorBg: "bg-[#FFF8E1]", colorText: "text-[#F59E0B]",
      category: { en: "Farmer", kn: "ರೈತೆ" }, catBg: "bg-[#1A6B3C]", catText: "text-[#E8F5EE]",
      village: { en: "Arsikere, Hassan", kn: "ಅರಸೀಕೆರೆ, ಹಾಸನ" },
      time: { en: "45 mins", kn: "45 ನಿಮಿಷಗಳ" },
      crop: { en: "🫘 Ragi Sowing", kn: "🫘 ರಾಗಿ ಬಿತ್ತನೆ" },
      date: { en: "Dec 20–22", kn: "ಡಿಸೆಂಬರ್ 20–22" },
      wage: "₹500",
      workersNeeded: "12",
      distance: "8.7 km",
      reposts: 3,
      interested: 7,
    },
    {
      id: 3,
      author: { en: "Venkatesh M", kn: "ವೆಂಕಟೇಶ್ ಎಂ" },
      initials: "VM", colorBg: "bg-[#EEE8FF]", colorText: "text-[#4A3B8C]",
      category: { en: "Machine Owner", kn: "ಯಂತ್ರ ಮಾಲೀಕ" }, catBg: "bg-[#EEE8FF]", catText: "text-[#4A3B8C]",
      village: { en: "Channarayapatna", kn: "ಚನ್ನರಾಯಪಟ್ಟಣ" },
      time: { en: "1 hr", kn: "1 ಗಂಟೆ" },
      crop: { en: "🚜 Tractor Available — Ploughing", kn: "🚜 ಟ್ರ್ಯಾಕ್ಟರ್ ಲಭ್ಯವಿದೆ — ಉಳುಮೆ" },
      date: { en: "Dec 14–16", kn: "ಡಿಸೆಂಬರ್ 14–16" },
      wage: "₹800/hr",
      workersNeeded: { en: "1 Booking slot left", kn: "1 ಬುಕಿಂಗ್ ಮಾತ್ರ ಲಭ್ಯವಿದೆ" },
      distance: "5.1 km",
      reposts: 8,
      interested: 15,
      trending: true,
    },
    {
      id: 4,
      author: { en: "Manjula Farms", kn: "ಮಂಜುಳಾ ಫಾರ್ಮ್ಸ್" },
      initials: "MF", colorBg: "bg-[#E8F5EE]", colorText: "text-[#1A6B3C]",
      category: { en: "Farmer", kn: "ರೈತೆ" }, catBg: "bg-[#1A6B3C]", catText: "text-[#E8F5EE]",
      village: { en: "Sakleshpur", kn: "ಸಕಲೇಶಪುರ" },
      time: { en: "3 hrs", kn: "3 ಗಂಟೆಗಳ" },
      crop: { en: "🧪 Pesticide Spraying — Coffee", kn: "🧪 ಕೀಟನಾಶಕ ಸಿಂಪಡಣೆ — ಕಾಫಿ" },
      date: { en: "Dec 13", kn: "ಡಿಸೆಂಬರ್ 13" },
      wage: "₹700",
      workersNeeded: "3",
      distance: "14.2 km",
      reposts: 2,
      interested: 4,
    },
    {
      id: 5,
      author: { en: "Ramesh Transport", kn: "ರಮೇಶ್ ಟ್ರಾನ್ಸ್‌ಪೋರ್ಟ್" },
      initials: "RT", colorBg: "bg-[#FFF8E1]", colorText: "text-[#F59E0B]",
      category: { en: "Transport", kn: "ಸಾರಿಗೆ" }, catBg: "bg-[#FFF8E1]", catText: "text-[#F59E0B]",
      village: { en: "Hassan City", kn: "ಹಾಸನ ನಗರ" },
      time: { en: "5 hrs", kn: "5 ಗಂಟೆಗಳ" },
      crop: { en: "🚛 Crop Transport Available", kn: "🚛 ಬೆಳೆ ಸಾಗಾಣಿಕೆ ಲಭ್ಯವಿದೆ" },
      date: { en: "Dec 14–20", kn: "ಡಿಸೆಂಬರ್ 14–20" },
      wage: "₹12/km",
      workersNeeded: { en: "2 vehicles available", kn: "2 ವಾಹನ ಲಭ್ಯವಿದೆ" },
      distance: "1.8 km",
      reposts: 11,
      interested: 22,
      trending: true,
    }
  ];

  const handleLike = (id) => {
    setLikedPosts(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleRepost = (id) => {
    if (!repostedPosts[id]) {
      setRepostedPosts(prev => ({ ...prev, [id]: true }));
      setToastMessage(t.toasts?.reposted || 'Reposted!');
      setTimeout(() => setToastMessage(''), 2500);
    }
  };

  const handleShareClick = (post) => {
    setSharePost(post);
    setIsShareModalOpen(true);
  };

  const copyLink = () => {
    setToastMessage(t.toasts?.linkCopied || 'Link copied!');
    setIsShareModalOpen(false);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const currentTabPosts = posts;

  return (
    <div className="min-h-[100dvh] bg-[#FAFAF7] font-sans text-gray-900 pb-8 relative w-full overflow-x-hidden mx-auto">
      
      {/* SECTION 1 — TOP HEADER NAVBAR */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 h-16 px-4 md:px-8 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          {/* Hamburger Menu Icon */}
          <button onClick={() => setIsSidebarOpen(true)} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors">
            <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/home')}>
            <svg className="w-8 h-8 text-[#1A6B3C]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a8 8 0 00-6 13.93A8 8 0 0010 18a8 8 0 006-1.93A8 8 0 0010 2a8 8 0 000 16zm-1 3a1 1 0 112 0v4a1 1 0 11-2 0V5zm1 8a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd"/>
            </svg>
            <span className="font-extrabold text-[#1A6B3C] text-xl tracking-tight hidden sm:block">{t.headerTitle}</span>
          </div>
        </div>

        <div className="flex-1"></div>

        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 rounded-full p-0.5 border border-gray-200">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                language === 'en' ? 'bg-[#1A6B3C] text-white shadow' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('kn')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                language === 'kn' ? 'bg-[#1A6B3C] text-white shadow' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              ಕನ್ನಡ
            </button>
          </div>

          {/* Profile Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setIsProfileDropdownOpen(true)}
            onMouseLeave={() => setIsProfileDropdownOpen(false)}
          >
            <div 
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded-full transition-colors border border-transparent hover:border-gray-200"
              onClick={() => navigate('/profile')}
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#1A6B3C] to-emerald-500 text-white flex items-center justify-center font-bold shadow-inner">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <span className="font-bold text-sm hidden sm:block text-gray-800 pr-1">{user?.name?.split(' ')[0] || 'User'}</span>
            </div>

            {/* Dropdown Menu */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden py-1.5 z-50">
                <div className="px-4 py-3 border-b border-gray-50">
                  <p className="text-sm font-bold text-gray-900 truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email || 'user@example.com'}</p>
                </div>
                <button 
                  onClick={() => navigate('/profile')}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#1A6B3C] font-semibold transition-colors flex items-center gap-3"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  {t.nav?.profile || 'My Profile'}
                </button>
                <div className="border-t border-gray-50 my-1"></div>
                <button 
                  onClick={logout}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-semibold transition-colors flex items-center gap-3"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  {t.nav?.logout || 'Logout'}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* SIDEBAR OVERLAY */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[60] flex">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
          
          {/* Drawer */}
          <div className="relative w-72 max-w-[80%] bg-white h-full shadow-2xl sidebar-slide-in flex flex-col">
            <div className="p-5 flex items-center justify-between bg-white border-b border-gray-100">
              <div className="flex items-center gap-2">
                <svg className="w-7 h-7 text-[#1A6B3C]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a8 8 0 00-6 13.93A8 8 0 0010 18a8 8 0 006-1.93A8 8 0 0010 2a8 8 0 000 16zm-1 3a1 1 0 112 0v4a1 1 0 11-2 0V5zm1 8a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd"/>
                </svg>
                <span className="font-extrabold text-[#1A6B3C] text-xl tracking-tight">{t.headerTitle}</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-1.5">
              <button onClick={() => navigate('/jobs')} className="flex items-center gap-3 w-full p-3.5 rounded-xl hover:bg-[#E8F5EE] hover:text-[#1A6B3C] text-left font-semibold text-gray-700 transition-colors group">
                <span className="text-xl group-hover:scale-110 transition-transform">🌱</span> {t.menu?.jobs || 'Jobs'}
              </button>
              <button className="flex items-center gap-3 w-full p-3.5 rounded-xl hover:bg-[#E8F5EE] hover:text-[#1A6B3C] text-left font-semibold text-gray-700 transition-colors group">
                <span className="text-xl group-hover:scale-110 transition-transform">🔍</span> {t.menu?.explore || 'Explore'}
              </button>
              <button className="flex items-center gap-3 w-full p-3.5 rounded-xl hover:bg-[#E8F5EE] hover:text-[#1A6B3C] text-left font-semibold text-gray-700 transition-colors group">
                <span className="text-xl group-hover:scale-110 transition-transform">👥</span> {t.menu?.community || 'Community'}
              </button>
              <button className="flex items-center gap-3 w-full p-3.5 rounded-xl hover:bg-[#E8F5EE] hover:text-[#1A6B3C] text-left font-semibold text-gray-700 transition-colors group">
                <span className="text-xl group-hover:scale-110 transition-transform">📊</span> {t.menu?.fasalPlan || 'Fasal Plan'}
              </button>
              
            </nav>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1A6B3C] to-emerald-500 text-white flex items-center justify-center font-bold">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email || 'View Profile'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2 — MANDI PRICE TICKER (SCROLLING RIGHT TO LEFT) */}
      <div 
        onClick={() => navigate('/mandi-prices')}
        className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-2.5 overflow-hidden flex items-center relative shadow-md border-b-2 border-[#1A6B3C] cursor-pointer hover:bg-gray-800 transition-colors group"
      >
        {/* Fixed Title Background Fade */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-900 via-gray-900 to-transparent z-10 flex items-center pl-4 md:pl-8 font-bold text-xs md:text-sm uppercase tracking-wider text-[#4ADE80] group-hover:text-white transition-colors">
          {t.mandiTicker || 'Live Prices:'}
        </div>
        
        {/* Ticker Track */}
        <div className="mandi-ticker-track pl-32 flex items-center gap-8 md:gap-12">
          {mandiPrices.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 whitespace-nowrap bg-white/5 px-3 py-1 rounded-full border border-white/10">
              <span className="font-semibold text-[13px] md:text-sm text-gray-100">{item.commodity}</span>
              <span className="text-gray-400 text-[13px] md:text-sm font-medium">₹{item.price}/q</span>
              {item.trend === 'up' && <span className="text-[#4ADE80] text-[11px] md:text-xs font-bold bg-[#4ADE80]/10 px-1.5 py-0.5 rounded">▲ {item.percentage}%</span>}
              {item.trend === 'down' && <span className="text-red-400 text-[11px] md:text-xs font-bold bg-red-400/10 px-1.5 py-0.5 rounded">▼ {item.percentage}%</span>}
              {item.trend === 'flat' && <span className="text-gray-400 text-[11px] md:text-xs font-bold bg-gray-400/10 px-1.5 py-0.5 rounded">─ 0%</span>}
            </div>
          ))}
          {/* Duplicate set for infinite loop effect */}
          {mandiPrices.map((item, idx) => (
            <div key={`dup-${idx}`} className="flex items-center gap-2 whitespace-nowrap bg-white/5 px-3 py-1 rounded-full border border-white/10">
              <span className="font-semibold text-[13px] md:text-sm text-gray-100">{item.commodity}</span>
              <span className="text-gray-400 text-[13px] md:text-sm font-medium">₹{item.price}/q</span>
              {item.trend === 'up' && <span className="text-[#4ADE80] text-[11px] md:text-xs font-bold bg-[#4ADE80]/10 px-1.5 py-0.5 rounded">▲ {item.percentage}%</span>}
              {item.trend === 'down' && <span className="text-red-400 text-[11px] md:text-xs font-bold bg-red-400/10 px-1.5 py-0.5 rounded">▼ {item.percentage}%</span>}
              {item.trend === 'flat' && <span className="text-gray-400 text-[11px] md:text-xs font-bold bg-gray-400/10 px-1.5 py-0.5 rounded">─ 0%</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
      {/* SECTION 5 — FEED TABS */}
      <div className="sticky top-16 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200 mt-2">
        <div className="flex px-4 md:px-0">
          <button
            onClick={() => setActiveTab('following')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'following' ? 'border-[#1A6B3C] text-[#1A6B3C]' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.tabs?.following || 'Following'}
          </button>
          <button
            onClick={() => setActiveTab('nearby')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'nearby' ? 'border-[#1A6B3C] text-[#1A6B3C]' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.tabs?.nearby || 'Nearby'}
          </button>
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'explore' ? 'border-[#1A6B3C] text-[#1A6B3C]' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.tabs?.explore || 'Explore'}
          </button>
        </div>
      </div>

      {/* SECTION 6 — FEED */}
      <div className="px-3 md:px-4 py-4 space-y-3 pb-24">
        {currentTabPosts.map((post) => (
          <div key={post.id} className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
            {post.repostedBy && (
              <div className="px-3 py-2 bg-gray-50 text-gray-500 text-xs italic flex items-center gap-1.5 border-b border-gray-100">
                <span className="text-gray-400">🔁</span> {post.repostedBy[language]} {t.postLabels?.repostedBy || 'reposted'}
              </div>
            )}
            
            <div className="p-3 md:p-4">
              {/* TOP ROW */}
              <div className="flex items-start justify-between mb-3 relative">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${post.colorBg} ${post.colorText}`}>
                    {post.initials}
                  </div>
                  <div>
                    <h4 className="font-bold text-[15px] text-[#1A1A1A] leading-tight flex items-center gap-1.5">
                      {post.author[language]}
                      {activeTab === 'explore' && post.trending && (
                        <span className="px-1.5 py-0.5 bg-red-50 text-red-600 rounded text-[10px] font-bold uppercase tracking-wider ml-1">
                          {t.postLabels?.trending || 'Trending 🔥'}
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {post.village[language]} · {post.time[language]} {t.postLabels?.ago || 'ago'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${post.catBg} ${post.catText} bg-opacity-10 text-opacity-100`}>
                    {post.category[language]}
                  </span>
                  {activeTab === 'nearby' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5EE] text-[#1A6B3C]">
                      {post.distance} {t.postLabels?.away || 'away'}
                    </span>
                  )}
                </div>
              </div>

              {/* JOB DETAILS SECTION */}
              <div className="bg-[#E8F5EE] rounded-lg p-3 mx-[-4px]">
                <h5 className="font-bold text-[15px] text-[#1A1A1A] mb-2">{post.crop[language]}</h5>
                <div className="grid grid-cols-2 gap-y-2 gap-x-1">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-gray-400">📍</span>
                    <span className="text-gray-500">Dist: </span>
                    <span className="font-bold text-gray-900">{post.distance}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-gray-400">📅</span>
                    <span className="text-gray-500">Date: </span>
                    <span className="font-bold text-gray-900">{post.date[language]}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-gray-400">💰</span>
                    <span className="text-gray-500">{t.postLabels?.wage || 'Wage'}: </span>
                    <span className="font-bold text-[#1A6B3C]">{post.wage}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-gray-400">👥</span>
                    <span className="text-gray-500">{t.postLabels?.workersNeeded || 'Workers'}: </span>
                    <span className="font-bold text-gray-900">{typeof post.workersNeeded === 'string' ? post.workersNeeded : post.workersNeeded[language]}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION ROW */}
            <div className="border-t border-gray-100 flex p-0">
              <button 
                onClick={() => handleRepost(post.id)}
                className={`flex-1 py-3.5 flex items-center justify-center gap-1.5 text-[13px] font-semibold transition-colors
                  ${repostedPosts[post.id] ? 'text-[#1A6B3C] bg-green-50/50' : 'text-gray-500 hover:bg-gray-50'}
                `}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {repostedPosts[post.id] ? post.reposts + 1 : post.reposts} {t.actions_post?.repost || 'Repost'}
              </button>
              
              <button 
                onClick={() => handleLike(post.id)}
                className={`flex-1 py-3.5 flex items-center justify-center gap-1.5 text-[13px] font-semibold border-x border-gray-100 transition-colors
                  ${likedPosts[post.id] ? 'text-red-500 bg-red-50/50' : 'text-gray-500 hover:bg-gray-50'}
                `}
              >
                <svg className={`w-4 h-4 ${likedPosts[post.id] ? 'fill-current' : 'fill-none'}`} viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {likedPosts[post.id] ? post.interested + 1 : post.interested} {t.actions_post?.interested || 'Interested'}
              </button>
              
              <button 
                onClick={() => handleShareClick(post)}
                className="flex-1 py-3.5 flex items-center justify-center gap-1.5 text-[13px] font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                {t.actions_post?.share || 'Share'}
              </button>
            </div>
          </div>
        ))}
      </div>
      </div>

      {/* FLOATING ACTION BUTTON */}
      <button onClick={() => navigate('/jobs/new')} className="fixed bottom-6 right-4 md:right-8 w-14 h-14 bg-[#1A6B3C] rounded-full shadow-lg flex items-center justify-center text-white hover:scale-105 hover:shadow-xl active:scale-95 transition-all z-40">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* SHARE MODAL BOTTOM SHEET */}
      <div className={`fixed inset-0 bg-black/50 z-[70] transition-opacity flex flex-col justify-end ${isShareModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsShareModalOpen(false)}>
        <div className={`bg-white rounded-t-2xl p-6 transform transition-transform duration-300 w-full max-w-md mx-auto ${isShareModalOpen ? 'translate-y-0' : 'translate-y-full'}`} onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-gray-900">{t.shareModal?.title || 'Share'}</h3>
            <button onClick={() => setIsShareModalOpen(false)} className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="flex flex-col gap-3">
            <button 
              className="flex items-center gap-4 w-full p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 font-semibold transition-all"
              onClick={() => {
                if (sharePost) {
                  const text = language === 'kn' ? `ಕೆಲಸ ಬೇಕಿದೆ 🌾 ${sharePost.crop.kn}` : `Job Alert 🌾 ${sharePost.crop.en}`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                }
              }}
            >
              <div className="bg-green-100 p-2 rounded-full"><span className="text-2xl text-green-500 leading-none block">💬</span></div>
              <span className="text-gray-800">{t.shareModal?.whatsapp || 'WhatsApp'}</span>
            </button>
            <button 
              onClick={copyLink}
              className="flex items-center gap-4 w-full p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 font-semibold transition-all"
            >
              <div className="bg-blue-50 p-2 rounded-full">
                <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <span className="text-gray-800">{t.shareModal?.copyLink || 'Copy Link'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* GLOBAL TOAST */}
      <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#1A6B3C] text-white px-6 py-3 rounded-full text-sm font-bold shadow-xl transition-all z-[80] whitespace-nowrap ${toastMessage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
        {toastMessage}
      </div>

    </div>
  );
}
