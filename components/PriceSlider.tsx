'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

export default function PriceSlider({ min, max }: { min: number; max: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const minParam = searchParams.get('minPrice');
  const maxParam = searchParams.get('maxPrice');

  // Ensure initial values are bounded by the current server props
  const initialMin = minParam ? Math.max(min, Math.min(max, parseFloat(minParam))) : min;
  const initialMax = maxParam ? Math.min(max, Math.max(min, parseFloat(maxParam))) : max;

  const [minVal, setMinVal] = useState<number>(initialMin);
  const [maxVal, setMaxVal] = useState<number>(initialMax);

  // Sync state when props change (other filters applied)
  useEffect(() => {
    const newMin = minParam ? Math.max(min, Math.min(max, parseFloat(minParam))) : min;
    const newMax = maxParam ? Math.min(max, Math.max(min, parseFloat(maxParam))) : max;
    setMinVal(newMin);
    setMaxVal(newMax);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [min, max]);

  // Debounced URL push
  const urlTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleUrlUpdate = useCallback(
    (newMin: number, newMax: number) => {
      if (urlTimerRef.current) clearTimeout(urlTimerRef.current);
      urlTimerRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (newMin > min) params.set('minPrice', newMin.toString());
        else params.delete('minPrice');
        if (newMax < max) params.set('maxPrice', newMax.toString());
        else params.delete('maxPrice');
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      }, 500);
    },
    [min, max, pathname, router, searchParams]
  );

  // rc-slider drag changes
  const handleSliderChange = (value: number | number[]) => {
    if (Array.isArray(value)) {
      setMinVal(value[0]);
      setMaxVal(value[1]);
      scheduleUrlUpdate(value[0], value[1]);
    }
  };

  // Text input handlers
  const handleMinInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinVal(Number(e.target.value));
  };

  const handleMinBlur = () => {
    const safe = Math.max(min, Math.min(minVal, maxVal));
    setMinVal(safe);
    scheduleUrlUpdate(safe, maxVal);
  };

  const handleMaxInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxVal(Number(e.target.value));
  };

  const handleMaxBlur = () => {
    const safe = Math.min(max, Math.max(maxVal, minVal));
    setMaxVal(safe);
    scheduleUrlUpdate(minVal, safe);
  };

  return (
    <div className="py-4 border-b">
      <h3 className="font-semibold mb-4">Price</h3>

      <div className="flex justify-between items-center space-x-4 mb-6">
        <div className="border border-gray-300 p-2 w-1/2 flex items-center">
          <span className="text-gray-500 mr-1">€</span>
          <input
            type="number"
            value={minVal}
            onChange={handleMinInput}
            onBlur={handleMinBlur}
            className="w-full outline-none bg-transparent"
          />
        </div>
        <div className="border border-gray-300 p-2 w-1/2 flex items-center">
          <span className="text-gray-500 mr-1">€</span>
          <input
            type="number"
            value={maxVal}
            onChange={handleMaxInput}
            onBlur={handleMaxBlur}
            className="w-full outline-none bg-transparent"
          />
        </div>
      </div>

      <div className="px-2 mb-2 custom-rc-slider">
        <Slider
          range
          min={min}
          max={max}
          value={[
            Math.max(min, Math.min(max, minVal)), 
            Math.max(min, Math.min(max, maxVal))
          ]}
          onChange={handleSliderChange}
          allowCross={false}
          trackStyle={[{ backgroundColor: 'black' }]}
          handleStyle={[
            { borderColor: 'black', backgroundColor: 'black', opacity: 1, boxShadow: 'none', border: 'solid 2px black' },
            { borderColor: 'black', backgroundColor: 'black', opacity: 1, boxShadow: 'none', border: 'solid 2px black' }
          ]}
          railStyle={{ backgroundColor: '#e5e7eb' }}
        />
      </div>
    </div>
  );
}
