import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { TRANSLATIONS } from '../utils/translations.js';

export default function MandiPrices() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const t = (TRANSLATIONS[language] || TRANSLATIONS.en).mandiPrices;

  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const apiKey = import.meta.env.VITE_MANDI_API_KEY;
        const params = new URLSearchParams({
          'api-key': apiKey,
          format: 'json',
          limit: '50'
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
          setPrices(data.records);
          setError(false);
        } else {
          throw new Error("No data");
        }
      } catch (err) {
        // Fallback robust dummy data based on language loosely
        setError(true);
        setPrices([
          { commodity: language === 'kn' ? 'ಭತ್ತ' : 'Paddy', market: 'Arsikere', district: 'Hassan', modal_price: '2150', min_price: '2000', max_price: '2200' },
          { commodity: language === 'kn' ? 'ಮೆಕ್ಕೆಜೋಳ' : 'Maize', market: 'Channarayapatna', district: 'Hassan', modal_price: '1820', min_price: '1800', max_price: '1850' },
          { commodity: language === 'kn' ? 'ರಾಗಿ' : 'Ragi', market: 'Hassan', district: 'Hassan', modal_price: '3400', min_price: '3200', max_price: '3500' },
          { commodity: language === 'kn' ? 'ಈರುಳ್ಳಿ' : 'Onion', market: 'Belur', district: 'Hassan', modal_price: '1200', min_price: '1100', max_price: '1300' },
          { commodity: language === 'kn' ? 'ಟೊಮೆಟೊ' : 'Tomato', market: 'Holonarasipura', district: 'Hassan', modal_price: '890', min_price: '800', max_price: '950' },
          { commodity: language === 'kn' ? 'ಹತ್ತಿ' : 'Cotton', market: 'Arsikere', district: 'Hassan', modal_price: '7200', min_price: '7000', max_price: '7400' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchPrices();
  }, [user, language]);

  return (
    <div className="min-h-[100dvh] bg-[#FAFAF7] font-sans text-gray-900 pb-[calc(24px+env(safe-area-inset-bottom))] relative w-full overflow-x-hidden">
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200 h-16 px-4 md:px-8 flex items-center gap-4 shadow-sm">
        <button 
          onClick={() => navigate('/home')} 
          className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center -ml-2"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="font-extrabold text-[#1A1A1A] text-lg leading-tight tracking-tight">
            {t.title}
          </h1>
          <p className="text-xs text-gray-500 font-medium">{t.subtitle}</p>
        </div>
      </header>

      {/* CONTENT */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {error && (
          <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-start gap-3 shadow-sm animate-fade-in-up">
            <span className="text-amber-500 mt-0.5">⚠️</span>
            <p className="text-amber-800 text-sm font-medium">{t.error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-12 h-12 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">{t.loading}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prices.map((item, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 animate-fade-in-up" 
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="bg-gradient-to-r from-[#1A6B3C]/5 to-emerald-500/5 px-5 py-4 border-b border-gray-100/60">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-extrabold text-lg text-gray-900 leading-tight mb-1">{item.commodity}</h3>
                      <p className="text-xs font-semibold text-[#1A6B3C] bg-[#1A6B3C]/10 inline-flex items-center px-2 py-0.5 rounded-md">
                        {item.market || item.district}
                      </p>
                    </div>
                    {item.variety && (
                      <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded">
                        {item.variety}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">{t.tablePrice}</span>
                    <span className="text-2xl font-black text-gray-900 tracking-tight">₹{item.modal_price}</span>
                  </div>
                  
                  <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">Min Price</span>
                      <span className="text-sm font-bold text-gray-700">₹{item.min_price}</span>
                    </div>
                    <div className="w-px h-6 bg-gray-200"></div>
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">Max Price</span>
                      <span className="text-sm font-bold text-gray-700">₹{item.max_price}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
