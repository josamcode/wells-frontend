import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [mode, setModeState] = useState(
    localStorage.getItem('theme-mode') || 'light'
  );
  const [primaryColor, setPrimaryColorState] = useState(
    localStorage.getItem('primary-color') || '#2563eb'
  );
  const [secondaryColor, setSecondaryColorState] = useState(
    localStorage.getItem('secondary-color') || '#10b981'
  );

  useEffect(() => {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [mode]);

  useEffect(() => {
    // Apply custom colors to CSS variables
    document.documentElement.style.setProperty('--color-primary', primaryColor);
    document.documentElement.style.setProperty('--color-secondary', secondaryColor);
  }, [primaryColor, secondaryColor]);

  const setMode = (newMode) => {
    setModeState(newMode);
    localStorage.setItem('theme-mode', newMode);
  };

  const toggleMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
  };

  const setPrimaryColor = (color) => {
    setPrimaryColorState(color);
    localStorage.setItem('primary-color', color);
  };

  const setSecondaryColor = (color) => {
    setSecondaryColorState(color);
    localStorage.setItem('secondary-color', color);
  };

  const value = {
    mode,
    isDark: mode === 'dark',
    primaryColor,
    secondaryColor,
    setMode,
    toggleMode,
    setPrimaryColor,
    setSecondaryColor,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

