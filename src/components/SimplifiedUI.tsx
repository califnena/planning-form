import { useAccessibility } from '@/contexts/AccessibilityContext';
import { ReactNode } from 'react';

interface SimplifiedUIProps {
  children: ReactNode;
  essential?: boolean;
}

/**
 * Wrapper component that hides non-essential UI elements in Super-Senior Mode
 * @param essential - If true, always shows the element even in Super-Senior Mode
 */
export const SimplifiedUI = ({ children, essential = false }: SimplifiedUIProps) => {
  const { superSeniorMode } = useAccessibility();

  // Always show essential elements
  if (essential) {
    return <>{children}</>;
  }

  // Hide non-essential elements in Super-Senior Mode
  if (superSeniorMode) {
    return null;
  }

  return <>{children}</>;
};
