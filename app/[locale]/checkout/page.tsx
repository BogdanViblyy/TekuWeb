// app/[locale]/checkout/page.tsx
import { getSession, getCart } from '@/app/actions';
import { redirect } from 'next/navigation';
import CheckoutForm from '@/components/CheckoutForm';

export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
    const user = await getSession();
    if (!user) {
        redirect('/auth/login');
    }

    const { items: cartItems } = await getCart();
    if (!cartItems || cartItems.length === 0) {
        redirect('/cart');
    }

    return <CheckoutForm cartItems={cartItems} />;
}
