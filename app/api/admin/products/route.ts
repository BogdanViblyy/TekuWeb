// app/api/admin/products/route.ts
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

    const items = await prisma.shop_items.findMany({
        include: {
            brands: { select: { brand_name: true } },
            categories: { select: { category_name: true } },
            materials: { select: { material_name: true } },
            _count: { select: { products: true } },
        },
        orderBy: { item_id: 'desc' },
    });

    const formatted = items.map((item) => ({
        item_id: item.item_id,
        item_name: item.item_name || '',
        item_price: (item.item_price as unknown as Decimal).toNumber(),
        item_discount: item.item_discount ? (item.item_discount as unknown as Decimal).toNumber() : null,
        item_code: item.item_code,
        item_image: item.item_image,
        brand_name: item.brands?.brand_name || null,
        category_name: item.categories?.category_name || null,
        material_name: item.materials?.material_name || null,
        variant_count: item._count.products,
    }));

    return NextResponse.json({ items: formatted });
}

export async function POST(request: Request) {
    if (!(await verifyAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { item_name, item_price, item_discount, item_code, item_description, category_id, brand_id, material_id, item_image, variants } = body;

        const result = await prisma.$transaction(async (tx) => {
            const newItem = await tx.shop_items.create({
                data: {
                    item_name,
                    item_price: item_price,
                    item_discount: item_discount || null,
                    item_code: item_code || null,
                    item_description: item_description || null,
                    category_id: category_id || null,
                    brand_id: brand_id || null,
                    material_id: material_id || null,
                    item_image: item_image || null,
                },
            });

            if (variants && variants.length > 0) {
                await tx.products.createMany({
                    data: variants.map((v: any) => ({
                        item_id: newItem.item_id,
                        color_id: v.color_id,
                        size_id: v.size_id,
                        product_quantity: v.product_quantity || 0,
                    })),
                });
            }

            return newItem;
        });

        return NextResponse.json({ success: true, item_id: result.item_id });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 500 });
    }
}
