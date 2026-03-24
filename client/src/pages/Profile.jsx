import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { TRANSLATIONS } from '../utils/translations.js';

export default function Profile() {
  const { user, logout } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const t = (TRANSLATIONS[language] || TRANSLATIONS.en).home;

  return (
    <div className="min-h-[100dvh] bg-[#FAFAF7] font-sans text-gray-900 pb-[calc(64px+env(safe-area-inset-bottom))] relative max-w-[430px] mx-auto shadow-xl overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 h-14 px-4 flex justify-between items-center shadow-sm">
        <button onClick={() => navigate('/home')} className="text-[#1A6B3C] font-bold flex items-center gap-1">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <span className="font-bold text-gray-900 text-lg tracking-tight">Profile</span>
        <div className="w-10"></div> {/* Spacer for centering */}
      </header>

      {/* Content */}
      <div className="p-4 flex flex-col items-center mt-6">
        <div className="w-24 h-24 bg-gradient-to-tr from-[#1A6B3C] to-emerald-400 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4 cursor-pointer">
          {user?.name?.charAt(0) || 'U'}
        </div>
        <h2 className="text-xl font-bold text-gray-900">{user?.name || 'User'}</h2>
        <p className="text-gray-500 mb-8">{user?.email || 'user@example.com'}</p>

        <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-2">Account Details</h3>
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-gray-500">Role</span>
            <span className="font-medium">Farmer</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-gray-500">Location</span>
            <span className="font-medium">Karnataka</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-500">Joined</span>
            <span className="font-medium">March 2026</span>
          </div>
        </div>

        <button 
          onClick={logout}
          className="w-full bg-red-50 text-red-600 font-bold py-3 rounded-xl border border-red-100 hover:bg-red-100 transition-colors"
        >
          {t?.nav?.logout || 'Logout'}
        </button>
      </div>
    </div>
  );
}
