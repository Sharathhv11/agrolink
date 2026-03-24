import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem('agrolink_lang') || 'en';
    } catch {
      return 'en';
    }
  });

  const toggleLanguage = (lang) => {
    setLanguage(lang);
    try {
      localStorage.setItem('agrolink_lang', lang);
    } catch {
      // ignore
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
