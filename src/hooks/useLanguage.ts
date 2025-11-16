import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useLanguage = () => {
  const { i18n } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  // Load language on mount
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        // 1. Check if user is logged in
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // 2. Try to get language from user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('preferred_language')
            .eq('id', user.id)
            .single();

          if (profile?.preferred_language) {
            await i18n.changeLanguage(profile.preferred_language);
            localStorage.setItem('efaLanguage', profile.preferred_language);
            setIsLoading(false);
            return;
          }
        }

        // 3. Fallback to localStorage
        const storedLanguage = localStorage.getItem('efaLanguage');
        if (storedLanguage) {
          await i18n.changeLanguage(storedLanguage);
          setIsLoading(false);
          return;
        }

        // 4. Fallback to English
        await i18n.changeLanguage('en');
        localStorage.setItem('efaLanguage', 'en');
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading language:', error);
        setIsLoading(false);
      }
    };

    loadLanguage();
  }, [i18n]);

  const changeLanguage = async (languageCode: string) => {
    try {
      // Change language immediately
      await i18n.changeLanguage(languageCode);
      localStorage.setItem('efaLanguage', languageCode);

      // If user is logged in, update their profile
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({ preferred_language: languageCode })
          .eq('id', user.id);

        if (error) {
          console.error('Error updating language preference:', error);
        }
      }
    } catch (error) {
      console.error('Error changing language:', error);
      toast({
        title: 'Error',
        description: 'Failed to change language. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return {
    currentLanguage: i18n.language,
    changeLanguage,
    isLoading,
  };
};
