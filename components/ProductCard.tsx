// components/ProductCard.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { getDefaultImageUrl } from '@/lib/utils';

export default function ProductCard({ product }: { product: Product }) {
    const discountedPrice = product.price - (product.discount || 0);
    const hasRealDiscount = typeof product.discount === 'number' && product.discount > 0;

    return (
      <Link href={`/product/${product.itemId}`} className="group">
        <div className="aspect-square w-full bg-white rounded-lg overflow-hidden relative border p-2">
          <Image
            src={product.imageURL || getDefaultImageUrl(product.productCategoryName)}
            alt={product.name || 'Product Image'}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-contain group-hover:opacity-80 transition-opacity"
          />
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-800">{product.brandName}</h3>
        <p className="text-sm text-gray-600 truncate">{product.name}</p>
        <div className="flex items-baseline space-x-2 mt-1">
            <p className={`text-md font-semibold ${hasRealDiscount ? 'text-red-600' : 'text-gray-900'}`}>
                ${discountedPrice.toFixed(2)}
            </p>
            {hasRealDiscount && (
                <p className="text-sm text-gray-400 line-through">
                    ${product.price.toFixed(2)}
                </p>
            )}
        </div>
      </Link>
    );
}