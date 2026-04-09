// app/api/admin/dashboard/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import prisma from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

async function verifyAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return false;

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
        const { payload } = await jwtVerify(token, secret);
        return payload.role === 'ADMIN';
    } catch {
        return false;
    }
}

export async function GET() {
    if (!(await verifyAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [
        totalProducts,
        totalItems,
        activeCartsCount,
        totalOrdersCount,
        recentOrders,
        revenueResult,
    ] = await Promise.all([
        prisma.products.count(),
        prisma.shop_items.count(),
        prisma.orders.count({ where: { order_status: 'CART' } }),
        prisma.orders.count({ where: { NOT: { order_status: 'CART' } } }),
        prisma.orders.findMany({
            where: { NOT: { order_status: 'CART' } },
            include: {
                users: { select: { user_name: true } },
                order_products: {
                    select: {
                        quantity: true,
                        price_at_purchase: true,
                        discount_on_unit: true,
                    },
                },
            },
            orderBy: { order_time: 'desc' },
            take: 10,
        }),
        prisma.order_products.findMany({
            where: { orders: { NOT: { order_status: 'CART' } } },
            select: {
                quantity: true,
                price_at_purchase: true,
                discount_on_unit: true,
            },
        }),
    ]);

    const totalRevenue = revenueResult.reduce((sum, item) => {
        const price = (item.price_at_purchase as unknown as Decimal).toNumber();
        const discount = item.discount_on_unit
            ? (item.discount_on_unit as unknown as Decimal).toNumber()
            : 0;
        return sum + item.quantity * (price - discount);
    }, 0);

    const formattedOrders = recentOrders.map((order) => {
        const total = order.order_products.reduce((sum, item) => {
            const price = (item.price_at_purchase as unknown as Decimal).toNumber();
            const discount = item.discount_on_unit
                ? (item.discount_on_unit as unknown as Decimal).toNumber()
                : 0;
            return sum + item.quantity * (price - discount);
        }, 0);

        return {
            order_id: order.order_id,
            order_code: order.order_code,
            order_time: order.order_time.toISOString(),
            order_status: order.order_status,
            user_name: order.users?.user_name || 'Guest',
            total,
            item_count: order.order_products.reduce((sum, i) => sum + i.quantity, 0),
        };
    });

    return NextResponse.json({
        totalRevenue,
        totalProducts,
        totalItems,
        activeCartsCount,
        totalOrdersCount,
        recentOrders: formattedOrders,
    });
}
