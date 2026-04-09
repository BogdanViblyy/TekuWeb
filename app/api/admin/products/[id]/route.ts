// app/api/admin/products/[id]/route.ts
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
    const itemId = parseInt(id);

    const item = await prisma.shop_items.findUnique({
        where: { item_id: itemId },
        include: {
            brands: true,
            categories: true,
            materials: true,
            products: {
                include: {
                    colors: true,
                    sizes: true,
                },
            },
        },
    });

    if (!item) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({
        item_id: item.item_id,
        item_name: item.item_name,
        item_price: (item.item_price as unknown as Decimal).toNumber(),
        item_discount: item.item_discount ? (item.item_discount as unknown as Decimal).toNumber() : null,
        item_code: item.item_code,
        item_description: item.item_description,
        item_image: item.item_image,
        category_id: item.category_id,
        brand_id: item.brand_id,
        material_id: item.material_id,
        brand_name: item.brands?.brand_name || null,
        category_name: item.categories?.category_name || null,
        material_name: item.materials?.material_name || null,
        products: item.products.map((p) => ({
            id: p.id,
            color_id: p.color_id,
            color_name: p.colors?.color_name || '',
            size_id: p.size_id,
            size_name: p.sizes?.size_name || '',
            product_quantity: p.product_quantity,
        })),
    });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!(await verifyAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const itemId = parseInt(id);
    const body = await request.json();

    try {
        await prisma.$transaction(async (tx) => {
            await tx.shop_items.update({
                where: { item_id: itemId },
                data: {
                    item_name: body.item_name,
                    item_price: body.item_price,
                    item_discount: body.item_discount || null,
                    item_code: body.item_code || null,
                    item_description: body.item_description || null,
                    category_id: body.category_id || null,
                    brand_id: body.brand_id || null,
                    material_id: body.material_id || null,
                    item_image: body.item_image || null,
                },
            });

            // Delete existing variants and recreate
            if (body.variants) {
                await tx.products.deleteMany({ where: { item_id: itemId } });
                await tx.products.createMany({
                    data: body.variants.map((v: any) => ({
                        item_id: itemId,
                        color_id: v.color_id,
                        size_id: v.size_id,
                        product_quantity: v.product_quantity || 0,
                    })),
                });
            }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Update failed' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!(await verifyAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const itemId = parseInt(id);

    try {
        await prisma.shop_items.delete({ where: { item_id: itemId } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Delete failed' }, { status: 500 });
    }
}
