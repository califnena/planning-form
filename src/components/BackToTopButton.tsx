import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down 50% of viewport height
      if (window.scrollY > window.innerHeight * 0.5) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <Button
      onClick={scrollToTop}
      className="fixed bottom-20 right-4 md:bottom-24 md:right-8 z-40 rounded-full shadow-lg hover:shadow-xl transition-all"
      size="sm"
      aria-label="Back to top"
      style={{
        pointerEvents: 'auto',
        // Smaller footprint on mobile to avoid blocking scroll gestures
        padding: '8px 12px',
      }}
    >
      <ArrowUp className="h-4 w-4 md:h-5 md:w-5 md:mr-2" />
      <span className="hidden md:inline text-sm font-semibold">Back to Top</span>
    </Button>
  );
};
