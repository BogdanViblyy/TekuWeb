// app/product/[id]/page.tsx
import type { Metadata } from 'next';
import AddToCartButton from '@/components/AddToCartButton';
import ImageGallery from '@/components/ImageGallery';
import RecentlyViewed from '@/components/RecentlyViewed';
import { getProductDetails } from '@/lib/data';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const product = await getProductDetails(parseInt(id, 10));
    if (!product) return { title: 'Product Not Found — TEKU' };
    return {
        title: `${product.name} — TEKU`,
        description: product.description || `Shop ${product.name} at TEKU.`,
    };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
        notFound();
    }

    const product = await getProductDetails(productId);

    if (!product) {
        notFound();
    }

    const discountedPrice = product.price - (product.discount || 0);
    const hasRealDiscount = typeof product.discount === 'number' && product.discount > 0;

    return (
        <div className="container mx-auto px-4 py-8 pt-[calc(var(--header-total-height)+3rem)]">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
                <ImageGallery
                    images={product.imageURLs}
                    productName={product.name}
                    categoryName={product.productCategoryName}
                />
                <div className="flex flex-col space-y-4 pt-8">
                    <h2 className="text-sm uppercase text-gray-500">{product.brandName}</h2>
                    <h1 className="text-3xl lg:text-4xl font-bold">{product.name}</h1>
                    <div className="flex items-baseline space-x-2">
                        <p className={`text-2xl font-bold ${hasRealDiscount ? 'text-red-600' : 'text-gray-900'}`}>
                            ${discountedPrice.toFixed(2)}
                        </p>
                        {hasRealDiscount && (
                            <p className="text-lg text-gray-400 line-through">
                                ${product.price.toFixed(2)}
                            </p>
                        )}
                    </div>
                    <div className="border-t pt-4">
                        <p className="text-gray-600">{product.description}</p>
                    </div>
                    <AddToCartButton product={product} />
                </div>
            </div>
            <RecentlyViewed currentProductId={product.itemId} />
        </div>
    );
}