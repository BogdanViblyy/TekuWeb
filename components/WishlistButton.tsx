// components/WishlistButton.tsx
'use client';

import { useState, useTransition } from 'react';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { toggleWishlistItem } from '@/app/actions/wishlist';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

interface WishlistButtonProps {
    itemId: number;
    isInWishlist: boolean;
    className?: string;
}

export default function WishlistButton({ itemId, isInWishlist, className = '' }: WishlistButtonProps) {
    const [wishlisted, setWishlisted] = useState(isInWishlist);
    const [isPending, startTransition] = useTransition();
    const { user } = useAuth();

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent Link click on ProductCard
        e.stopPropagation();

        if (!user) {
            toast.error('Log in to save items to your wishlist.');
            return;
        }

        startTransition(async () => {
            try {
                const result = await toggleWishlistItem(itemId);
                setWishlisted(result.added);
                toast.success(result.added ? 'Added to wishlist!' : 'Removed from wishlist.');
            } catch {
                toast.error('Something went wrong.');
            }
        });
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className={`p-1.5 rounded-full transition hover:scale-110 ${className}`}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
            {wishlisted ? (
                <HeartSolidIcon className="w-5 h-5 text-red-500" />
            ) : (
                <HeartIcon className="w-5 h-5 text-gray-400 hover:text-red-400" />
            )}
        </button>
    );
}
