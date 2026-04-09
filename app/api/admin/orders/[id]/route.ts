// app/api/admin/orders/[id]/route.ts
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

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!(await verifyAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const orderId = parseInt(id);

    const order = await prisma.orders.findUnique({
        where: { order_id: orderId },
        include: {
            users: { select: { user_name: true, user_email: true } },
            order_status_history: {
                orderBy: { changed_at: 'asc' },
            },
            order_products: {
                include: {
                    products: {
                        include: {
                            shop_items: { select: { item_name: true, item_image: true } },
                            colors: { select: { color_name: true } },
                            sizes: { select: { size_name: true } },
                        },
                    },
                },
            },
        },
    });

    if (!order) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const items = order.order_products.map((op) => ({
        id: op.id,
        product_name: op.products.shop_items.item_name || '',
        color_name: op.products.colors?.color_name || '',
        size_name: op.products.sizes?.size_name || '',
        quantity: op.quantity,
        price_at_purchase: (op.price_at_purchase as unknown as Decimal).toNumber(),
        discount_on_unit: op.discount_on_unit
            ? (op.discount_on_unit as unknown as Decimal).toNumber()
            : 0,
        image: op.products.shop_items.item_image,
    }));

    const total = items.reduce(
        (sum, i) => sum + i.quantity * (i.price_at_purchase - i.discount_on_unit),
        0
    );

    return NextResponse.json({
        order_id: order.order_id,
        order_code: order.order_code,
        order_time: order.order_time.toISOString(),
        order_status: order.order_status,
        user_name: order.users?.user_name || 'Guest',
        user_email: order.users?.user_email || '',
        total,
        items,
        status_history: order.order_status_history.map((h) => ({
            status: h.status,
            changedAt: h.changed_at.toISOString(),
            note: h.note,
        })),
    });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!(await verifyAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const orderId = parseInt(id);
    const body = await request.json();
    const { status, note } = body;

    const validStatuses = ['PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    try {
        await prisma.$transaction(async (tx) => {
            await tx.orders.update({
                where: { order_id: orderId },
                data: { order_status: status },
            });

            await tx.order_status_history.create({
                data: {
                    order_id: orderId,
                    status,
                    note: note || `Status changed to ${status} by admin.`,
                },
            });
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Update failed' }, { status: 500 });
    }
}
