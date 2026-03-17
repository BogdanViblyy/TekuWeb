import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { Product, ShopItemDetails, FilterOptions, UserOrderSummary, OrderFullDetails, CartItem } from '@/types';
import { Decimal } from '@prisma/client/runtime/library';
import { unstable_cache as cache } from 'next/cache';

import { formatImageUrl } from '@/lib/utils';

// --- Функции для получения данных ---

const PRODUCTS_PER_PAGE = 12;

export async function searchProducts(query: string): Promise<Product[]> {
    if (!query || query.trim().length < 2) return [];

    const items = await prisma.shop_items.findMany({
        where: {
            OR: [
                { item_name: { contains: query } },
                { item_description: { contains: query } },
                { brands: { brand_name: { contains: query } } },
                { categories: { category_name: { contains: query } } },
            ],
        },
        include: {
            brands: true,
            categories: true,
        },
        take: 24,
        orderBy: { item_id: 'asc' },
    });

    return items.map((item) => ({
        itemId: item.item_id,
        name: item.item_name || 'No Name',
        brandName: item.brands?.brand_name || null,
        description: item.item_description,
        price: (item.item_price as unknown as Decimal).toNumber(),
        discount: item.item_discount ? (item.item_discount as unknown as Decimal).toNumber() : null,
        imageURL: formatImageUrl(item.item_image),
        productCategoryName: item.categories?.category_name || 'Uncategorized',
    }));
}

export async function getProducts(
    audience: string,
    // FIX: Принимаем объект с фильтрами для чистоты
    filters: {
        categoryName?: string,
        size?: string,
        brand?: string,
        material?: string,
        color?: string
    },
    page: number = 1
): Promise<{ products: Product[], hasMore: boolean }> {
    if (!audience) return { products: [], hasMore: false };

    const where: Prisma.shop_itemsWhereInput = {
        categories: {
            OR: [
                { audience: audience.toUpperCase() },
                { audience: 'UNISEX' },
                { audience: null }
            ],
        },
    };

    if (filters.categoryName) {
        (where.categories as Record<string, unknown>).category_name = filters.categoryName;
    }
    if (filters.brand) where.brands = { brand_name: filters.brand };
    if (filters.material) where.materials = { material_name: filters.material };
    if (filters.size) where.products = { some: { sizes: { size_name: filters.size } } };
    if (filters.color) where.products = { some: { colors: { color_name: filters.color } } };

    const items = await prisma.shop_items.findMany({
        where,
        skip: (page - 1) * PRODUCTS_PER_PAGE,
        take: PRODUCTS_PER_PAGE + 1,
        include: {
            brands: true,
            categories: true,
        },
        orderBy: { item_id: 'asc' }
    });

    const hasMore = items.length > PRODUCTS_PER_PAGE;
    const products = items.slice(0, PRODUCTS_PER_PAGE);

    return {
        products: products.map((item) => ({
            itemId: item.item_id,
            name: item.item_name || 'No Name',
            brandName: item.brands?.brand_name || null,
            description: item.item_description,
            price: (item.item_price as unknown as Decimal).toNumber(),
            discount: item.item_discount ? (item.item_discount as unknown as Decimal).toNumber() : null,
            imageURL: item.item_image ? `/images/${item.item_image}` : null,
            productCategoryName: item.categories?.category_name || 'Uncategorized',
        })),
        hasMore
    };
}

export async function getProductDetails(id: number): Promise<ShopItemDetails | null> {
    const item = await prisma.shop_items.findUnique({
        where: { item_id: id },
        include: {
            brands: true,
            categories: true,
            item_images: {
                orderBy: { sort_order: 'asc' },
            },
            products: {
                select: {
                    colors: true,
                    sizes: true
                }
            }
        }
    });

    if (!item) return null;

    const availableColors = [...new Set(item.products.map((p) => p.colors?.color_name).filter(Boolean))] as string[];
    const availableSizes = [...new Set(item.products.map((p) => p.sizes?.size_name).filter(Boolean))] as string[];

    // Build image gallery: use item_images table, fall back to primary item_image
    const primaryImage = formatImageUrl(item.item_image);
    const galleryImages = item.item_images.map((img) => formatImageUrl(img.image_url)).filter(Boolean) as string[];
    const imageURLs = galleryImages.length > 0 ? galleryImages : (primaryImage ? [primaryImage] : []);

    return {
        itemId: item.item_id,
        name: item.item_name || 'No Name',
        brandName: item.brands?.brand_name || null,
        description: item.item_description,
        price: (item.item_price as unknown as Decimal).toNumber(),
        discount: item.item_discount ? (item.item_discount as unknown as Decimal).toNumber() : null,
        imageURL: primaryImage,
        itemCode: item.item_code,
        productCategoryName: item.categories?.category_name || 'Uncategorized',
        availableColors,
        availableSizes,
        imageURLs,
    };
}


