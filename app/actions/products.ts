// app/actions/products.ts
'use server';

import { getProducts } from '@/lib/data';
import { Product } from '@/types';

// --- Product Actions ---

export async function loadMoreProducts(
    audience: string,
    filters: {
        categoryName?: string;
        size?: string;
        brand?: string;
        material?: string;
        color?: string;
    },
    page: number
): Promise<{ products: Product[]; hasMore: boolean }> {
    const result = await getProducts(audience, filters, page);
    return result;
}
