// app/actions/cart.ts
'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Decimal } from '@prisma/client/runtime/library';
import prisma from '@/lib/prisma';
import { CartItem } from '@/types';
import { formatImageUrl } from '@/lib/utils';
import { getSession } from './auth';

// --- Cart Actions ---

export async function getCart(): Promise<{ cartId: number | null, items: CartItem[] }> {
    const user = await getSession();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma deeply nested include makes typing impractical
    let cart: any = null;

    const includePayload = {
        order_products: {
            include: {
                products: {
                    include: {
                        shop_items: { include: { categories: true } },
                        colors: true,
                        sizes: true,
                    }
                }
            }
        }
    };

    if (user) {
        cart = await prisma.orders.findFirst({
            where: { user_id: user.id, order_status: 'CART' },
            include: includePayload
        });
    } else {
        const cookieStore = await cookies();
        const guestCartId = parseInt(cookieStore.get('guestCartId')?.value || '0', 10);
        if (guestCartId) {
            cart = await prisma.orders.findFirst({
                where: { order_id: guestCartId, user_id: null, order_status: 'CART' },
                include: includePayload
            });
        }
    }

    if (!cart) {
        return { cartId: null, items: [] };
    }

    const items: CartItem[] = cart.order_products.map((op: any) => ({
        orderProductId: op.id,
        shopItemId: op.products.item_id,
        productName: op.products.shop_items.item_name || '',
        quantity: op.quantity,
        priceAtPurchase: (op.price_at_purchase as unknown as Decimal).toNumber(),
        discountOnUnit: op.discount_on_unit ? (op.discount_on_unit as unknown as Decimal).toNumber() : null,
        colorName: op.products.colors?.color_name || 'N/A',
        sizeName: op.products.sizes?.size_name || 'N/A',
        imageURL: formatImageUrl(op.products.shop_items.item_image),
        productVariantId: op.products_id,
        availableStock: op.products.product_quantity,
        productCategoryName: op.products.shop_items.categories?.category_name || ''
    }));

    return { cartId: cart.order_id, items };
}


async function findOrCreateCartForCurrentUser(): Promise<number> {
    const user = await getSession();

    if (user) {
        const existingCart = await prisma.orders.findFirst({ where: { user_id: user.id, order_status: 'CART' } });
        if (existingCart) return existingCart.order_id;
        const newCart = await prisma.orders.create({ data: { user_id: user.id, order_status: 'CART' } });
        return newCart.order_id;
    } else {
        const cookieStore = await cookies();
        const guestCartId = parseInt(cookieStore.get('guestCartId')?.value || '0', 10);
        if (guestCartId) {
            const existingGuestCart = await prisma.orders.findFirst({ where: { order_id: guestCartId, user_id: null, order_status: 'CART' } });
            if (existingGuestCart) return existingGuestCart.order_id;
        }
        const newGuestCart = await prisma.orders.create({ data: { user_id: null, order_status: 'CART' } });
        cookieStore.set('guestCartId', String(newGuestCart.order_id), { maxAge: 30 * 24 * 60 * 60, path: '/' });
        return newGuestCart.order_id;
    }
}

export async function addToCart(shopItemId: number, quantity: number, colorName: string, sizeName: string) {
    const cartOrderId = await findOrCreateCartForCurrentUser();

    const variant = await prisma.products.findFirst({
        where: { item_id: shopItemId, colors: { color_name: colorName }, sizes: { size_name: sizeName } },
        include: { shop_items: true }
    });

    if (!variant) throw new Error("Product variant not found.");
    if (!variant.shop_items) throw new Error("Product shop item not found.");

    await prisma.order_products.upsert({
        where: { order_id_products_id: { order_id: cartOrderId, products_id: variant.id } },
        update: { quantity: { increment: quantity } },
        create: {
            order_id: cartOrderId,
            products_id: variant.id,
            quantity: quantity,
            price_at_purchase: variant.shop_items.item_price,
            discount_on_unit: variant.shop_items.item_discount,
        }
    });

    revalidatePath('/cart');
    return { success: true, message: 'Item added to your bag!' };
}


export async function updateItemQuantity(orderProductId: number, newQuantity: number) {
    if (newQuantity <= 0) {
        await prisma.order_products.delete({ where: { id: orderProductId } });
    } else {
        await prisma.order_products.update({
            where: { id: orderProductId },
            data: { quantity: newQuantity }
        });
    }
    revalidatePath('/cart');
    return { success: true };
}

export async function removeFromCart(orderProductId: number) {
    await prisma.order_products.delete({ where: { id: orderProductId } });
    revalidatePath('/cart');
    return { success: true };
}


export async function mergeGuestCartToUser(guestCartId: number, userId: number) {
    const userCart = await prisma.orders.findFirst({ where: { user_id: userId, order_status: 'CART' } });
    const userCartId = userCart ? userCart.order_id : (await prisma.orders.create({ data: { user_id: userId, order_status: 'CART' } })).order_id;

    if (guestCartId === userCartId) return;

    const guestItems = await prisma.order_products.findMany({ where: { order_id: guestCartId } });

    for (const guestItem of guestItems) {
        await prisma.order_products.upsert({
            where: { order_id_products_id: { order_id: userCartId, products_id: guestItem.products_id } },
            update: { quantity: { increment: guestItem.quantity } },
            create: { ...guestItem, order_id: userCartId, id: undefined }
        });
    }

    await prisma.orders.update({ where: { order_id: guestCartId }, data: { order_status: 'MERGED' } });
}
