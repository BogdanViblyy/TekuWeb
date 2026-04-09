// app/api/admin/lookups/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import prisma from '@/lib/prisma';

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

    const [categories, brands, materials, colors, sizes] = await Promise.all([
        prisma.categories.findMany({ orderBy: { category_name: 'asc' } }),
        prisma.brands.findMany({ orderBy: { brand_name: 'asc' } }),
        prisma.materials.findMany({ orderBy: { material_name: 'asc' } }),
        prisma.colors.findMany({ orderBy: { color_name: 'asc' } }),
        prisma.sizes.findMany({ orderBy: { size_id: 'asc' } }),
    ]);

    return NextResponse.json({
        categories: categories.map((c) => ({ category_id: c.category_id, category_name: c.category_name })),
        brands: brands.map((b) => ({ brand_id: b.brand_id, brand_name: b.brand_name })),
        materials: materials.map((m) => ({ material_id: m.material_id, material_name: m.material_name })),
        colors: colors.map((c) => ({ color_id: c.color_id, color_name: c.color_name })),
        sizes: sizes.map((s) => ({ size_id: s.size_id, size_name: s.size_name })),
    });
}
