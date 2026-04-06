import type { Metadata } from 'next';
import { getProductsByColor } from '@/lib/data';
import { notFound } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const { color } = await getProductsByColor(parseInt(id, 10));
    if (!color) return { title: 'Color Not Found — TEKU' };
    return {
        title: `${color.colorName} — TEKU`,
        description: `Shop ${color.colorName} clothing at TEKU.`,
    };
}

export default async function ColorDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const colorId = parseInt(id, 10);
    if (isNaN(colorId)) notFound();

    const { color, products } = await getProductsByColor(colorId);
    if (!color) notFound();

    const tCommon = await getTranslations('common');
    const tBrowse = await getTranslations('browse');

    return (
        <div className="container mx-auto max-w-6xl px-4 py-12 pt-[calc(var(--header-total-height)+3rem)]">
            <Link href="/colors" className="text-sm text-gray-500 hover:text-black mb-4 inline-block">{tBrowse('allColorsLink')}</Link>
            <div className="flex items-center gap-3 mb-2">
                {color.colorRgb && (
                    <div
                        className="w-10 h-10 rounded-full border border-gray-300"
                        style={{ backgroundColor: color.colorRgb }}
                    />
                )}
                <h1 className="text-4xl font-bold">{color.colorName}</h1>
            </div>
            <p className="text-sm text-gray-500 mb-6">{products.length} {products.length !== 1 ? tCommon('products') : tCommon('product')}</p>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                    <ProductCard key={product.itemId} product={product} />
                ))}
            </div>
        </div>
    );
}
