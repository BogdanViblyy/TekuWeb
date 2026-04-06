// components/CheckoutButton.tsx
'use client';

import { useFormStatus } from 'react-dom';
import { placeOrder } from '@/app/actions';
import toast from 'react-hot-toast';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

function SubmitButton({ text, loadingText }: { text: string, loadingText: string }) {
    const { pending } = useFormStatus();
    return (
        <button type="submit" disabled={pending} className="block text-center w-full bg-black text-white mt-6 py-3 rounded-md hover:bg-gray-800 transition disabled:bg-gray-500">
            {pending ? loadingText : text}
        </button>
    );
}

export default function CheckoutButton() {
    const router = useRouter();
    const tCart = useTranslations('cart');

    const handlePlaceOrder = async () => {
        toast.loading(tCart('placing'));
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
            <SubmitButton text={tCart('placeOrder')} loadingText={tCart('placing')} />
        </form>
    );
}