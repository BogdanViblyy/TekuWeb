// app/actions.ts
'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { jwtVerify, SignJWT, JWTPayload } from 'jose';
import * as bcrypt from 'bcryptjs';
import { Decimal } from '@prisma/client/runtime/library';
import { getProducts } from '@/lib/data';
import ProductCard from '@/components/ProductCard';
import prisma from '@/lib/prisma';
import { User, CartItem, OrderFullDetails, Product } from '@/types';


const imagePrefix = '/images/';
const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

// --- ИСПРАВЛЕНИЕ ЗДЕСЬ: ВОЗВРАЩАЕМ ЭТУ ФУНКЦИЮ ---
function formatImageUrl(path: string | null | undefined): string | null {
    if (!path) {
        return null;
    }
    if (path.startsWith('/') || path.startsWith('http')) {
        return path;
    }
    return `/images/${path}`;
}

// --- Auth Actions ---

export async function getSession(): Promise<User | null> {
  const token = cookies().get('session_token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    if (typeof payload.id === 'number' && typeof payload.name === 'string' && typeof payload.email === 'string') {
        return { id: payload.id, name: payload.name, email: payload.email };
    }
    return null;
  } catch (e) {
    return null;
  }
}

async function createSession(userPayload: User) {
    const guestCartIdStr = cookies().get('guestCartId')?.value;
    const guestCartId = guestCartIdStr ? parseInt(guestCartIdStr, 10) : null;

    const payload: JWTPayload = { ...userPayload };
    
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30d')
      .sign(secret);
  
    cookies().set('session_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 30 });

    if (guestCartId && !isNaN(guestCartId)) {
        await mergeGuestCartToUser(guestCartId, userPayload.id);
        cookies().delete('guestCartId');
    }
}

export async function register(prevState: any, formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!name || !email || !password || password.length < 6) {
        return { success: false, message: 'Invalid data provided.' };
    }
    
    const existingEmail = await prisma.users.findUnique({ where: { user_email: email } });
    if (existingEmail) return { success: false, message: 'User with this email already exists.' };
    
    const existingName = await prisma.users.findUnique({ where: { user_name: name } });
    if (existingName) return { success: false, message: 'This username is already taken.' };

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.users.create({
        data: {
            user_name: name,
            user_email: email,
            user_password: hashedPassword,
        }
    });

    const userPayload: User = { id: newUser.user_id, name: newUser.user_name || '', email: newUser.user_email || '' };
    await createSession(userPayload);
    
    redirect('/profile');
}

export async function login(prevState: any, formData: FormData) {
    const identifier = formData.get('identifier') as string;
    const password = formData.get('password') as string;

    if (!identifier || !password) {
        return { success: false, message: 'Please provide both identifier and password.' };
    }
  
    const user = await prisma.users.findFirst({
        where: { OR: [{ user_email: identifier }, { user_name: identifier }] }
    });
    
    if (!user || !user.user_password) {
      return { success: false, message: 'Invalid credentials.' };
    }
    
    const passwordMatches = await bcrypt.compare(password, user.user_password);
    if (!passwordMatches) {
        return { success: false, message: 'Invalid credentials.' };
    }

    const userPayload: User = { id: user.user_id, name: user.user_name || '', email: user.user_email || '' };
    await createSession(userPayload);

    redirect('/profile');
}

export async function logout() {
    cookies().delete('session_token');
    redirect('/');
}


// --- Cart Actions ---

export async function getCart(): Promise<{ cartId: number | null, items: CartItem[] }> {
    const user = await getSession();
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
        const guestCartId = parseInt(cookies().get('guestCartId')?.value || '0', 10);
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
        const guestCartId = parseInt(cookies().get('guestCartId')?.value || '0', 10);
        if (guestCartId) {
            const existingGuestCart = await prisma.orders.findFirst({ where: { order_id: guestCartId, user_id: null, order_status: 'CART' } });
            if (existingGuestCart) return existingGuestCart.order_id;
        }
        const newGuestCart = await prisma.orders.create({ data: { user_id: null, order_status: 'CART' } });
        cookies().set('guestCartId', String(newGuestCart.order_id), { maxAge: 30 * 24 * 60 * 60, path: '/' });
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


async function mergeGuestCartToUser(guestCartId: number, userId: number) {
    const userCart = await prisma.orders.findFirst({ where: { user_id: userId, order_status: 'CART' } });
    const userCartId = userCart ? userCart.order_id : (await prisma.orders.create({ data: { user_id: userId, order_status: 'CART' } })).order_id;
    
    if(guestCartId === userCartId) return;

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
export async function loadMoreProducts(
    audience: string,
    filters: {
        categoryName?: string;
        size?: string;
        brand?: string;
        material?: string;
        color?: string;
    },
    page: number
): Promise<{ products: Product[]; hasMore: boolean }> {
    // Просто вызываем getProducts и возвращаем его результат
    const result = await getProducts(audience, filters, page);
    return result;
}