export async function getUserOrders(userId: number): Promise<UserOrderSummary[]> {
    const orders = await prisma.orders.findMany({
        where: {
            user_id: userId,
            NOT: { order_status: 'CART' }
        },
        include: {
            order_products: {
                select: {
                    quantity: true,
                    price_at_purchase: true,
                    discount_on_unit: true,
                }
            }
        },
        orderBy: { order_time: 'desc' }
    });

    return orders.map((order) => {
        const totalAmount = order.order_products.reduce((sum: number, item) => sum + item.quantity * ((item.price_at_purchase as unknown as Decimal).toNumber() - ((item.discount_on_unit as unknown as Decimal)?.toNumber() || 0)), 0);
        const itemCount = order.order_products.reduce((sum: number, item) => sum + item.quantity, 0);

        return {
            orderId: order.order_id,
            orderCode: order.order_code || '',
            orderTime: order.order_time.toISOString(),
            orderStatus: order.order_status,
            totalAmount,
            itemCount
        };
    });
}


export async function getOrderDetails(orderId: number, userId: number): Promise<OrderFullDetails | null> {
    const order = await prisma.orders.findFirst({
        where: { order_id: orderId, user_id: userId, NOT: { order_status: 'CART' } },
        include: {
            users: true,
            order_status_history: {
                orderBy: { changed_at: 'asc' },
            },
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
        }
    });

    if (!order) return null;

    const items: CartItem[] = order.order_products.map((op) => ({
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

    const totalOrderAmount = items.reduce((sum, item) => sum + item.quantity * (item.priceAtPurchase - (item.discountOnUnit || 0)), 0);

    const statusHistory = order.order_status_history.map((h) => ({
        status: h.status,
        changedAt: h.changed_at.toISOString(),
        note: h.note,
    }));

    return {
        orderId: order.order_id,
        orderCode: order.order_code || '',
        orderTime: order.order_time.toISOString(),
        orderStatus: order.order_status,
        userName: order.users?.user_name || 'Guest',
        totalOrderAmount,
        items,
        statusHistory,
    };
}


// --- КЕШИРОВАННЫЕ ФУНКЦИИ ---

export const getCategoriesByAudience = cache(
    async (audience: string): Promise<string[]> => {
        console.log(`\x1b[36m[CACHE MISS]\x1b[0m Fetching categories for ${audience}`);
        const categories = await prisma.categories.findMany({
            where: {
                OR: [
                    { audience: audience.toUpperCase() },
                    { audience: 'UNISEX' },
                    { audience: null },
                ]
            },
            select: { category_name: true },
            distinct: ['category_name'],
            orderBy: { category_name: 'asc' }
        });
        return categories.map((c) => c.category_name || '').filter(Boolean);
    },
    ['categories_by_audience'], // Уникальный ключ для кеша
    { revalidate: 3600 } // Кеш на 1 час
);


export const getAvailableFilters = cache(
    async (audience: string, categoryName?: string): Promise<FilterOptions> => {
        console.log(`\x1b[36m[CACHE MISS]\x1b[0m Fetching filters for ${audience}/${categoryName || 'all'}`);

        const baseWhere: Prisma.shop_itemsWhereInput = {
            categories: {
                OR: [
                    { audience: audience.toUpperCase() },
                    { audience: 'UNISEX' },
                    { audience: null }
                ],
            },
        };
        if (categoryName && baseWhere.categories) {
            (baseWhere.categories as Record<string, unknown>).category_name = categoryName;
        }

        const relevantShopItems = await prisma.shop_items.findMany({
            where: baseWhere,
            select: { item_id: true }
        });

        if (relevantShopItems.length === 0) {
            const categories = await getCategoriesByAudience(audience);
            return { categories, sizes: [], brands: [], materials: [], colors: [] };
        }

        const relevantItemIds = relevantShopItems.map((item) => item.item_id);

        const [brands, sizes, materials, colors, categories] = await Promise.all([
            prisma.brands.findMany({ where: { shop_items: { some: { item_id: { in: relevantItemIds } } } }, select: { brand_name: true }, orderBy: { brand_name: 'asc' } }),
            prisma.sizes.findMany({ where: { products: { some: { item_id: { in: relevantItemIds } } } }, select: { size_name: true }, orderBy: { size_id: 'asc' } }),
            prisma.materials.findMany({ where: { shop_items: { some: { item_id: { in: relevantItemIds } } } }, select: { material_name: true }, orderBy: { material_name: 'asc' } }),
            prisma.colors.findMany({ where: { products: { some: { item_id: { in: relevantItemIds } } } }, select: { color_name: true, color_rgb: true }, orderBy: { color_name: 'asc' } }),
            getCategoriesByAudience(audience),
        ]);

        return {
            categories,
            brands: brands.map((b) => b.brand_name).filter(Boolean) as string[],
            sizes: sizes.map((s) => s.size_name).filter(Boolean) as string[],
            materials: materials.map((m) => m.material_name).filter(Boolean) as string[],
            colors: colors.map((c) => ({ name: c.color_name || '', rgb: c.color_rgb })).filter((c) => c.name),
        };
    },
    ['available_filters'],
    { revalidate: 3600 }
);


// --- Browse-By Data Functions ---

export async function getAllBrands(): Promise<{ brandId: number; brandName: string; description: string | null; productCount: number }[]> {
    const brands = await prisma.brands.findMany({
        include: { _count: { select: { shop_items: true } } },
        orderBy: { brand_name: 'asc' },
    });
    return brands
        .filter((b) => b.brand_name && b._count.shop_items > 0)
        .map((b) => ({
            brandId: b.brand_id,
            brandName: b.brand_name!,
            description: b.brand_description,
            productCount: b._count.shop_items,
        }));
}

export async function getProductsByBrand(brandId: number): Promise<{ brand: { brandId: number; brandName: string; description: string | null } | null; products: Product[] }> {
    const brand = await prisma.brands.findUnique({ where: { brand_id: brandId } });
    if (!brand) return { brand: null, products: [] };

    const items = await prisma.shop_items.findMany({
        where: { brand_id: brandId },
        include: { brands: true, categories: true },
        orderBy: { item_id: 'asc' },
    });

    return {
        brand: { brandId: brand.brand_id, brandName: brand.brand_name || '', description: brand.brand_description },
        products: items.map((item) => ({
            itemId: item.item_id,
            name: item.item_name || 'No Name',
            brandName: item.brands?.brand_name || null,
            description: item.item_description,
            price: (item.item_price as unknown as Decimal).toNumber(),
            discount: item.item_discount ? (item.item_discount as unknown as Decimal).toNumber() : null,
            imageURL: formatImageUrl(item.item_image),
            productCategoryName: item.categories?.category_name || 'Uncategorized',
        })),
    };
}

export async function getAllMaterials(): Promise<{ materialId: number; materialName: string; productCount: number }[]> {
    const materials = await prisma.materials.findMany({
        include: { _count: { select: { shop_items: true } } },
        orderBy: { material_name: 'asc' },
    });
    return materials
        .filter((m) => m.material_name && m._count.shop_items > 0)
        .map((m) => ({
            materialId: m.material_id,
            materialName: m.material_name!,
            productCount: m._count.shop_items,
        }));
}

export async function getProductsByMaterial(materialId: number): Promise<{ material: { materialId: number; materialName: string } | null; products: Product[] }> {
    const material = await prisma.materials.findUnique({ where: { material_id: materialId } });
    if (!material) return { material: null, products: [] };

    const items = await prisma.shop_items.findMany({
        where: { material_id: materialId },
        include: { brands: true, categories: true },
        orderBy: { item_id: 'asc' },
    });

    return {
        material: { materialId: material.material_id, materialName: material.material_name || '' },
        products: items.map((item) => ({
            itemId: item.item_id,
            name: item.item_name || 'No Name',
            brandName: item.brands?.brand_name || null,
            description: item.item_description,
            price: (item.item_price as unknown as Decimal).toNumber(),
            discount: item.item_discount ? (item.item_discount as unknown as Decimal).toNumber() : null,
            imageURL: formatImageUrl(item.item_image),
            productCategoryName: item.categories?.category_name || 'Uncategorized',
        })),
    };
}

export async function getAllColors(): Promise<{ colorId: number; colorName: string; colorRgb: string | null; productCount: number }[]> {
    const colors = await prisma.colors.findMany({
        include: { _count: { select: { products: true } } },
        orderBy: { color_name: 'asc' },
    });
    return colors
        .filter((c) => c.color_name && c._count.products > 0)
        .map((c) => ({
            colorId: c.color_id,
            colorName: c.color_name!,
            colorRgb: c.color_rgb,
            productCount: c._count.products,
        }));
}

export async function getProductsByColor(colorId: number): Promise<{ color: { colorId: number; colorName: string; colorRgb: string | null } | null; products: Product[] }> {
    const color = await prisma.colors.findUnique({ where: { color_id: colorId } });
    if (!color) return { color: null, products: [] };

    const variants = await prisma.products.findMany({
        where: { color_id: colorId },
        select: { item_id: true },
        distinct: ['item_id'],
    });
    const itemIds = variants.map((v) => v.item_id);

    const items = await prisma.shop_items.findMany({
        where: { item_id: { in: itemIds } },
        include: { brands: true, categories: true },
        orderBy: { item_id: 'asc' },
    });

    return {
        color: { colorId: color.color_id, colorName: color.color_name || '', colorRgb: color.color_rgb },
        products: items.map((item) => ({
            itemId: item.item_id,
            name: item.item_name || 'No Name',
            brandName: item.brands?.brand_name || null,
            description: item.item_description,
            price: (item.item_price as unknown as Decimal).toNumber(),
            discount: item.item_discount ? (item.item_discount as unknown as Decimal).toNumber() : null,
            imageURL: formatImageUrl(item.item_image),
            productCategoryName: item.categories?.category_name || 'Uncategorized',
        })),
    };
}
