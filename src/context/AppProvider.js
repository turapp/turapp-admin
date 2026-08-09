'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [lang, setLang] = useState('es');

  useEffect(() => {
    // Optionally load preferences from localStorage
    const savedTheme = localStorage.getItem('turapp_theme') || 'light';
    const savedLang = localStorage.getItem('turapp_lang') || 'es';
    setTheme(savedTheme);
    setLang(savedLang);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('turapp_theme', newTheme);
  };

  const changeLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem('turapp_lang', newLang);
  };

  return (
    <AppContext.Provider value={{ theme, toggleTheme, lang, changeLang }}>
      <div className="tr-app" data-theme={theme} style={{ width: '100%', height: '100vh', display: 'flex' }}>
        {children}
      </div>
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
