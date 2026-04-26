// app/actions/products.ts
'use server';

import { getProducts } from '@/lib/data';
import { Product } from '@/types';

// --- Product Actions ---

export async function loadMoreProducts(
    audience: string,
    filters: {
        categoryName?: string;
        size?: string[];
        brand?: string[];
        material?: string[];
        color?: string[];
        minPrice?: number;
        maxPrice?: number;
        onSale?: boolean;
        inStock?: boolean;
    },
    page: number,
    sort?: string,
    locale: string = 'en'
): Promise<{ products: Product[]; hasMore: boolean }> {
    const result = await getProducts(audience, filters, page, sort, locale);
    return {
        products: result.products,
        hasMore: result.hasMore
    };
}

export async function fetchRecentlyViewedProducts(ids: number[], locale: string = 'en'): Promise<Product[]> {
    const { getProductsByIds } = await import('@/lib/data');
    return getProductsByIds(ids, locale);
}

