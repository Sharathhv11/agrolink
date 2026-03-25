import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { TRANSLATIONS } from '../utils/translations.js';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, Search, MapPin, Share2, Heart, Repeat2, Plus, X, 
  ChevronDown, User, LogOut, TrendingUp, TrendingDown, Minus,
  Briefcase, ClipboardCheck, Sprout, MessageCircle
} from 'lucide-react';

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
          params.append('filters[state.keyword]', 'Karnataka');
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
  }, [language, user?.location]);

  const posts = [
    {
      id: 1,
      author: { en: "Raju Kumar", kn: "ರಾಜು ಕುಮಾರ್" },
      initials: "RK", 
      category: { en: "Farmer", kn: "ರೈತ" },
      village: { en: "Doddaballapur, Hassan", kn: "ದೊಡ್ಡಬಳ್ಳಾಪುರ, ಹಾಸನ" },
      time: { en: "2 mins", kn: "2 ನಿಮಿಷಗಳ" },
      crop: { en: "Paddy Harvesting", kn: "ಭತ್ತದ ಕೊಯ್ಲು" },
      date: { en: "Dec 15–18", kn: "ಡಿಸೆಂಬರ್ 15–18" },
      wage: "₹600",
      workersNeeded: "8",
      distance: "3.2 km",
      reposts: 5,
      interested: 12,
      emoji: "🌾"
    },
    {
      id: 2,
      repostedBy: { en: "Mahesh Kumar", kn: "ಮಹೇಶ್ ಕುಮಾರ್" },
      author: { en: "Sunita Devi", kn: "ಸುನೀತಾ ದೇವಿ" },
      initials: "SD",
      category: { en: "Farmer", kn: "ರೈತೆ" },
      village: { en: "Arsikere, Hassan", kn: "ಅರಸೀಕೆರೆ, ಹಾಸನ" },
      time: { en: "45 mins", kn: "45 ನಿಮಿಷಗಳ" },
      crop: { en: "Ragi Sowing", kn: "ರಾಗಿ ಬಿತ್ತನೆ" },
      date: { en: "Dec 20–22", kn: "ಡಿಸೆಂಬರ್ 20–22" },
      wage: "₹500",
      workersNeeded: "12",
      distance: "8.7 km",
      reposts: 3,
      interested: 7,
      emoji: "🫘"
    },
    {
      id: 3,
      author: { en: "Venkatesh M", kn: "ವೆಂಕಟೇಶ್ ಎಂ" },
      initials: "VM",
      category: { en: "Machine Owner", kn: "ಯಂತ್ರ ಮಾಲೀಕ" },
      village: { en: "Channarayapatna", kn: "ಚನ್ನರಾಯಪಟ್ಟಣ" },
      time: { en: "1 hr", kn: "1 ಗಂಟೆ" },
      crop: { en: "Tractor Available — Ploughing", kn: "ಟ್ರ್ಯಾಕ್ಟರ್ ಲಭ್ಯವಿದೆ — ಉಳುಮೆ" },
      date: { en: "Dec 14–16", kn: "ಡಿಸೆಂಬರ್ 14–16" },
      wage: "₹800/hr",
      workersNeeded: { en: "1 Booking slot left", kn: "1 ಬುಕಿಂಗ್ ಮಾತ್ರ ಲಭ್ಯವಿದೆ" },
      distance: "5.1 km",
      reposts: 8,
      interested: 15,
      trending: true,
      emoji: "🚜"
    },
    {
      id: 4,
      author: { en: "Manjula Farms", kn: "ಮಂಜುಳಾ ಫಾರ್ಮ್ಸ್" },
      initials: "MF",
      category: { en: "Farmer", kn: "ರೈತೆ" },
      village: { en: "Sakleshpur", kn: "ಸಕಲೇಶಪುರ" },
      time: { en: "3 hrs", kn: "3 ಗಂಟೆಗಳ" },
      crop: { en: "Pesticide Spraying — Coffee", kn: "ಕೀಟನಾಶಕ ಸಿಂಪಡಣೆ — ಕಾಫಿ" },
      date: { en: "Dec 13", kn: "ಡಿಸೆಂಬರ್ 13" },
      wage: "₹700",
      workersNeeded: "3",
      distance: "14.2 km",
      reposts: 2,
      interested: 4,
      emoji: "🧪"
    }
  ];

  const handleLike = (id) => {
    setLikedPosts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleRepost = (id) => {
    if (!repostedPosts[id]) {
      setRepostedPosts(prev => ({ ...prev, [id]: true }));
      setToastMessage(t.toasts?.reposted || 'Reposted successfully');
      setTimeout(() => setToastMessage(''), 2500);
    }
  };

  const handleShareClick = (post) => {
    setSharePost(post);
    setIsShareModalOpen(true);
  };

  const copyLink = () => {
    setToastMessage(t.toasts?.linkCopied || 'Link copied to clipboard');
    setIsShareModalOpen(false);
    setTimeout(() => setToastMessage(''), 2500);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-slate-900 w-full overflow-x-hidden selection:bg-blue-100 selection:text-blue-900 mx-auto pb-32">
      
      {/* 1. PREMIUM HEADER NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 h-[72px] px-6 md:px-10 flex justify-between items-center transition-all">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-slate-700 hover:text-slate-900 transition-colors">
              <line x1="4" y1="9" x2="20" y2="9"></line>
              <line x1="4" y1="15" x2="14" y2="15"></line>
            </svg>
          </button>

          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/home')}>
            <div className="w-8 h-8 rounded-[0.7rem] bg-slate-900 flex items-center justify-center shadow-md shadow-slate-900/10">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <span className="font-extrabold text-slate-900 text-lg tracking-tight hidden sm:block">AgroLink</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setLanguage(language === 'en' ? 'kn' : 'en')}
            className="flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-bold border border-slate-200 bg-white shadow-sm hover:bg-slate-50 transition-colors"
          >
            {language === 'en' ? 'ಕನ್ನಡ' : 'English'}
          </button>

          {/* Profile Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setIsProfileDropdownOpen(true)}
            onMouseLeave={() => setIsProfileDropdownOpen(false)}
          >
            <div 
              className="flex items-center gap-2 cursor-pointer p-1.5 rounded-full transition-all hover:bg-slate-50"
              onClick={() => navigate('/profile')}
            >
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                {(user?.avatar || user?.picture) ? (
                  <img src={user?.avatar || user?.picture} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <span className="font-bold text-sm hidden sm:block text-slate-800 tracking-tight pr-2">{user?.name?.split(' ')[0] || 'User'}</span>
            </div>

            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden py-2 z-50 animate-[fade-in-up_0.2s_ease-out]">
                <div className="px-5 py-3 border-b border-slate-50">
                  <p className="text-sm font-bold text-slate-900 truncate tracking-tight">{user?.name || 'User'}</p>
                  <p className="text-xs font-medium text-slate-500 truncate mt-0.5">{user?.email || 'user@example.com'}</p>
                </div>
                <div className="py-1">
                   <button onClick={() => navigate('/profile')} className="w-full text-left px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center gap-3">
                     <User className="w-4 h-4" /> {t.nav?.profile || 'My Profile'}
                   </button>
                   <button onClick={logout} className="w-full text-left px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3">
                     <LogOut className="w-4 h-4" /> {t.nav?.logout || 'Logout'}
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* SIDEBAR OVERLAY */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[60] flex animate-[fade-in-up_0.2s_ease-out]">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          <div className="relative w-72 max-w-[80%] bg-[#FDFDFD] h-full shadow-[20px_0_60px_rgba(0,0,0,0.1)] flex flex-col p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="w-8 h-8 rounded-[0.7rem] bg-slate-900 flex items-center justify-center shadow-md shadow-slate-900/10">
                 <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-full hover:bg-slate-100 transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            
            <nav className="flex flex-col gap-2">
              <button onClick={() => navigate('/jobs')} className="flex items-center gap-3 text-left w-full px-4 py-3 rounded-2xl hover:bg-slate-100 font-bold text-slate-700 hover:text-slate-900 transition-colors group">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                  <Briefcase className="w-4 h-4" strokeWidth={2.5} />
                </div>
                {t.menu?.jobs || 'Job Board'}
              </button>
              <button onClick={() => navigate('/applied-jobs')} className="flex items-center gap-3 text-left w-full px-4 py-3 rounded-2xl hover:bg-slate-100 font-bold text-slate-700 hover:text-slate-900 transition-colors group">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                  <ClipboardCheck className="w-4 h-4" strokeWidth={2.5} />
                </div>
                {t.menu?.appliedJobs || 'Applied Jobs'}
              </button>
              <button onClick={() => navigate('/fasal-planner')} className="flex items-center gap-3 text-left w-full px-4 py-3 rounded-2xl hover:bg-slate-100 font-bold text-slate-700 hover:text-slate-900 transition-colors group">
                <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600 group-hover:bg-orange-100 transition-colors">
                  <Sprout className="w-4 h-4" strokeWidth={2.5} />
                </div>
                {t.menu?.fasalPlan || 'Fasal Plan'}
              </button>
              <button onClick={() => navigate('/community')} className="flex items-center gap-3 text-left w-full px-4 py-3 rounded-2xl hover:bg-slate-100 font-bold text-slate-700 hover:text-slate-900 transition-colors group">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors">
                  <MessageCircle className="w-4 h-4" strokeWidth={2.5} />
                </div>
                {t.menu?.community || 'Community'}
              </button>
            </nav>

            <div className="mt-auto pt-6 border-t border-slate-100">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600">{user?.name?.charAt(0) || 'U'}</div>
                 <div>
                    <h4 className="text-sm font-bold text-slate-900 tracking-tight">{user?.name || 'User'}</h4>
                    <p className="text-xs font-medium text-slate-500">{user?.email || 'View Profile'}</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. MINIMALIST MANDI PRICE TICKER */}
      <div 
        onClick={() => navigate('/mandi-prices')}
        className="bg-white border-b border-slate-200/60 overflow-hidden flex items-center relative py-3.5 cursor-pointer group hover:bg-slate-50 transition-colors"
      >
        <div className="absolute left-0 top-0 bottom-0 w-32 md:w-40 bg-gradient-to-r from-white via-white to-transparent z-10 flex items-center pl-6 md:pl-10 font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-600 transition-colors">
          {t.mandiTicker || 'Live Prices'}
        </div>
        
        <div className="mandi-ticker-track pl-40 flex items-center gap-8 md:gap-12">
          {mandiPrices.concat(mandiPrices).map((item, idx) => (
            <div key={idx} className="flex items-center gap-2.5 whitespace-nowrap bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">
              <span className="font-bold text-[13px] text-slate-800 tracking-tight">{item.commodity}</span>
              <span className="text-slate-500 text-[13px] font-semibold">₹{item.price}/q</span>
              {item.trend === 'up' && <span className="flex items-center text-emerald-600 text-[11px] font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md"><TrendingUp className="w-3 h-3 mr-0.5"/>{item.percentage}%</span>}
              {item.trend === 'down' && <span className="flex items-center text-red-500 text-[11px] font-bold bg-red-50 px-1.5 py-0.5 rounded-md"><TrendingDown className="w-3 h-3 mr-0.5"/>{item.percentage}%</span>}
              {item.trend === 'flat' && <span className="flex items-center text-slate-500 text-[11px] font-bold bg-slate-100 px-1.5 py-0.5 rounded-md"><Minus className="w-3 h-3 mr-0.5"/>0%</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto w-full relative">
        
        {/* 3. PREMIUM TABS */}
        <div className="sticky top-[72px] z-30 bg-[#FDFDFD]/90 backdrop-blur-xl border-b border-slate-200/60 pt-6 px-6">
          <div className="flex gap-8">
            {['following', 'nearby', 'explore'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-[14px] font-bold capitalize transition-all border-b-2 relative ${
                  activeTab === tab ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {t.tabs?.[tab] || tab}
              </button>
            ))}
          </div>
        </div>

        {/* 4. FEED (BENTO CARDS) */}
        <div className="px-5 py-8 flex flex-col gap-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all group animate-[fade-in-up_0.5s_ease-out]">
              
              {post.repostedBy && (
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-4 tracking-tight">
                  <Repeat2 className="w-3.5 h-3.5" />
                  <span>{post.repostedBy[language]} {t.postLabels?.repostedBy || 'reposted'}</span>
                </div>
              )}
              
              {/* Profile Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-slate-700 shadow-inner">
                    {post.initials}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-[15px] tracking-tight flex items-center gap-2">
                       {post.author[language]} 
                       <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest">{post.category[language]}</span>
                    </h4>
                    <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-400 mt-1">
                      <MapPin className="w-3.5 h-3.5" /> {post.village[language]} &middot; {post.time[language]}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="mb-6">
                <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight mb-4 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 shadow-sm text-xl">{post.emoji}</span>
                  {post.crop[language]}
                </h3>
                
                <div className="flex flex-wrap gap-2.5">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100/50">
                    <span className="text-emerald-700/60 font-medium text-xs tracking-tight">Wage</span>
                    <span className="text-emerald-700 font-bold text-sm tracking-tight">{post.wage}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 border border-blue-100/50">
                    <span className="text-blue-700/60 font-medium text-xs tracking-tight">Workers</span>
                    <span className="text-blue-700 font-bold text-sm tracking-tight">{typeof post.workersNeeded === 'string' ? post.workersNeeded : post.workersNeeded[language]}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 font-medium text-xs tracking-tight">Date</span>
                    <span className="text-slate-800 font-bold text-sm tracking-tight">{post.date[language]}</span>
                  </div>
                  {activeTab === 'nearby' && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-50 border border-purple-100/50">
                      <span className="text-purple-700/60 font-medium text-xs tracking-tight">Dist</span>
                      <span className="text-purple-700 font-bold text-sm tracking-tight">{post.distance}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <button onClick={() => handleRepost(post.id)} className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-[13px] font-bold transition-colors active:scale-95 ${repostedPosts[post.id] ? 'bg-slate-100 text-slate-900' : 'bg-transparent hover:bg-slate-50 text-slate-500'}`}>
                  <Repeat2 className="w-4 h-4" /> {repostedPosts[post.id] ? post.reposts + 1 : post.reposts} Repost
                </button>
                <button onClick={() => handleLike(post.id)} className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-[13px] font-bold transition-colors active:scale-95 ${likedPosts[post.id] ? 'bg-rose-50 text-rose-600' : 'bg-transparent hover:bg-slate-50 text-slate-500'}`}>
                  <Heart className={`w-4 h-4 ${likedPosts[post.id] ? 'fill-current' : 'fill-none'}`} /> {likedPosts[post.id] ? post.interested + 1 : post.interested} {t.actions_post?.interested || 'Like'}
                </button>
                <button onClick={() => handleShareClick(post)} className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-[13px] font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors active:scale-95">
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FLOATING ACTION BUTTON */}
      <button 
        onClick={() => navigate('/jobs/new')} 
        className="fixed bottom-8 right-8 z-40 bg-slate-900 text-white shadow-[0_10px_30px_rgba(0,0,0,0.15)] px-6 py-4 rounded-[1.5rem] flex items-center gap-2 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.25)] transition-all active:scale-95 group"
      >
        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
        <span className="font-bold tracking-wide pr-1">Create Job</span>
      </button>

      {/* Share Modal Background */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-[fade-in-up_0.2s_ease-out]" onClick={() => setIsShareModalOpen(false)}>
           <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                 <h3 className="font-black text-xl text-slate-900 tracking-tight">Share Job</h3>
                 <button onClick={() => setIsShareModalOpen(false)} className="p-2 rounded-full hover:bg-slate-100 transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <div className="flex flex-col gap-3">
                 <button className="flex items-center gap-4 py-4 px-5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold transition-colors" onClick={() => { if(sharePost) { window.open(`https://wa.me/?text=${encodeURIComponent('Job Alert 🌾')}`, '_blank'); } }}>
                    WhatsApp
                 </button>
                 <button onClick={copyLink} className="flex items-center gap-4 py-4 px-5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-900 font-bold transition-colors">
                    Copy Link
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Toasts */}
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full text-sm font-bold shadow-2xl transition-all z-[80] whitespace-nowrap ${toastMessage ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95 pointer-events-none'}`}>
        ✨ {toastMessage}
      </div>

    </div>
  );
}
