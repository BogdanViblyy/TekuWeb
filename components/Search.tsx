// components/Search.tsx
'use client';

import { useState } from 'react'; 
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Search() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="flex items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative flex items-center h-8">
        <MagnifyingGlassIcon
          className={`h-6 w-6 text-gray-400 transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
          aria-hidden="true"
        />
        <form action="/search" method="GET" className="absolute right-0">
          <input
            type="text"
            name="q"
            placeholder="Search"
            className={`h-full rounded-md border border-gray-300 px-2 transition-all duration-300 ease-in-out ${isHovered ? 'w-48 opacity-100' : 'w-0 opacity-0'}`}
            style={{ pointerEvents: isHovered ? 'auto' : 'none' }}
          />
        </form>
      </div>
    </div>
  );
}