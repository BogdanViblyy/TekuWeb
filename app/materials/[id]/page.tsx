import type { Metadata } from 'next';
import { getProductsByMaterial } from '@/lib/data';
import { notFound } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const { material } = await getProductsByMaterial(parseInt(id, 10));
    if (!material) return { title: 'Material Not Found — TEKU' };
    return {
        title: `${material.materialName} — TEKU`,
        description: `Shop ${material.materialName} clothing at TEKU.`,
    };
}

export default async function MaterialDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const materialId = parseInt(id, 10);
    if (isNaN(materialId)) notFound();

    const { material, products } = await getProductsByMaterial(materialId);
    if (!material) notFound();

    return (
        <div className="container mx-auto max-w-6xl px-4 py-12 pt-[calc(var(--header-total-height)+3rem)]">
            <Link href="/materials" className="text-sm text-gray-500 hover:text-black mb-4 inline-block">← All Materials</Link>
            <h1 className="text-4xl font-bold mb-2">{material.materialName}</h1>
            <p className="text-sm text-gray-500 mb-6">{products.length} product{products.length !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                    <ProductCard key={product.itemId} product={product} />
                ))}
            </div>
        </div>
    );
}
