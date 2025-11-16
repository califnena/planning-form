import React, { createContext, useContext, useState, useEffect } from 'react';

interface AccessibilityContextType {
  superSeniorMode: boolean;
  toggleSuperSeniorMode: () => void;
  highContrastMode: boolean;
  toggleHighContrastMode: () => void;
  reducedMotion: boolean;
  toggleReducedMotion: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [superSeniorMode, setSuperSeniorMode] = useState<boolean>(() => {
    const stored = localStorage.getItem('efa-super-senior-mode');
    return stored === 'true';
  });

  const [highContrastMode, setHighContrastMode] = useState<boolean>(() => {
    const stored = localStorage.getItem('efa-high-contrast');
    return stored === 'true';
  });

  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    const stored = localStorage.getItem('efa-reduced-motion');
    return stored === 'true';
  });

  const toggleSuperSeniorMode = () => {
    const newValue = !superSeniorMode;
    setSuperSeniorMode(newValue);
    localStorage.setItem('efa-super-senior-mode', newValue.toString());
    
    // When super-senior mode is enabled, also enable high contrast and reduced motion
    if (newValue) {
      setHighContrastMode(true);
      setReducedMotion(true);
      localStorage.setItem('efa-high-contrast', 'true');
      localStorage.setItem('efa-reduced-motion', 'true');
    }
  };

  const toggleHighContrastMode = () => {
    const newValue = !highContrastMode;
    setHighContrastMode(newValue);
    localStorage.setItem('efa-high-contrast', newValue.toString());
  };

  const toggleReducedMotion = () => {
    const newValue = !reducedMotion;
    setReducedMotion(newValue);
    localStorage.setItem('efa-reduced-motion', newValue.toString());
  };

  useEffect(() => {
    // Apply super-senior mode class to html element
    if (superSeniorMode) {
      document.documentElement.classList.add('super-senior-mode');
    } else {
      document.documentElement.classList.remove('super-senior-mode');
    }
  }, [superSeniorMode]);

  useEffect(() => {
    // Apply high contrast class to html element
    if (highContrastMode) {
      document.documentElement.classList.add('high-contrast-mode');
    } else {
      document.documentElement.classList.remove('high-contrast-mode');
    }
  }, [highContrastMode]);

  useEffect(() => {
    // Apply reduced motion class to html element
    if (reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
  }, [reducedMotion]);

  return (
    <AccessibilityContext.Provider
      value={{
        superSeniorMode,
        toggleSuperSeniorMode,
        highContrastMode,
        toggleHighContrastMode,
        reducedMotion,
        toggleReducedMotion,
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
