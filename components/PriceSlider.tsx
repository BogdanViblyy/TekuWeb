'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function PriceSlider({ min, max }: { min: number, max: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const minParam = searchParams.get('minPrice');
  const maxParam = searchParams.get('maxPrice');
  
  const initialMin = minParam ? parseFloat(minParam) : min;
  const initialMax = maxParam ? parseFloat(maxParam) : max;

  const [minVal, setMinVal] = useState(initialMin);
  const [maxVal, setMaxVal] = useState(initialMax);

  const minValRef = useRef(initialMin);
  const maxValRef = useRef(initialMax);
  const range = useRef<HTMLDivElement>(null);

  // Convert to percentage
  const getPercent = useCallback(
    (value: number) => Math.round(((value - min) / (max - min)) * 100),
    [min, max]
  );

  // Set width of the range to decrease from the left side
  useEffect(() => {
    const minPercent = getPercent(minVal);
    const maxPercent = getPercent(maxValRef.current);

    if (range.current) {
      range.current.style.left = `${minPercent}%`;
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minVal, getPercent]);

  // Set width of the range to decrease from the right side
  useEffect(() => {
    const minPercent = getPercent(minValRef.current);
    const maxPercent = getPercent(maxVal);

    if (range.current) {
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [maxVal, getPercent]);

  // Debounce saving to URL
  useEffect(() => {
    const timeout = setTimeout(() => {
      const newParams = new URLSearchParams(searchParams.toString());
      
      if (minVal > min) {
        newParams.set('minPrice', minVal.toString());
      } else {
        newParams.delete('minPrice');
      }

      if (maxVal < max) {
        newParams.set('maxPrice', maxVal.toString());
      } else {
        newParams.delete('maxPrice');
      }

      router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
    }, 500);

    return () => clearTimeout(timeout);
  }, [minVal, maxVal, min, max, pathname, router, searchParams]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), maxVal - 1);
    setMinVal(value);
    minValRef.current = value;
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), minVal + 1);
    setMaxVal(value);
    maxValRef.current = value;
  };

  return (
    <div className="py-4 border-b">
      <h3 className="font-semibold mb-4">Price</h3>
      <div className="flex justify-between items-center space-x-4 mb-6">
        <div className="border border-gray-300 p-2 text-center w-1/2 flex items-center justify-center space-x-1">
          <span className="text-gray-500">€</span>
          <span>{minVal}</span>
        </div>
        <div className="border border-gray-300 p-2 text-center w-1/2 flex items-center justify-center space-x-1">
          <span className="text-gray-500">€</span>
          <span>{maxVal}</span>
        </div>
      </div>
      
      <div className="relative w-full h-8 flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          value={minVal}
          onChange={handleMinChange}
          className="absolute w-full h-0 pointer-events-none appearance-none z-20 opacity-0 bg-transparent flex items-center"
          style={{
              WebkitAppearance: 'none',
              pointerEvents: 'none',
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={maxVal}
          onChange={handleMaxChange}
          className="absolute w-full h-0 pointer-events-none appearance-none z-30 opacity-0 bg-transparent flex items-center"
          style={{
            WebkitAppearance: 'none',
            pointerEvents: 'none',
          }}
        />

        <div className="relative w-full h-1 bg-gray-200 z-10 pointer-events-none">
          <div ref={range} className="absolute h-1 bg-black z-20 pointer-events-none"></div>
          {/* Thumb circles simulating the slider thumbs, driven by state */}
          <div 
             className="absolute h-4 w-4 rounded-full bg-black top-[-6px] -ml-2 pointer-events-none" 
             style={{ left: `${getPercent(minVal)}%`, zIndex: 40 }}
          />
          <div 
             className="absolute h-4 w-4 rounded-full bg-black top-[-6px] -ml-2 pointer-events-none" 
             style={{ left: `${getPercent(maxVal)}%`, zIndex: 40 }}
          />
        </div>
        
        {/* Style the inputs invisibly but capturing events */}
        <style dangerouslySetInnerHTML={{ __html: `
            input[type=range]::-webkit-slider-thumb {
            pointer-events: all;
            width: 24px;
            height: 24px;
            -webkit-appearance: none;
            cursor: pointer;
            }
        ` }} />
      </div>
    </div>
  );
}
