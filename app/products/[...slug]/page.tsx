// app/products/[...slug]/page.tsx
import Link from 'next/link';
import { getProducts, getAvailableFilters } from '@/lib/data';
import ProductFilters from '@/components/ProductFilters';
import ProductList from '@/components/ProductList';

export const dynamic = 'force-dynamic';

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: { slug: string[] };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const [audience, categorySlug] = params.slug || [];

  if (!audience) {
      return (
          <div className="container mx-auto text-center py-20">
              <h1 className="text-2xl font-bold">Invalid URL</h1>
              <p className="text-gray-600">Please select an audience like "Men", "Women", or "Kids".</p>
              <Link href="/search" className="mt-4 inline-block bg-black text-white px-6 py-2 rounded">
                  Go to Search
              </Link>
          </div>
      );
  }
  
  const categoryName = categorySlug ? categorySlug.replace(/-/g, ' ') : undefined;
  
  const filters = {
    categoryName,
    size: searchParams?.size as string,
    brand: searchParams?.brand as string,
    material: searchParams?.material as string,
    color: searchParams?.color as string,
  }

  // Загружаем только первую страницу товаров и фильтры
  const [{ products: initialProducts, hasMore }, availableFilters] = await Promise.all([
    getProducts(audience.toUpperCase(), filters, 1),
    getAvailableFilters(audience.toUpperCase(), categoryName)
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold capitalize">{categoryName || `All ${audience}`}</h1>
        <p className="text-gray-500">{initialProducts.length > 0 ? 'Showing results...' : 'No products found'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="md:col-span-1">
          <ProductFilters filters={availableFilters} />
        </aside>
        <main className="md:col-span-3">
          {initialProducts.length > 0 ? (
            <ProductList 
              initialProducts={initialProducts} 
              initialHasMore={hasMore}
              audience={audience.toUpperCase()}
              filters={filters}
            />
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-gray-600">No products found matching your criteria.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}