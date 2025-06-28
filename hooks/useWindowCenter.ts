// hooks/useWindowCenter.ts
'use client';

import { useState, useEffect } from 'react';

// Проверяем, выполняется ли код в браузере
const isBrowser = typeof window !== 'undefined';

export function useWindowCenter() {
  const [center, setCenter] = useState({
    x: isBrowser ? window.innerWidth / 2 : 0,
    y: isBrowser ? window.innerHeight / 2 : 0,
  });

  useEffect(() => {
    // Если код выполняется не в браузере, ничего не делаем
    if (!isBrowser) {
      return;
    }

    function handleResize() {
      setCenter({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
    }

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return center;
}