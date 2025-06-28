'use client';

import { useTransition } from 'react';
import { updateItemQuantity, removeFromCart } from '@/app/actions';
import { CartItem } from '@/types';

export default function CartActions({ item }: { item: CartItem }) {
    let [isPending, startTransition] = useTransition();

    const handleQuantityChange = (newQuantity: number) => {
        startTransition(() => {
            updateItemQuantity(item.orderProductId, newQuantity);
        });
    };

    const handleRemove = () => {
        startTransition(() => {
            removeFromCart(item.orderProductId);
        });
    };

    return (
        <div className="flex justify-between items-center mt-4">
            <div className="flex items-center">
                <button 
                    onClick={() => handleQuantityChange(item.quantity - 1)} 
                    disabled={isPending}
                    className="px-3 py-1 border rounded-l disabled:opacity-50"
                >
                    -
                </button>
                <span className="px-4 py-1 border-t border-b">{item.quantity}</span>
                <button 
                    onClick={() => handleQuantityChange(item.quantity + 1)} 
                    disabled={isPending || (item.availableStock !== null && item.quantity >= item.availableStock)}
                    className="px-3 py-1 border rounded-r disabled:opacity-50"
                >
                    +
                </button>
            </div>
            <button 
                onClick={handleRemove} 
                disabled={isPending}
                className="text-red-500 hover:text-red-700 text-sm font-medium disabled:opacity-50"
            >
                Remove
            </button>
        </div>
    );
}