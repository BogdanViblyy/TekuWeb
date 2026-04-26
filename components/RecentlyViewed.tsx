'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import { fetchRecentlyViewedProducts } from '@/app/actions';
import { useTranslations, useLocale } from 'next-intl';

interface RecentlyViewedProps {
  currentProductId?: number;
}

export default function RecentlyViewed({ currentProductId }: RecentlyViewedProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('common');
  const locale = useLocale();

  useEffect(() => {
    try {
        const stored = localStorage.getItem('recentlyViewed');
        let viewedIds: number[] = stored ? JSON.parse(stored) : [];

        if (currentProductId && !isNaN(currentProductId)) {
            viewedIds = viewedIds.filter(id => id !== currentProductId);
            viewedIds.unshift(currentProductId);
            viewedIds = viewedIds.slice(0, 10);
            localStorage.setItem('recentlyViewed', JSON.stringify(viewedIds));
        }

        const idsToFetch = viewedIds.slice(0, 5);

        if (idsToFetch.length === 0) {
            setLoading(false);
            return;
        }

        fetchRecentlyViewedProducts(idsToFetch, locale).then(fetchedProducts => {
            setProducts(fetchedProducts);
            setLoading(false);
        }).catch(err => {
            console.error("Failed to fetch recently viewed", err);
            setLoading(false);
        });
    } catch (err) {
        console.error("Error accessing localStorage", err);
        setLoading(false);
    }
  }, [currentProductId]);

  if (loading || products.length === 0) {
    return null;
  }

  return (
    <div className="py-12 mt-12 border-t border-gray-200">
      <h2 className="text-2xl font-bold mb-6">{t('recentlyViewed')}</h2>
      <div className="flex overflow-x-auto snap-x space-x-6 pb-4 hide-scrollbar">
        {products.map(product => (
          <div key={product.itemId} className="snap-start flex-none w-64">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
