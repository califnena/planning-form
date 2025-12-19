import { createContext, useContext, useState, useEffect, ReactNode, FC } from 'react';

// Font scales: 0.9, 1.0, 1.1, 1.2
const FONT_SCALES = [0.9, 1.0, 1.1, 1.2] as const;
type FontScale = typeof FONT_SCALES[number];

interface TextSizeContextType {
  fontScale: FontScale;
  increase: () => void;
  decrease: () => void;
  canIncrease: boolean;
  canDecrease: boolean;
}

const TextSizeContext = createContext<TextSizeContextType | undefined>(undefined);

interface TextSizeProviderProps {
  children: ReactNode;
}

export const TextSizeProvider: FC<TextSizeProviderProps> = ({ children }) => {
  const [fontScale, setFontScale] = useState<FontScale>(() => {
    const stored = localStorage.getItem('efa-font-scale');
    const parsed = stored ? parseFloat(stored) : 1.0;
    return FONT_SCALES.includes(parsed as FontScale) ? (parsed as FontScale) : 1.0;
  });

  const currentIndex = FONT_SCALES.indexOf(fontScale);
  const canIncrease = currentIndex < FONT_SCALES.length - 1;
  const canDecrease = currentIndex > 0;

  const increase = () => {
    if (canIncrease) {
      const newScale = FONT_SCALES[currentIndex + 1];
      setFontScale(newScale);
      localStorage.setItem('efa-font-scale', String(newScale));
    }
  };

  const decrease = () => {
    if (canDecrease) {
      const newScale = FONT_SCALES[currentIndex - 1];
      setFontScale(newScale);
      localStorage.setItem('efa-font-scale', String(newScale));
    }
  };

  useEffect(() => {
    // Apply font scale to the main app container
    document.documentElement.style.setProperty('--app-font-scale', String(fontScale));
    document.documentElement.style.fontSize = `${fontScale * 100}%`;
  }, [fontScale]);

  return (
    <TextSizeContext.Provider value={{ fontScale, increase, decrease, canIncrease, canDecrease }}>
      {children}
    </TextSizeContext.Provider>
  );
};

export const useTextSize = () => {
  const context = useContext(TextSizeContext);
  if (!context) {
    throw new Error('useTextSize must be used within a TextSizeProvider');
  }
  return context;
};
