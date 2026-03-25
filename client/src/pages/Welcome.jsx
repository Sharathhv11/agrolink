import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { TRANSLATIONS } from '../utils/translations.js';
import { 
  Tractor, 
  MapPin, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Leaf
} from 'lucide-react';

const Welcome = () => {
  const { loginWithGoogle } = useAuth();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const t = (TRANSLATIONS[language] || TRANSLATIONS.en).welcome;

  useEffect(() => {
    // Inject keyframes for premium falling animation
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes leafDrop {
        0% { transform: translateY(0); opacity: 0; }
        5% { opacity: 1; }
        85% { opacity: 1; }
        100% { transform: translateY(${window.innerHeight}px); opacity: 0; }
      }
      @keyframes leafZigZag {
        0% { transform: translateX(0) rotate(0deg); }
        25% { transform: translateX(-35px) rotate(-25deg); }
        50% { transform: translateX(25px) rotate(35deg); }
        75% { transform: translateX(-20px) rotate(-15deg); }
        100% { transform: translateX(10px) rotate(5deg); }
      }
    `;
    document.head.appendChild(style);

    let lastTime = 0;
    const handleMouseMove = (e) => {
      const now = Date.now();
      if (now - lastTime < 80) return; // Prevent too many leaves
      if (Math.random() > 0.3) return;
      lastTime = now;

      // Outer wrapper (handles drop & delay)
      const wrapper = document.createElement('div');
      wrapper.style.position = 'fixed';
      wrapper.style.left = `${e.clientX}px`;
      wrapper.style.top = `${e.clientY}px`;
      wrapper.style.pointerEvents = 'none';
      wrapper.style.zIndex = '9999';
      wrapper.style.opacity = '0'; // default hidden before delay
      
      const delay = Math.random() * 0.4 + 0.1; // 100ms - 500ms hanging delay!
      wrapper.style.animation = `leafDrop 4s ease-in ${delay}s forwards`;
      
      // Inner wrapper (handles zig-zag swaying)
      const leaf = document.createElement('div');
      leaf.innerHTML = '🍃';
      leaf.style.fontSize = `${Math.random() * 10 + 14}px`;
      
      const swayDuration = 1.8 + Math.random() * 1.5;
      const swayDir = Math.random() > 0.5 ? 'normal' : 'reverse';
      leaf.style.animation = `leafZigZag ${swayDuration}s ease-in-out infinite alternate ${swayDir}`;

      wrapper.appendChild(leaf);
      document.body.appendChild(wrapper);

      setTimeout(() => {
        if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
      }, (4 + delay) * 1000 + 100);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (style.parentNode) document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col font-sans text-slate-900 overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
      
      {/* 1. HEADER (Floating Pill / Glassmorphic) */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-5xl z-50 bg-white/70 backdrop-blur-xl border border-slate-200/60 rounded-full px-4 py-2 flex justify-between items-center transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex items-center gap-2 cursor-pointer ml-1" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
            </svg>
          </div>
          <span className="font-extrabold text-slate-900 text-lg tracking-tight">AgroLink</span>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">How it Works</a>
          <a href="#trust" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">Trust</a>
        </nav>
        
        {/* Language & Actions */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setLanguage(language === 'en' ? 'kn' : 'en')}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors text-xs font-bold text-slate-500"
          >
            {language === 'en' ? 'ಕನ್ನಡ' : 'EN'}
          </button>
          <button 
            onClick={loginWithGoogle}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-full transition-all active:scale-95 shadow-md shadow-slate-900/10"
          >
            Sign In
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col pt-32">
        {/* 2. HERO SECTION */}
        <section className="relative flex flex-col items-center justify-center pt-20 px-6 overflow-visible">
          {/* Ambient Glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-300/15 blur-[120px] rounded-full pointer-events-none -z-10"></div>
          
          {/* Pill Badge */}
          <div className="relative z-10 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/50 border border-blue-100 text-sm font-bold text-blue-700 mb-8 shadow-sm animate-[fade-in-up_0.6s_ease-out]">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
            {language === 'en' ? 'The #1 Platform for Indian Agriculture' : 'ಭಾರತೀಯ ಕೃಷಿಗೆ #1 ವೇದಿಕೆ'}
          </div>

          <h1 className="relative z-10 text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 tracking-tighter text-center max-w-4xl leading-[1.05] mb-6 animate-[fade-in-up_0.8s_ease-out]">
            {t.heroTitle.split(' ').map((word, i, arr) => {
              const isHighlight = i >= arr.length - 2;
              return (
                <span key={i} className={isHighlight ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600" : ""}>
                  {word}{" "}
                </span>
              );
            })}
          </h1>
          
          <h2 className="relative z-10 text-xl md:text-2xl text-slate-500 font-medium mb-10 max-w-2xl text-center tracking-tight animate-[fade-in-up_1.0s_ease-out]">
            {t.heroSubtitle}
          </h2>

          {/* User CTAs */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto animate-[fade-in-up_1.2s_ease-out]">
            <button 
              onClick={loginWithGoogle}
              className="group relative flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-slate-900 rounded-[2rem] shadow-[0_8px_30px_rgb(15,23,42,0.15)] hover:shadow-[0_15px_40px_rgb(15,23,42,0.25)] hover:-translate-y-0.5 transition-all duration-300 active:scale-95 border border-slate-700 hover:border-slate-600"
            >
              <div className="bg-white p-1 rounded-full mr-3 shadow-inner">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
              </div>
              <span className="text-white font-bold text-[15px] tracking-wide mr-2">Start Hiring Now</span>
              <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/labor-register')}
              className="group relative flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-full font-semibold shadow-sm hover:bg-slate-50 hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
            >
              <span className="tracking-wide">{language === 'kn' ? 'ಕಾರ್ಮಿಕ ನೋಂದಣಿ' : 'Register as Worker'}</span>
            </button>
          </div>
          
          <p className="relative z-10 text-sm font-semibold text-slate-400 mt-6 animate-[fade-in-up_1.4s_ease-out] flex items-center gap-2">
             <ShieldCheck className="w-4 h-4 text-emerald-500" />
             No credit card required. Free forever for laborers.
          </p>

          {/* Epic Hero UI Preview Canvas */}
          <div className="relative z-10 w-full max-w-4xl mx-auto mt-12 md:mt-16 rounded-[2rem] overflow-hidden shadow-[0_30px_80px_-20px_rgba(37,99,235,0.2)] border border-slate-200/80 bg-white p-2 animate-[fade-in-up_1s_ease-out_0.6s_forwards] mb-10 opacity-0">
             <div className="aspect-[16/9] bg-slate-100 rounded-[1.5rem] relative overflow-hidden group">
                <img src="/home.jpeg" alt="Dashboard Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent"></div>
             </div>
          </div>
        </section>

        {/* 3. TRUST / LOGOS SECTION */}
        <section className="py-20 mt-10 border-b border-slate-100 bg-white">
           <div className="max-w-7xl mx-auto px-6 text-center">
              <p className="text-sm font-bold text-slate-400 tracking-[0.2em] uppercase mb-8">Trusted by thousands across 21 districts</p>
              <div className="flex flex-wrap justify-center items-center gap-12 sm:gap-20 opacity-50 grayscale">
                 <div className="flex items-center gap-2 font-black text-2xl text-slate-900"><Tractor className="w-8 h-8"/> AgriCorp</div>
                 <div className="flex items-center gap-2 font-black text-2xl text-slate-900"><Leaf className="w-8 h-8"/> KisanPro</div>
                 <div className="flex items-center gap-2 font-black text-2xl text-slate-900"><ShieldCheck className="w-8 h-8"/> SecureFarm</div>
              </div>
           </div>
        </section>

        {/* 4. FEATURES (Bento Grid) */}
        <section id="features" className="py-32 bg-[#FAFAF9] relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white to-transparent h-40"></div>
          
          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
                Everything you need to grow.
              </h2>
              <p className="text-lg text-slate-500 font-medium">
                AgroLink replaces chaotic WhatsApp groups and unreliable middlemen with a fast, verified network.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="p-8 bg-white rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(37,99,235,0.08)] transition-shadow duration-500">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6 border border-blue-100">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">{t.card1Title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">Find workers instantly through intelligent radius matching. No more waiting days for contractors.</p>
              </div>

              {/* Feature 2 */}
              <div className="p-8 bg-white rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(245,158,11,0.08)] transition-shadow duration-500">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mb-6 border border-amber-100">
                   <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">{t.card2Title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">Every worker and employer is phone-verified. Build a transparent reputation over time.</p>
              </div>

              {/* Feature 3 */}
              <div className="p-8 bg-white rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(16,185,129,0.08)] transition-shadow duration-500">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-6 border border-emerald-100">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">{t.card3Title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">Pinpoint precise farm coordinates using our native map system so workers never get lost.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. HOW IT WORKS (Minimal Process) */}
        <section id="how-it-works" className="py-24 bg-white border-t border-slate-100">
           <div className="max-w-5xl mx-auto px-6">
              <div className="text-center mb-16">
                 <p className="text-xs font-bold text-blue-600 tracking-[0.2em] uppercase mb-2">Simplicity First</p>
                 <h2 className="text-4xl font-black text-slate-900 tracking-tight">How AgroLink Works</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                 {/* Connecting line for desktop */}
                 <div className="hidden md:block absolute top-[28px] left-[15%] right-[15%] h-0.5 bg-slate-100 -z-10"></div>
                 
                 <div className="text-center flex flex-col items-center">
                    <div className="w-14 h-14 bg-white border border-slate-200 rounded-full flex items-center justify-center text-2xl font-black text-slate-900 shadow-sm mb-6">1</div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">Create Profile</h4>
                    <p className="text-sm text-slate-500">Sign up securely via Google or SMS. Select your roles and expertise.</p>
                 </div>
                 <div className="text-center flex flex-col items-center">
                    <div className="w-14 h-14 bg-white border border-slate-200 rounded-full flex items-center justify-center text-2xl font-black text-slate-900 shadow-sm mb-6">2</div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">Post or Search</h4>
                    <p className="text-sm text-slate-500">Employers post jobs on the map. Laborers instantly see nearby work.</p>
                 </div>
                 <div className="text-center flex flex-col items-center">
                    <div className="w-14 h-14 bg-[#16A34A] border-none rounded-full flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-[#16A34A]/30 mb-6">3</div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">Connect & Grow</h4>
                    <p className="text-sm text-slate-500">Call directly through the app. Rate each other to build community trust.</p>
                 </div>
              </div>
           </div>
        </section>

      </main>

      {/* 6. PREMIUM FOOTER */}
      <footer className="pt-24 pb-12 border-t border-slate-200/60 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
                  </svg>
                </div>
                <span className="font-extrabold text-slate-900 text-xl tracking-tight">AgroLink</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Modernizing agriculture networks through transparency and speed.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-bold text-slate-900 mb-5">Platform</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-slate-500 hover:text-blue-600 transition-colors">Labor Network</a></li>
                <li><a href="#" className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors">Fasal Planner <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">New</span></a></li>
                <li><a href="#" className="text-sm text-slate-500 hover:text-blue-600 transition-colors">Equipment Rental</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-5">Company</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-slate-500 hover:text-blue-600 transition-colors">About</a></li>
                <li><a href="#" className="text-sm text-slate-500 hover:text-blue-600 transition-colors">Careers</a></li>
                <li><a href="#" className="text-sm text-slate-500 hover:text-blue-600 transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-5">Legal</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-slate-500 hover:text-blue-600 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-sm text-slate-500 hover:text-blue-600 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            
          </div>

          <div className="pt-8 border-t border-slate-200/60 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-400 font-medium">© 2026 AgroLink. All rights reserved.</p>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
               <span className="text-xs font-bold text-emerald-700">All Systems Operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;
