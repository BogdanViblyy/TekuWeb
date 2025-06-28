// components/ProductFilters.tsx
'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { FilterOptions } from '@/types'; // Убедитесь, что этот импорт есть

// Внутренний компонент Filter остается без изменений
function Filter({ title, options, filterKey }: { title: string, options: string[] | {name: string, rgb: string|null}[], filterKey: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const current = searchParams.get(filterKey) || '';

  const handleFilterChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (value) {
      newParams.set(filterKey, value);
    } else {
      newParams.delete(filterKey);
    }
    startTransition(() => {
        router.push(`${pathname}?${newParams.toString()}`);
    });
  };

  return (
    <div className="py-4 border-b">
      <h3 className="font-semibold mb-2">{title}</h3>
      <select 
        value={current} 
        onChange={(e) => handleFilterChange(e.target.value)}
        className="w-full p-2 border rounded-md"
        disabled={isPending}
      >
        <option value="">All {title}</option>
        {options.map(option => {
           const val = typeof option === 'string' ? option : option.name;
           return <option key={val} value={val}>{val}</option>
        })}
      </select>
    </div>
  );
}


// --- ИСПРАВЛЕНИЕ ЗДЕСЬ ---
// Мы удалили useEffect и useState и теперь принимаем `filters` напрямую.
// Нужно обновить определение props, чтобы TypeScript об этом знал.
export default function ProductFilters({ filters }: { filters: FilterOptions }) {
  // useEffect и useState здесь больше не нужны, так как данные приходят сверху.

  return (
    <div className="sticky top-24">
      <h2 className="text-xl font-bold mb-4">Filters</h2>
      {filters.brands.length > 0 && <Filter title="Brands" options={filters.brands} filterKey="brand" />}
      {filters.sizes.length > 0 && <Filter title="Sizes" options={filters.sizes} filterKey="size" />}
      {filters.colors.length > 0 && <Filter title="Colors" options={filters.colors} filterKey="color" />}
      {filters.materials.length > 0 && <Filter title="Materials" options={filters.materials} filterKey="material" />}
    </div>
  );
}