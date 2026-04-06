import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { getAllColors } from '@/lib/data';

export const metadata: Metadata = {
    title: 'All Colors — TEKU',
    description: 'Browse all clothing colors available at TEKU.',
};

export default async function ColorsPage() {
    const colors = await getAllColors();
    const tBrowse = await getTranslations('browse');
    const tCommon = await getTranslations('common');

    return (
        <div className="container mx-auto max-w-4xl px-4 py-12 pt-[calc(var(--header-total-height)+3rem)]">
            <h1 className="text-4xl font-bold mb-8">{tBrowse('colors')}</h1>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {colors.map((color) => (
                    <Link
                        key={color.colorId}
                        href={`/colors/${color.colorId}`}
                        className="group border rounded-lg p-5 hover:border-black hover:shadow-sm transition-all flex items-center gap-3"
                    >
                        {color.colorRgb && (
                            <div
                                className="w-8 h-8 rounded-full border border-gray-300 flex-shrink-0"
                                style={{ backgroundColor: color.colorRgb }}
                            />
                        )}
                        <div>
                            <h2 className="text-md font-semibold group-hover:underline">{color.colorName}</h2>
                            <p className="text-xs text-gray-500">{color.productCount} {color.productCount !== 1 ? tCommon('products') : tCommon('product')}</p>
                        </div>
                    </Link>
                ))}
            </div>
            {colors.length === 0 && (
                <p className="text-gray-500 text-center py-12">{tBrowse('noColors')}</p>
            )}
        </div>
    );
}
