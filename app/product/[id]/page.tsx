// app/product/[id]/page.tsx
import Image from 'next/image';
import AddToCartButton from '@/components/AddToCartButton';
import { getDefaultImageUrl } from '@/lib/utils';
import { getProductDetails } from '@/lib/data';
import { notFound } from 'next/navigation';
import { ShopItemDetails } from '@/types';

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
    const productId = parseInt(params.id, 10);
    if (isNaN(productId)) {
        notFound();
    }
    
    const product = await getProductDetails(productId);

    if (!product) {
        notFound();
    }

    const discountedPrice = product.price - (product.discount || 0);
    // Проверяем, есть ли реальная, значащая скидка
    const hasRealDiscount = typeof product.discount === 'number' && product.discount > 0;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
                <div className="relative w-full aspect-square bg-white-100 rounded-lg overflow-hidden border">
                    <Image 
                        src={product.imageURL || getDefaultImageUrl(product.productCategoryName)} 
                        alt={product.name || 'Product Image'} 
                        fill 
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-contain p-4"
                    />
                </div>
                <div className="flex flex-col space-y-4 pt-8">
                    <h2 className="text-sm uppercase text-gray-500">{product.brandName}</h2>
                    <h1 className="text-3xl lg:text-4xl font-bold">{product.name}</h1>
                    <div className="flex items-baseline space-x-2">
                        <p className={`text-2xl font-bold ${hasRealDiscount ? 'text-red-600' : 'text-gray-900'}`}>
                            ${discountedPrice.toFixed(2)}
                        </p>
                        {/* Отображаем старую цену только если есть реальная скидка */}
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
        </div>
    );
}