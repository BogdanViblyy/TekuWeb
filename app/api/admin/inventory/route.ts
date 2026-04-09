// app/api/admin/inventory/route.ts
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

    const products = await prisma.products.findMany({
        include: {
            shop_items: {
                select: {
                    item_name: true,
                    item_price: true,
                    item_discount: true,
                    item_code: true,
                },
            },
            colors: { select: { color_name: true } },
            sizes: { select: { size_name: true } },
        },
        orderBy: { item_id: 'asc' },
    });

    const formatted = products.map((p) => ({
        id: p.id,
        item_id: p.item_id,
        item_name: p.shop_items.item_name || '',
        item_price: (p.shop_items.item_price as unknown as Decimal).toNumber(),
        item_discount: p.shop_items.item_discount
            ? (p.shop_items.item_discount as unknown as Decimal).toNumber()
            : null,
        item_code: p.shop_items.item_code,
        color_name: p.colors?.color_name || '',
        size_name: p.sizes?.size_name || '',
        product_quantity: p.product_quantity,
    }));

    return NextResponse.json({ products: formatted });
}

export async function PUT(request: Request) {
    if (!(await verifyAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { updates } = body; // Array of { id, product_quantity?, item_price? }

        if (!updates || !Array.isArray(updates)) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        await prisma.$transaction(async (tx) => {
            for (const update of updates) {
                if (update.product_quantity !== undefined) {
                    await tx.products.update({
                        where: { id: update.id },
                        data: { product_quantity: update.product_quantity },
                    });
                }
                if (update.item_price !== undefined && update.item_id) {
                    await tx.shop_items.update({
                        where: { item_id: update.item_id },
                        data: { item_price: update.item_price },
                    });
                }
            }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Update failed' }, { status: 500 });
    }
}
