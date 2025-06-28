// components/ProductList.tsx
'use client';

import { useState, useEffect, useTransition } from 'react';
import { useInView } from 'react-intersection-observer';
import { Product } from '@/types';
import { loadMoreProducts } from '@/app/actions';
import ProductCard from './ProductCard';
import { Spinner } from './Spinner';

interface ProductListProps {
  initialProducts: Product[];
  initialHasMore: boolean;
  audience: string;
  filters: {
    categoryName?: string;
    size?: string;
    brand?: string;
    material?: string;
    color?: string;
  };
}

export default function ProductList({ initialProducts, initialHasMore, audience, filters }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(2);
  const [isPending, startTransition] = useTransition();
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  });

  useEffect(() => {
    // Запускаем подгрузку, только если нет уже идущего запроса
    if (inView && hasMore && !isPending) {
      startTransition(() => {
        loadMoreProducts(audience, filters, page).then(res => {
          if (res.products.length > 0) {
            setProducts(prev => [...prev, ...res.products]);
            setPage(prev => prev + 1);
            setHasMore(res.hasMore);
          } else {
            setHasMore(false);
          }
        });
      });
    }
  }, [inView, hasMore, isPending, page, audience, filters]);
  
  // При смене фильтров сбрасываем состояние
  useEffect(() => {
    setProducts(initialProducts);
    setHasMore(initialHasMore);
    setPage(2);
  }, [initialProducts, initialHasMore]);

  return (
    <div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
                <ProductCard key={`${product.itemId}-${page}`} product={product} />
            ))}
        </div>

        {hasMore && (
            <div ref={ref} className="flex justify-center items-center py-8">
                {isPending && <Spinner />}
            </div>
        )}
    </div>
  );
}