import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useLanguage = () => {
  const { i18n } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  // Load language on mount - Force Spanish only
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        // Always set to Spanish
        await i18n.changeLanguage('es');
        localStorage.setItem('efaLanguage', 'es');
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
