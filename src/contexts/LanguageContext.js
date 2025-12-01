import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [language, setLanguageState] = useState(
    localStorage.getItem('language') || 'ar'
  );
  const [direction, setDirection] = useState(language === 'ar' ? 'rtl' : 'ltr');

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
    
    // Apply font based on language
    if (language === 'ar') {
      document.body.style.fontFamily = "'Cairo', system-ui, -apple-system, sans-serif";
    } else {
      document.body.style.fontFamily = "'Inter', system-ui, -apple-system, sans-serif";
    }
  }, [language, direction]);

  const setLanguage = (lang) => {
    setLanguageState(lang);
    setDirection(lang === 'ar' ? 'rtl' : 'ltr');
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
  };

  const value = {
    language,
    direction,
    isRTL: direction === 'rtl',
    setLanguage,
    toggleLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

