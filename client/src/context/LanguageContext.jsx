import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { apiRequest } from '../api/apiClient';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const { token, user } = useAuth();

  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem('agrolink_lang') || 'en';
    } catch {
      return 'en';
    }
  });

  // When profile loads, prefer language stored in DB (used for WhatsApp etc.)
  useEffect(() => {
    if (user?.language && ['en', 'kn'].includes(user.language)) {
      setLanguageState(user.language);
      try {
        localStorage.setItem('agrolink_lang', user.language);
      } catch {
        // ignore
      }
    }
  }, [user?.language]);

  const setLanguage = useCallback(
    async (lang) => {
      if (!['en', 'kn'].includes(lang)) return;

      setLanguageState(lang);
      try {
        localStorage.setItem('agrolink_lang', lang);
      } catch {
        // ignore
      }

      if (!token) return;

      try {
        await apiRequest('/users/language', {
          method: 'PUT',
          token,
          body: { language: lang },
        });
      } catch (e) {
        console.warn('Language sync failed:', e?.message || e);
      }
    },
    [token]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
