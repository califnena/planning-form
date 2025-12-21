import { createContext, useContext, useState, useEffect, ReactNode, FC } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Preset types
export type TextSizePreset = 'compact' | 'standard' | 'senior' | 'easy-view';

interface PresetConfig {
  fontScale: number;
  lineHeight: number;
  buttonScale: number;
  spacing: number;
}

const PRESET_CONFIGS: Record<TextSizePreset, PresetConfig> = {
  'compact': { fontScale: 0.9, lineHeight: 1.4, buttonScale: 0.9, spacing: 0.9 },
  'standard': { fontScale: 1.0, lineHeight: 1.5, buttonScale: 1.0, spacing: 1.0 },
  'senior': { fontScale: 1.15, lineHeight: 1.6, buttonScale: 1.1, spacing: 1.15 },
  'easy-view': { fontScale: 1.25, lineHeight: 1.7, buttonScale: 1.2, spacing: 1.25 },
};

interface TextSizeContextType {
  preset: TextSizePreset;
  setPreset: (preset: TextSizePreset) => void;
  config: PresetConfig;
  // Legacy support for increase/decrease
  fontScale: number;
  increase: () => void;
  decrease: () => void;
  canIncrease: boolean;
  canDecrease: boolean;
}

const TextSizeContext = createContext<TextSizeContextType | undefined>(undefined);

interface TextSizeProviderProps {
  children: ReactNode;
}

const PRESETS_ORDER: TextSizePreset[] = ['compact', 'standard', 'senior', 'easy-view'];

export const TextSizeProvider: FC<TextSizeProviderProps> = ({ children }) => {
  const [preset, setPresetState] = useState<TextSizePreset>(() => {
    const stored = localStorage.getItem('efa-text-size-preset');
    return (stored as TextSizePreset) || 'standard';
  });

  const config = PRESET_CONFIGS[preset];
  const currentIndex = PRESETS_ORDER.indexOf(preset);
  const canIncrease = currentIndex < PRESETS_ORDER.length - 1;
  const canDecrease = currentIndex > 0;

  const increase = () => {
    if (canIncrease) {
      setPreset(PRESETS_ORDER[currentIndex + 1]);
    }
  };

  const decrease = () => {
    if (canDecrease) {
      setPreset(PRESETS_ORDER[currentIndex - 1]);
    }
  };

  const setPreset = async (newPreset: TextSizePreset) => {
    setPresetState(newPreset);
    localStorage.setItem('efa-text-size-preset', newPreset);

    // If logged in, save to database
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          text_size_preset: newPreset,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
    }
  };

  // Load from database on mount if logged in
  useEffect(() => {
    const loadFromDB = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: settings } = await supabase
        .from('user_settings')
        .select('text_size_preset')
        .eq('user_id', user.id)
        .maybeSingle();

      const settingsData = settings as { text_size_preset?: string } | null;
      if (settingsData?.text_size_preset && PRESETS_ORDER.includes(settingsData.text_size_preset as TextSizePreset)) {
        setPresetState(settingsData.text_size_preset as TextSizePreset);
        localStorage.setItem('efa-text-size-preset', settingsData.text_size_preset);
      }
    };
    loadFromDB();
  }, []);

  // Apply styles to document
  useEffect(() => {
    document.documentElement.style.setProperty('--app-font-scale', String(config.fontScale));
    document.documentElement.style.setProperty('--app-line-height', String(config.lineHeight));
    document.documentElement.style.setProperty('--app-button-scale', String(config.buttonScale));
    document.documentElement.style.setProperty('--app-spacing-scale', String(config.spacing));
    document.documentElement.style.fontSize = `${config.fontScale * 100}%`;
  }, [config]);

  return (
    <TextSizeContext.Provider value={{ 
      preset, 
      setPreset, 
      config,
      fontScale: config.fontScale,
      increase,
      decrease,
      canIncrease,
      canDecrease
    }}>
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