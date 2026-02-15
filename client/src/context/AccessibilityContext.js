import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();

export const AccessibilityProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('accessibility');
    return saved
      ? JSON.parse(saved)
      : {
          fontSize: 'medium', // small, medium, large, x-large
          darkMode: false,
          reducedMotion: false,
          highContrast: false,
        };
  });

  useEffect(() => {
    localStorage.setItem('accessibility', JSON.stringify(settings));
    
    // Apply settings to document
    const root = document.documentElement;
    
    // Font size
    const fontSizes = {
      small: '14px',
      medium: '16px',
      large: '18px',
      'x-large': '20px',
    };
    root.style.fontSize = fontSizes[settings.fontSize];
    
    // Dark mode
    if (settings.darkMode) {
      root.classList.add('dark-mode');
    } else {
      root.classList.remove('dark-mode');
    }
    
    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    
    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const toggleDarkMode = () => {
    updateSetting('darkMode', !settings.darkMode);
  };

  const increaseFontSize = () => {
    const sizes = ['small', 'medium', 'large', 'x-large'];
    const currentIndex = sizes.indexOf(settings.fontSize);
    if (currentIndex < sizes.length - 1) {
      updateSetting('fontSize', sizes[currentIndex + 1]);
    }
  };

  const decreaseFontSize = () => {
    const sizes = ['small', 'medium', 'large', 'x-large'];
    const currentIndex = sizes.indexOf(settings.fontSize);
    if (currentIndex > 0) {
      updateSetting('fontSize', sizes[currentIndex - 1]);
    }
  };

  const toggleReducedMotion = () => {
    updateSetting('reducedMotion', !settings.reducedMotion);
  };

  const toggleHighContrast = () => {
    updateSetting('highContrast', !settings.highContrast);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        updateSetting,
        toggleDarkMode,
        increaseFontSize,
        decreaseFontSize,
        toggleReducedMotion,
        toggleHighContrast,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
