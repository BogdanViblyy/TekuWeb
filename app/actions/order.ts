// app/actions/order.ts
'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getSession } from './auth';

// --- Order Actions ---

export async function placeOrder(): Promise<{ success: boolean; message: string; }> {
    const user = await getSession();
    if (!user) return { success: false, message: 'You must be logged in to place an order.' };

    const cart = await prisma.orders.findFirst({
        where: { user_id: user.id, order_status: 'CART' },
        include: { order_products: { include: { products: { include: { shop_items: true } } } } }
    });

    if (!cart || cart.order_products.length === 0) {
        return { success: false, message: "Your cart is empty." };
    }

    try {
        await prisma.$transaction(async (tx) => {
            const itemsInCart = cart.order_products;
            for (const item of itemsInCart) {
                const product = item.products;
                if (product.product_quantity !== null && item.quantity > product.product_quantity) {
                    throw new Error(`Not enough stock for ${product.shop_items.item_name}.`);
                }
            }

            for (const item of itemsInCart) {
                if (item.products.product_quantity !== null) {
                    await tx.products.update({
                        where: { id: item.products_id },
                        data: { product_quantity: { decrement: item.quantity } }
                    });
                }
            }

            await tx.orders.update({
                where: { order_id: cart.order_id },
                data: {
                    order_status: 'PLACED',
                    order_code: `ORD-${Date.now()}-${user.id}`,
                    order_time: new Date()
                }
            });
        });

        revalidatePath('/cart');
        revalidatePath('/profile/orders');
        return { success: true, message: 'Order placed successfully!' };

    } catch (error: any) {
        return { success: false, message: error.message || "An unexpected error occurred." };
    }
}
