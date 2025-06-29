'use client';

import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';

interface ContentAnimationContextType {
  shouldAnimateContent: boolean;
  setShouldAnimateContent: Dispatch<SetStateAction<boolean>>;
  contentKey: number;
  resetContentAnimation: () => void;
}

const ContentAnimationContext = createContext<ContentAnimationContextType | undefined>(undefined);

export function ContentAnimationProvider({ children }: { children: ReactNode }) {
  const [shouldAnimateContent, setShouldAnimateContent] = useState(false);
  const [contentKey, setContentKey] = useState(0);
  
  const resetContentAnimation = () => {
    setContentKey(prev => prev + 1);
    setShouldAnimateContent(true);
  };

  return (
    <ContentAnimationContext.Provider value={{ 
      shouldAnimateContent, 
      setShouldAnimateContent,
      contentKey,
      resetContentAnimation
    }}>
      {children}
    </ContentAnimationContext.Provider>
  );
}

export function useContentAnimation() {
  const context = useContext(ContentAnimationContext);
  if (context === undefined) {
    throw new Error('useContentAnimation must be used within a ContentAnimationProvider');
  }
  return context;
}