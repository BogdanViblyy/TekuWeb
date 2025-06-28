// app/search/page.tsx
import Link from 'next/link';
import { getCategoriesByAudience } from '@/lib/data';
import { Suspense } from 'react';

// Определяем аудитории как константу
const audiences = ['WOMEN', 'MEN', 'KIDS'];

// Выносим основное содержимое в отдельный компонент, чтобы использовать Suspense для категорий
async function SearchContent({ selectedAudience }: { selectedAudience: string }) {
    const categories = await getCategoriesByAudience(selectedAudience);

    return (
        <div className="mt-6">
            {categories.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                    {/* Ссылка на все товары для выбранной аудитории */}
                    <li>
                        <Link
                            href={`/products/${selectedAudience.toLowerCase()}`}
                            className="flex items-center justify-between py-4 px-2 -mx-2 rounded-md hover:bg-gray-100 transition-colors"
                        >
                            <span className="text-lg font-bold">All {selectedAudience.charAt(0) + selectedAudience.slice(1).toLowerCase()}</span>
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


export default function SearchPage({
    searchParams,
}: {
    searchParams?: { audience?: string };
}) {
    // Устанавливаем аудиторию по умолчанию, если параметр не задан
    const selectedAudience = searchParams?.audience && audiences.includes(searchParams.audience.toUpperCase())
        ? searchParams.audience.toUpperCase()
        : 'WOMEN';

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-4xl font-bold mb-6 text-gray-900">Search</h1>
            
            {/* Панель выбора аудитории */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {audiences.map((audience) => (
                        <Link
                            key={audience}
                            href={`/search?audience=${audience}`}
                            scroll={false} // Предотвращает скролл наверх при смене таба
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-md transition-colors
                                ${
                                    selectedAudience === audience
                                        ? 'border-black text-black'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }
                            `}
                        >
                            {audience.charAt(0) + audience.slice(1).toLowerCase()}
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