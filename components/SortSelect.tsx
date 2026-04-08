'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { useTranslations } from 'next-intl';

export default function SortSelect() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    
    // We could use next-intl here if we had translations, sticking to simple labels for now
    const currentSort = searchParams.get('sort') || '';
    
    const handleSortChange = (value: string) => {
        const newParams = new URLSearchParams(searchParams.toString());
        if (value) {
            newParams.set('sort', value);
        } else {
            newParams.delete('sort');
        }
        startTransition(() => {
            router.push(`${pathname}?${newParams.toString()}`);
        });
    };

    return (
        <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-500 font-medium">Sort By:</label>
            <select
                value={currentSort}
                onChange={(e) => handleSortChange(e.target.value)}
                disabled={isPending}
                className="p-2 border rounded-md text-sm cursor-pointer outline-none focus:ring-1 focus:ring-black"
            >
                <option value="">Recommended</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A-Z</option>
                <option value="name_desc">Name: Z-A</option>
            </select>
        </div>
    );
}
