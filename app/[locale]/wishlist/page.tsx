import { getTranslations, getLocale } from 'next-intl/server';
import { getWishlist } from '@/app/actions';
import { getProductsByIds } from '@/lib/data';
import ProductCard from '@/components/ProductCard';
import { Link } from '@/i18n/navigation';
import RecentlyViewed from '@/components/RecentlyViewed';

export const dynamic = 'force-dynamic';

export default async function WishlistPage() {
    const wishlistIds = await getWishlist();
    const tWishlist = await getTranslations('wishlist');

    if (!wishlistIds || wishlistIds.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8 pt-[calc(var(--header-total-height)+3rem)]">
                <div className="py-12 text-center">
                    <h1 className="text-4xl font-bold mb-4">{tWishlist('title')}</h1>
                    <p className="text-gray-600 mb-8">{tWishlist('empty')}</p>
                    <Link href="/search" className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition">
                        {tWishlist('loginRequired') || 'Continue Shopping'}
                    </Link>
                </div>
                <RecentlyViewed />
            </div>
        );
    }

    const locale = await getLocale();
    const items = await getProductsByIds(wishlistIds, locale);

    return (
        <div className="container mx-auto px-4 py-8 pt-[calc(var(--header-total-height)+3rem)]">
            <h1 className="text-3xl font-bold mb-6">{tWishlist('title')} ({items.length})</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {items.map(product => (
                    <ProductCard key={product.itemId} product={product} isInWishlist={true} />
                ))}
            </div>
            <RecentlyViewed />
        </div>
    );
}
