import { Link } from '@/i18n/navigation';
import { getTranslations, getLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { getAllMaterials } from '@/lib/data';

export const metadata: Metadata = {
    title: 'All Materials — TEKU',
    description: 'Browse all clothing materials available at TEKU.',
};

export default async function MaterialsPage() {
    const locale = await getLocale();
    const materials = await getAllMaterials(locale);
    const tBrowse = await getTranslations('browse');
    const tCommon = await getTranslations('common');

    return (
        <div className="container mx-auto max-w-4xl px-4 py-12 pt-[calc(var(--header-total-height)+3rem)]">
            <h1 className="text-4xl font-bold mb-8">{tBrowse('materials')}</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {materials.map((material) => (
                    <Link
                        key={material.materialId}
                        href={`/materials/${material.materialId}`}
                        className="group border rounded-lg p-6 hover:border-black hover:shadow-sm transition-all"
                    >
                        <h2 className="text-lg font-semibold group-hover:underline">{material.materialName}</h2>
                        <p className="text-sm text-gray-500 mt-1">{material.productCount} {material.productCount !== 1 ? tCommon('products') : tCommon('product')}</p>
                    </Link>
                ))}
            </div>
            {materials.length === 0 && (
                <p className="text-gray-500 text-center py-12">{tBrowse('noMaterials')}</p>
            )}
        </div>
    );
}
