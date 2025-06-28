// components/CheckoutButton.tsx
'use client';

import { useFormStatus } from 'react-dom';
import { placeOrder } from '@/app/actions';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button type="submit" disabled={pending} className="block text-center w-full bg-black text-white mt-6 py-3 rounded-md hover:bg-gray-800 transition disabled:bg-gray-500">
            {pending ? 'Placing Order...' : 'Place Order'}
        </button>
    );
}

export default function CheckoutButton() {
    const router = useRouter();

    const handlePlaceOrder = async () => {
        toast.loading('Placing your order...');
        const result = await placeOrder();
        toast.dismiss();

        if (result.success) {
            toast.success(result.message);
            // Вместо router.push, мы можем использовать window.location для полной перезагрузки
            // и сброса всех состояний, если revalidatePath не сработал как надо.
            window.location.href = '/profile/orders';
        } else {
            toast.error(result.message);
        }
    };
    
    return (
        <form action={handlePlaceOrder}>
            <SubmitButton />
        </form>
    );
}