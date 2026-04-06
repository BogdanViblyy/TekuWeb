import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { getAllBrands } from '@/lib/data';

export const metadata: Metadata = {
    title: 'All Brands — TEKU',
    description: 'Browse all clothing brands available at TEKU.',
};

export default async function BrandsPage() {
    const brands = await getAllBrands();
    const tBrowse = await getTranslations('browse');
    const tCommon = await getTranslations('common');

    return (
        <div className="container mx-auto max-w-4xl px-4 py-12 pt-[calc(var(--header-total-height)+3rem)]">
            <h1 className="text-4xl font-bold mb-8">{tBrowse('brands')}</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {brands.map((brand) => (
                    <Link
                        key={brand.brandId}
                        href={`/brands/${brand.brandId}`}
                        className="group border rounded-lg p-6 hover:border-black hover:shadow-sm transition-all"
                    >
                        <h2 className="text-lg font-semibold group-hover:underline">{brand.brandName}</h2>
                        <p className="text-sm text-gray-500 mt-1">{brand.productCount} {brand.productCount !== 1 ? tCommon('products') : tCommon('product')}</p>
                        {brand.description && (
                            <p className="text-sm text-gray-400 mt-2 line-clamp-2">{brand.description}</p>
                        )}
                    </Link>
                ))}
            </div>
            {brands.length === 0 && (
                <p className="text-gray-500 text-center py-12">{tBrowse('noBrands')}</p>
            )}
        </div>
    );
}
