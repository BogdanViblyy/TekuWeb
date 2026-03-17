import type { Metadata } from 'next';
import { getWishlist } from '@/app/actions/wishlist';
import { getSession } from '@/app/actions/auth';
import prisma from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { formatImageUrl } from '@/lib/utils';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
    title: 'Wishlist — TEKU',
    description: 'Your saved items at TEKU.',
};

export default async function WishlistPage() {
    const user = await getSession();
    if (!user) redirect('/auth/login');

    const wishlistItemIds = await getWishlist();

    if (wishlistItemIds.length === 0) {
        return (
            <div className="container mx-auto max-w-4xl px-4 py-12 pt-[calc(var(--header-total-height)+3rem)]">
                <h1 className="text-4xl font-bold mb-6">Wishlist</h1>
                <p className="text-gray-500 text-center py-12">Your wishlist is empty.</p>
                <div className="text-center">
                    <Link href="/search" className="text-black font-medium underline hover:no-underline">
                        Browse products
                    </Link>
                </div>
            </div>
        );
    }

    const items = await prisma.shop_items.findMany({
        where: { item_id: { in: wishlistItemIds } },
        include: { brands: true, categories: true },
        orderBy: { item_id: 'asc' },
    });

    const products = items.map((item) => ({
        itemId: item.item_id,
        name: item.item_name || 'No Name',
        brandName: item.brands?.brand_name || null,
        description: item.item_description,
        price: (item.item_price as unknown as Decimal).toNumber(),
        discount: item.item_discount ? (item.item_discount as unknown as Decimal).toNumber() : null,
        imageURL: formatImageUrl(item.item_image),
        productCategoryName: item.categories?.category_name || 'Uncategorized',
    }));

    return (
        <div className="container mx-auto max-w-6xl px-4 py-12 pt-[calc(var(--header-total-height)+3rem)]">
            <h1 className="text-4xl font-bold mb-2">Wishlist</h1>
            <p className="text-sm text-gray-500 mb-8">{products.length} saved item{products.length !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                    <ProductCard key={product.itemId} product={product} isInWishlist={true} />
                ))}
            </div>
        </div>
    );
}
