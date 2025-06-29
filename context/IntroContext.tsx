'use client';

import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction, useEffect } from 'react';

interface IntroContextType {
  isIntroFinished: boolean;
  setIsIntroFinished: Dispatch<SetStateAction<boolean>>;
}

const IntroContext = createContext<IntroContextType | undefined>(undefined);

export function IntroProvider({ children }: { children: ReactNode }) {
  const [isIntroFinished, setIsIntroFinished] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('introShown') === 'true';
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('introShown', String(isIntroFinished));
    }
  }, [isIntroFinished]);

  return (
    <IntroContext.Provider value={{ isIntroFinished, setIsIntroFinished }}>
      {children}
    </IntroContext.Provider>
  );
}

export function useIntro() {
  const context = useContext(IntroContext);
  if (context === undefined) {
    throw new Error('useIntro must be used within an IntroProvider');
  }
  return context;
}