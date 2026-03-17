import type { Metadata } from 'next';
import { getProductsByBrand } from '@/lib/data';
import { notFound } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const { brand } = await getProductsByBrand(parseInt(id, 10));
    if (!brand) return { title: 'Brand Not Found — TEKU' };
    return {
        title: `${brand.brandName} — TEKU`,
        description: `Shop ${brand.brandName} products at TEKU.`,
    };
}

export default async function BrandDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const brandId = parseInt(id, 10);
    if (isNaN(brandId)) notFound();

    const { brand, products } = await getProductsByBrand(brandId);
    if (!brand) notFound();

    return (
        <div className="container mx-auto max-w-6xl px-4 py-12 pt-[calc(var(--header-total-height)+3rem)]">
            <Link href="/brands" className="text-sm text-gray-500 hover:text-black mb-4 inline-block">← All Brands</Link>
            <h1 className="text-4xl font-bold mb-2">{brand.brandName}</h1>
            {brand.description && <p className="text-gray-600 mb-8">{brand.description}</p>}
            <p className="text-sm text-gray-500 mb-6">{products.length} product{products.length !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                    <ProductCard key={product.itemId} product={product} />
                ))}
            </div>
        </div>
    );
}
