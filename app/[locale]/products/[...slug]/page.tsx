// app/products/[...slug]/page.tsx
import { Link } from '@/i18n/navigation';
import type { Metadata } from 'next';
import { getProducts, getAvailableFilters } from '@/lib/data';
import ProductFilters from '@/components/ProductFilters';
import ProductList from '@/components/ProductList';
import SortSelect from '@/components/SortSelect';
import ProductsGrid from '@/components/ProductsGrid';
import { getTranslations, getLocale } from 'next-intl/server';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const [audience, categorySlug] = slug || [];
  const category = categorySlug ? categorySlug.replace(/-/g, ' ') : null;
  const audienceLabel = audience ? audience.charAt(0).toUpperCase() + audience.slice(1) : '';
  const title = category
    ? `${category} — ${audienceLabel} — TEKU`
    : `${audienceLabel} — TEKU`;
  return {
    title,
    description: `Shop ${category || audienceLabel} clothing at TEKU.`,
  };
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string[] }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const [audience, categorySlug] = slug || [];

  if (!audience) {
    const tProducts = await getTranslations('products');
    const tErrors = await getTranslations('errors');
    return (
      <div className="container mx-auto text-center py-20">
        <h1 className="text-2xl font-bold">{tProducts('invalidUrl')}</h1>
        <p className="text-gray-600">{tProducts('selectAudience')}</p>
        <Link href="/search" className="mt-4 inline-block bg-black text-white px-6 py-2 rounded">
          {tProducts('goToSearch')}
        </Link>
      </div>
    );
  }

  const categoryName = categorySlug ? categorySlug.replace(/-/g, ' ') : undefined;

  const parseArray = (val: string | string[] | undefined): string[] | undefined => {
      if (!val) return undefined;
      return Array.isArray(val) ? val : [val];
  };

  const minPriceParam = resolvedSearchParams?.minPrice as string;
  const maxPriceParam = resolvedSearchParams?.maxPrice as string;
  const minPrice = minPriceParam ? parseFloat(minPriceParam) : undefined;
  const maxPrice = maxPriceParam ? parseFloat(maxPriceParam) : undefined;
  
  const sort = resolvedSearchParams?.sort as string | undefined;

  const filters = {
    categoryName,
    size: parseArray(resolvedSearchParams?.size),
    brand: parseArray(resolvedSearchParams?.brand),
    material: parseArray(resolvedSearchParams?.material),
    color: parseArray(resolvedSearchParams?.color),
    minPrice,
    maxPrice,
    onSale: resolvedSearchParams?.onSale === 'true',
    inStock: resolvedSearchParams?.inStock === 'true'
  }

  const locale = await getLocale();

  // Load first page of products and filters
  const [{ products: initialProducts, hasMore, filteredMinPrice, filteredMaxPrice }, availableFilters] = await Promise.all([
    getProducts(audience.toUpperCase(), filters, 1, sort, locale),
    getAvailableFilters(audience.toUpperCase(), categoryName)
  ]);

  // Use contextual filtered min/max price for the slider boundaries
  availableFilters.minPrice = filteredMinPrice;
  availableFilters.maxPrice = filteredMaxPrice;

  const tProducts = await getTranslations('products');
  const tNav = await getTranslations('nav');
  const audienceLabel = tNav(audience.toLowerCase() as any);

  // Need to import SortSelect at the top!
  return (
    <div className="container mx-auto px-4 py-8 pt-[calc(var(--header-total-height)+3rem)]">
      <div className="mb-8 flex flex-col md:flex-row justify-between md:items-end space-y-4 md:space-y-0">
        <div>
           <h1 className="text-4xl font-bold capitalize">{categoryName || `${tProducts('allAudience', { audience: audienceLabel })}`}</h1>
           <p className="text-gray-500">{initialProducts.length > 0 ? tProducts('showingResults') : tProducts('noProducts')}</p>
        </div>
        
        {/* Sort Select */}
        {initialProducts.length > 0 && <SortSelect />}
      </div>

      <ProductsGrid>
        <ProductFilters filters={availableFilters} />
        <div>
          {initialProducts.length > 0 ? (
            <ProductList
              initialProducts={initialProducts}
              initialHasMore={hasMore}
              audience={audience.toUpperCase()}
              filters={filters}
              sort={sort}
            />
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-gray-600">{tProducts('noMatchingProducts')}</p>
            </div>
          )}
        </div>
      </ProductsGrid>
    </div>
  );
}