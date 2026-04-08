'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { FilterOptions, ColorFilter } from '@/types';
import PriceSlider from './PriceSlider';

function ArrayFilter({ title, options, filterKey }: { title: string, options: string[], filterKey: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentValues = searchParams.getAll(filterKey);

  const handleToggle = (value: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    const isSelected = currentValues.includes(value);

    // Remove all first to rebuild
    newParams.delete(filterKey);

    if (isSelected) {
      // Add back everything EXCEPT the toggled value
      currentValues.filter(v => v !== value).forEach(v => newParams.append(filterKey, v));
    } else {
      // Add back everything PLUS the toggled value
      currentValues.forEach(v => newParams.append(filterKey, v));
      newParams.append(filterKey, value);
    }

    startTransition(() => {
        router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="py-4 border-b">
      <h3 className="font-semibold mb-3">{title}</h3>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {options.map(option => {
          const isSelected = currentValues.includes(option);
          return (
            <label key={option} className={`flex items-center space-x-2 cursor-pointer ${isPending ? 'opacity-50' : ''}`}>
              <input 
                 type="checkbox" 
                 checked={isSelected} 
                 onChange={() => handleToggle(option)}
                 disabled={isPending}
                 className="rounded border-gray-300 text-black focus:ring-black"
              />
              <span className="text-sm">{option}</span>
            </label>
          )
        })}
      </div>
    </div>
  );
}

function ColorFilterComponent({ title, options, filterKey }: { title: string, options: ColorFilter[], filterKey: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentValues = searchParams.getAll(filterKey);

  const handleToggle = (value: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    const isSelected = currentValues.includes(value);

    newParams.delete(filterKey);
    if (isSelected) {
      currentValues.filter(v => v !== value).forEach(v => newParams.append(filterKey, v));
    } else {
      currentValues.forEach(v => newParams.append(filterKey, v));
      newParams.append(filterKey, value);
    }

    startTransition(() => {
        router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="py-4 border-b">
      <h3 className="font-semibold mb-3">{title}</h3>
      <div className="flex flex-wrap gap-2 py-1 pl-1">
        {options.map(option => {
          const isSelected = currentValues.includes(option.name);
          return (
            <button
              key={option.name}
              title={option.name}
              onClick={() => handleToggle(option.name)}
              disabled={isPending}
              className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${isSelected ? 'border-black scale-110' : 'border-transparent shadow-sm'} ${isPending ? 'opacity-50' : ''}`}
              style={{ backgroundColor: option.rgb || '#ccc' }}
              aria-label={`Filter by ${option.name}`}
            />
          )
        })}
      </div>
    </div>
  );
}

function ToggleFilter({ title, filterKey }: { title: string, filterKey: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const isSelected = searchParams.get(filterKey) === 'true';

  const handleToggle = () => {
    const newParams = new URLSearchParams(searchParams.toString());
    
    if (isSelected) {
      newParams.delete(filterKey);
    } else {
      newParams.set(filterKey, 'true');
    }

    startTransition(() => {
        router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="py-4 border-b">
      <label className={`flex items-center space-x-2 cursor-pointer ${isPending ? 'opacity-50' : ''}`}>
        <input 
            type="checkbox" 
            checked={isSelected} 
            onChange={handleToggle}
            disabled={isPending}
            className="rounded border-gray-300 text-black focus:ring-black"
        />
        <span className="font-semibold">{title}</span>
      </label>
    </div>
  );
}

export default function ProductFilters({ filters }: { filters: FilterOptions }) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Filters</h2>
      
      {(filters.minPrice !== undefined && filters.maxPrice !== undefined && filters.maxPrice >= filters.minPrice) && (
        <PriceSlider min={filters.minPrice} max={filters.maxPrice} />
      )}

      <ToggleFilter title="On Sale" filterKey="onSale" />
      <ToggleFilter title="In Stock Only" filterKey="inStock" />

      {filters.brands.length > 0 && <ArrayFilter title="Brands" options={filters.brands} filterKey="brand" />}
      {filters.sizes.length > 0 && <ArrayFilter title="Sizes" options={filters.sizes} filterKey="size" />}
      {filters.colors.length > 0 && <ColorFilterComponent title="Colors" options={filters.colors} filterKey="color" />}
      {filters.materials.length > 0 && <ArrayFilter title="Materials" options={filters.materials} filterKey="material" />}
    </div>
  );
}