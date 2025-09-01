import React, { createContext, useContext, useState, useEffect,useMemo } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.remove('dark', 'cyberpunk', 'tos');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'cyberpunk') {
      document.documentElement.classList.add('cyberpunk');
    } else if (theme === 'tos') {
      document.documentElement.classList.add('tos');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : prev === 'dark' ? 'tos' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};