// app/actions/wishlist.ts
'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSession } from './auth';

export async function getWishlist(): Promise<number[]> {
    const user = await getSession();
    if (!user) return [];

    const items = await prisma.wishlist.findMany({
        where: { user_id: user.id },
        select: { item_id: true },
        orderBy: { created_at: 'desc' },
    });

    return items.map((item) => item.item_id);
}

export async function toggleWishlistItem(itemId: number): Promise<{ added: boolean }> {
    const user = await getSession();
    if (!user) throw new Error('You must be logged in to use wishlist.');

    const existing = await prisma.wishlist.findUnique({
        where: { user_id_item_id: { user_id: user.id, item_id: itemId } },
    });

    if (existing) {
        await prisma.wishlist.delete({ where: { id: existing.id } });
        revalidatePath('/profile/wishlist');
        return { added: false };
    } else {
        await prisma.wishlist.create({ data: { user_id: user.id, item_id: itemId } });
        revalidatePath('/profile/wishlist');
        return { added: true };
    }
}
