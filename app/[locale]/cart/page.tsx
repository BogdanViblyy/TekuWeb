// app/cart/page.tsx
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { getCart } from '@/app/actions';
import CartActions from '@/components/CartActions';
import CheckoutButton from '@/components/CheckoutButton';
import { getDefaultImageUrl } from '@/lib/utils';
import RecentlyViewed from '@/components/RecentlyViewed';

export const dynamic = 'force-dynamic';

export default async function CartPage() {
    const { items: cartItems } = await getCart();
    const tCart = await getTranslations('cart');

    if (!cartItems || cartItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8 pt-[calc(var(--header-total-height)+3rem)]">
                <div className="py-12 text-center">
                    <h1 className="text-4xl font-bold mb-4">{tCart('title')}</h1>
                    <p className="text-gray-600 mb-8">{tCart('empty')}</p>
                    <Link href="/search" className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition">
                        Continue Shopping
                    </Link>
                </div>
                <RecentlyViewed />
            </div>
        );
    }

    const totalPrice = cartItems.reduce((total, item) => {
        const price = item.priceAtPurchase - (item.discountOnUnit || 0);
        return total + (price * item.quantity);
    }, 0);

    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <div className="container mx-auto px-4 py-8 pt-[calc(var(--header-total-height)+3rem)]">
            <h1 className="text-3xl font-bold mb-6">{tCart('title')} ({totalItems})</h1>
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    {cartItems.map(item => (
                        <div key={item.orderProductId} className="flex items-start space-x-4 p-4 border rounded-lg">
                            <div className="w-24 h-24 relative flex-shrink-0">
                                <Image 
                                    src={item.imageURL || getDefaultImageUrl(item.productCategoryName)} 
                                    alt={item.productName || 'Item'} 
                                    fill 
                                    style={{ objectFit: 'cover' }} 
                                    className="rounded-md" 
                                />
                            </div>
                            <div className="flex-grow">
                                <h2 className="font-semibold">{item.productName}</h2>
                                <p className="text-sm text-gray-500">Color: {item.colorName} | Size: {item.sizeName}</p>
                                <p className="text-sm font-medium mt-1">${(item.priceAtPurchase - (item.discountOnUnit || 0)).toFixed(2)}</p>
                                <CartActions item={item} />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="lg:col-span-1">
                    <div className="p-6 border rounded-lg bg-gray-50 sticky top-24">
                        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                        <div className="flex justify-between mb-2">
                            <span>Subtotal</span>
                            <span>${totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-4">
                            <span>Shipping</span>
                            <span>FREE</span>
                        </div>
                        <div className="border-t pt-4 flex justify-between font-bold text-lg">
                            <span>{tCart('total')}</span>
                            <span>${totalPrice.toFixed(2)}</span>
                        </div>
                        <CheckoutButton />
                    </div>
                </div>
            </div>
            <RecentlyViewed />
        </div>
    );
}