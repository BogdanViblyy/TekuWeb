'use client';

import { useState, useEffect } from 'react';

const isBrowser = typeof window !== 'undefined';

export function useWindowCenter() {
  const [center, setCenter] = useState({
    x: isBrowser ? window.innerWidth / 2 : 0,
    y: isBrowser ? window.innerHeight / 2 : 0,
    ready: false // Добавляем флаг готовности
  });

  useEffect(() => {
    if (!isBrowser) return;

    function handleResize() {
      setCenter({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        ready: true
      });
    }

    // Инициализируем сразу
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return center;
}