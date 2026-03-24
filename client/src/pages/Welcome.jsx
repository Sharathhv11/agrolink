import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { TRANSLATIONS } from '../utils/translations.js';

const Welcome = () => {
  const { loginWithGoogle } = useAuth();
  const { language, setLanguage } = useLanguage();
  const t = (TRANSLATIONS[language] || TRANSLATIONS.en).welcome;

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans text-text-primary overflow-hidden">
      {/* HEADER */}
      <header className="sticky top-0 z-50 glass-premium px-5 py-3.5 flex justify-between items-center opacity-0 animate-fade-in-down">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-glow-green animate-pulse-glow">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
            </svg>
          </div>
          <span className="font-extrabold text-primary-dark text-xl tracking-tight">AgroLink</span>
        </div>
        
        {/* Language Toggle */}
        <div className="flex bg-white/80 backdrop-blur-sm rounded-full p-1 border border-black/[0.06] shadow-btn">
          <button
            onClick={() => setLanguage('en')}
            className={`px-3.5 py-1.5 rounded-full text-sm font-bold transition-all duration-300 ease-premium ${
              language === 'en'
                ? 'bg-white shadow-sm text-text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('kn')}
            className={`px-3.5 py-1.5 rounded-full text-sm font-bold transition-all duration-300 ease-premium ${
              language === 'kn'
                ? 'bg-white shadow-sm text-text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            ಕನ್ನಡ
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* HERO SECTION */}
        <section className="relative flex flex-col items-center justify-center min-h-[max(78vh,560px)] px-5 text-center pb-28 pt-14 gradient-hero overflow-hidden">
          {/* Ambient background particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div className="particle w-3 h-3 top-[10%] left-[15%] opacity-20" style={{animationDelay: '0s'}}></div>
            <div className="particle w-2 h-2 top-[20%] right-[20%] opacity-15" style={{animationDelay: '1.2s'}}></div>
            <div className="particle w-4 h-4 bottom-[30%] left-[10%] opacity-10" style={{animationDelay: '2.4s'}}></div>
            <div className="particle w-2 h-2 top-[60%] right-[15%] opacity-20" style={{animationDelay: '3.6s'}}></div>
            <div className="particle w-3 h-3 top-[40%] left-[80%] opacity-15" style={{animationDelay: '1.8s'}}></div>
            <div className="particle w-5 h-5 bottom-[20%] right-[30%] opacity-10" style={{animationDelay: '2.8s'}}></div>
            <div className="particle w-2 h-2 top-[15%] left-[60%] opacity-20" style={{animationDelay: '0.6s'}}></div>
            <div className="particle w-3 h-3 bottom-[10%] left-[40%] opacity-15" style={{animationDelay: '4.2s'}}></div>

            {/* Large ambient orbs */}
            <div className="absolute w-80 h-80 rounded-full bg-emerald-400/[0.07] blur-[80px] top-[-15%] left-[-10%] animate-subtle-breathe" style={{animationDuration: '8s'}}></div>
            <div className="absolute w-64 h-64 rounded-full bg-green-300/[0.05] blur-[60px] bottom-[-8%] right-[-8%] animate-subtle-breathe" style={{animationDelay: '4s', animationDuration: '10s'}}></div>
            <div className="absolute w-48 h-48 rounded-full bg-emerald-500/[0.04] blur-[50px] top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 animate-subtle-breathe" style={{animationDelay: '2s', animationDuration: '12s'}}></div>
          </div>

          {/* Hero Emblem */}
          <div className="mb-10 relative z-10 w-40 h-40 flex items-center justify-center rounded-full bg-white/[0.08] backdrop-blur-md border border-white/[0.15] animate-float shadow-glow-green-xl opacity-0 animate-scale-in">
            <svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white drop-shadow-lg">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
              <path d="M4 4l4 4"/>
              <path d="M18 18l-4-4"/>
            </svg>
            {/* Rotating dashed ring */}
            <div className="absolute inset-[-10px] rounded-full border-2 border-dashed border-white/[0.12] animate-rotate-slow"></div>
            {/* Outer glow ring */}
            <div className="absolute inset-[-20px] rounded-full border border-white/[0.06] animate-subtle-breathe" style={{animationDuration: '3s'}}></div>
          </div>

          <h1 className="relative z-10 text-6xl sm:text-7xl lg:text-8xl font-black text-white mb-4 tracking-tighter opacity-0 animate-fade-in-up anim-delay-200 drop-shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
            {t.heroTitle}
          </h1>
          <h2 className="relative z-10 text-xl sm:text-2xl text-white/90 font-semibold mb-4 opacity-0 animate-fade-in-up anim-delay-300 tracking-tight">
            {t.heroSubtitle}
          </h2>
          <p className="relative z-10 text-sm sm:text-base text-white/60 max-w-md mb-12 leading-relaxed opacity-0 animate-fade-in-up anim-delay-400">
            {t.heroDescription}
          </p>

          {/* CTA Button */}
          <button 
            onClick={loginWithGoogle}
            className="relative z-10 overflow-hidden flex items-center justify-center w-full max-w-[360px] h-[60px] bg-white rounded-2xl shadow-btn hover:shadow-btn-hover transition-all duration-500 ease-premium mb-5 opacity-0 animate-fade-in-up anim-delay-500 group hover:-translate-y-1.5 shimmer-btn active:scale-[0.98]"
          >
            <svg className="w-5 h-5 mr-3 relative z-10 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="text-text-primary font-semibold text-base relative z-10 group-hover:text-primary-dark transition-colors duration-300">{t.ctaButton}</span>
          </button>
          
          <span className="relative z-10 text-xs text-white/45 font-medium opacity-0 animate-fade-in-up anim-delay-600 tracking-wide">
            {t.ctaNote}
          </span>

          {/* Bottom wave divider */}
          <div className="absolute bottom-0 left-0 right-0 z-0 select-none pointer-events-none">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-20 sm:h-28">
              <path d="M0 120V50C180 90 360 20 540 50C720 80 900 10 1080 40C1260 70 1350 30 1440 50V120H0Z" fill="#F8FAFC"/>
            </svg>
          </div>
        </section>

        {/* FEATURE CARDS */}
        <section className="px-5 py-16 bg-surface relative">
          {/* Decorative dot pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{backgroundImage: 'radial-gradient(circle, #0F172A 1px, transparent 1px)', backgroundSize: '24px 24px'}}></div>

          <div className="relative z-10">
            <p className="text-center text-xs font-bold text-primary uppercase tracking-[0.2em] mb-2 opacity-0 animate-fade-in-up anim-delay-200">
              {t.featuresLabel}
            </p>
            <h3 className="text-center text-2xl sm:text-3xl font-extrabold text-text-primary mb-12 opacity-0 animate-fade-in-up anim-delay-300 tracking-tight">
              {t.featuresTitle}
            </h3>
          </div>

          <div className="flex overflow-x-auto gap-5 scroll-smooth snap-x snap-mandatory pb-6 [scrollbar-width:thin] sm:justify-center max-w-5xl mx-auto relative z-10">
            
            {/* Card 1 */}
            <div className="snap-center min-w-[280px] max-w-[310px] flex-shrink-0 premium-card p-7 flex flex-col items-start opacity-0 animate-slide-in-left anim-delay-400 group">
              <div className="icon-container w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center mb-6 shadow-glow-green group-hover:scale-110 group-hover:shadow-glow-green-lg">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-text-primary mb-2.5 tracking-tight">{t.card1Title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{t.card1Desc}</p>
            </div>

            {/* Card 2 */}
            <div className="snap-center min-w-[280px] max-w-[310px] flex-shrink-0 premium-card p-7 flex flex-col items-start opacity-0 animate-slide-up-stagger anim-delay-500 group">
              <div className="icon-container w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-6 shadow-md group-hover:scale-110 group-hover:shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-text-primary mb-2.5 tracking-tight">{t.card2Title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{t.card2Desc}</p>
            </div>

            {/* Card 3 */}
            <div className="snap-center min-w-[280px] max-w-[310px] flex-shrink-0 premium-card p-7 flex flex-col items-start opacity-0 animate-slide-in-right anim-delay-600 group">
              <div className="icon-container w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mb-6 shadow-md group-hover:scale-110 group-hover:shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-text-primary mb-2.5 tracking-tight">{t.card3Title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{t.card3Desc}</p>
            </div>

          </div>
        </section>

        {/* STATS BAR */}
        <section className="py-16 bg-white relative overflow-hidden">
          {/* Subtle background accent */}
          <div className="absolute w-96 h-96 rounded-full bg-primary/[0.03] blur-[100px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="flex justify-center flex-wrap gap-0 relative z-10">
            <div className="px-10 py-5 text-center flex flex-col items-center opacity-0 animate-scale-in anim-delay-500">
              <span className="text-4xl sm:text-5xl font-black gradient-text mb-2 tracking-tight">10,000+</span>
              <span className="text-xs text-text-secondary font-semibold uppercase tracking-[0.2em]">{t.statFarmers}</span>
            </div>
            <div className="px-10 py-5 text-center flex flex-col items-center border-l border-r border-black/[0.06] opacity-0 animate-scale-in anim-delay-600">
              <span className="text-4xl sm:text-5xl font-black gradient-text mb-2 tracking-tight">50,000+</span>
              <span className="text-xs text-text-secondary font-semibold uppercase tracking-[0.2em]">{t.statWorkers}</span>
            </div>
            <div className="px-10 py-5 text-center flex flex-col items-center opacity-0 animate-scale-in anim-delay-700">
              <span className="text-4xl sm:text-5xl font-black gradient-text mb-2 tracking-tight">21</span>
              <span className="text-xs text-text-secondary font-semibold uppercase tracking-[0.2em]">{t.statDistricts}</span>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="py-10 border-t border-black/[0.04] bg-white text-center opacity-0 animate-fade-in-up anim-delay-800">
        <p className="text-xs text-text-muted font-medium tracking-wide">{t.footer}</p>
      </footer>
    </div>
  );
};

export default Welcome;
