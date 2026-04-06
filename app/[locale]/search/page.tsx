// app/search/page.tsx
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { getCategoriesByAudience, searchProducts } from '@/lib/data';
import { Suspense } from 'react';
import ProductCard from '@/components/ProductCard';

export const metadata: Metadata = {
    title: 'Search — TEKU',
    description: 'Search for clothing, brands, and categories at TEKU.',
};

// Определяем аудитории как константу
const audiences = ['WOMEN', 'MEN', 'KIDS'];

// Компонент результатов поиска
async function SearchResults({ query }: { query: string }) {
    const results = await searchProducts(query);
    const tSearch = await getTranslations('search');
    const tCommon = await getTranslations('common');

    if (results.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 text-lg">{tSearch('noResults')} &ldquo;{query}&rdquo;</p>
                <p className="text-gray-400 mt-2">{tSearch('tryDifferent')}</p>
            </div>
        );
    }

    return (
        <div>
            <p className="text-gray-500 mb-6">{results.length} {results.length !== 1 ? tCommon('items') : tCommon('item')} {tSearch('resultsFor')} &ldquo;{query}&rdquo;</p>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((product) => (
                    <ProductCard key={product.itemId} product={product} />
                ))}
            </div>
        </div>
    );
}

// Выносим основное содержимое в отдельный компонент, чтобы использовать Suspense для категорий
async function SearchContent({ selectedAudience }: { selectedAudience: string }) {
    const categories = await getCategoriesByAudience(selectedAudience);
    const tSearch = await getTranslations('search');
    const tNav = await getTranslations('nav');
    const audienceStr = tNav(selectedAudience.toLowerCase() as any);

    return (
        <div className="mt-6">
            {categories.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                    <li>
                        <Link
                            href={`/products/${selectedAudience.toLowerCase()}`}
                            className="flex items-center justify-between py-4 px-2 -mx-2 rounded-md hover:bg-gray-100 transition-colors"
                        >
                            <span className="text-lg font-bold">{tSearch('allAudiences')} {audienceStr}</span>
                            <span className="text-gray-400">→</span>
                        </Link>
                    </li>
                    {categories.map((category) => (
                        <li key={category}>
                            <Link
                                href={`/products/${selectedAudience.toLowerCase()}/${category.toLowerCase().replace(/ /g, '-')}`}
                                className="flex items-center justify-between py-4 px-2 -mx-2 rounded-md hover:bg-gray-100 transition-colors"
                            >
                                <span className="text-lg">{category}</span>
                                <span className="text-gray-400">→</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500 mt-8 text-center">No categories found for this audience.</p>
            )}
        </div>
    );
}

// Компонент-заглушка на время загрузки
function CategoriesSkeleton() {
    return (
        <div className="mt-6 animate-pulse">
            <ul className="divide-y divide-gray-200">
                {[...Array(5)].map((_, i) => (
                    <li key={i} className="py-4">
                        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    </li>
                ))}
            </ul>
        </div>
    );
}


export default async function SearchPage({
    searchParams,
}: {
    searchParams?: Promise<{ audience?: string; q?: string }>;
}) {
    const resolvedSearchParams = searchParams ? await searchParams : {};
    const query = resolvedSearchParams?.q?.trim() || '';

    const tSearch = await getTranslations('search');
    const tNav = await getTranslations('nav');

    // If there's a text query, show search results
    if (query.length >= 2) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <h1 className="text-4xl font-bold mb-6 text-gray-900">{tSearch('title')}</h1>
                <Suspense fallback={<CategoriesSkeleton />}>
                    <SearchResults query={query} />
                </Suspense>
            </div>
        );
    }

    // Otherwise, show audience/category browser
    const selectedAudience = resolvedSearchParams?.audience && audiences.includes(resolvedSearchParams.audience.toUpperCase())
        ? resolvedSearchParams.audience.toUpperCase()
        : 'WOMEN';

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-4xl font-bold mb-6 text-gray-900">{tSearch('title')}</h1>

            {/* Панель выбора аудитории */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {audiences.map((audience) => (
                        <Link
                            key={audience}
                            href={`/search?audience=${audience}`}
                            scroll={false}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-md transition-colors
                                ${selectedAudience === audience
                                    ? 'border-black text-black'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }
                            `}
                        >
                            {tNav(audience.toLowerCase() as any)}
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Suspense для асинхронного компонента списка категорий */}
            <Suspense fallback={<CategoriesSkeleton />}>
                <SearchContent selectedAudience={selectedAudience} />
            </Suspense>
        </div>
    );
}