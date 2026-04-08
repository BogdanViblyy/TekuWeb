// components/CheckoutButton.tsx
'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function CheckoutButton() {
    const tCart = useTranslations('cart');

    return (
        <Link
            href="/checkout"
            id="checkout-link"
            className="block text-center w-full bg-black text-white mt-6 py-3 rounded-md hover:bg-gray-800 transition font-semibold"
        >
            {tCart('placeOrder')}
        </Link>
    );
}