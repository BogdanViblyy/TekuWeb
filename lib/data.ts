// lib/data.ts
import prisma from '@/lib/prisma';
import { Product, ShopItemDetails, FilterOptions, UserOrderSummary, OrderFullDetails, CartItem } from '@/types';
import { Decimal } from '@prisma/client/runtime/library';
import { unstable_cache as cache } from 'next/cache';

const imagePrefix = '/images/';

// Вспомогательная функция для корректного формирования URL изображений
function formatImageUrl(path: string | null | undefined): string | null {
    if (!path) return null;
    if (path.startsWith('/') || path.startsWith('http')) return path;
    return `/images/${path}`;
}

// --- Функции для получения данных ---

const PRODUCTS_PER_PAGE = 12; // <-- Определяем, сколько товаров на одной "странице"

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

    const where: any = {
        categories: {
            OR: [
                { audience: audience.toUpperCase() },
                { audience: 'UNISEX' },
                { audience: null }
            ],
        },
    };

    if (filters.categoryName) where.categories.category_name = filters.categoryName;
    if (filters.brand) where.brands = { brand_name: filters.brand };
    if (filters.material) where.materials = { material_name: filters.material };
    if (filters.size) where.products = { some: { sizes: { size_name: filters.size } } };
    if (filters.color) where.products = { some: { colors: { color_name: filters.color } } };

    const items = await prisma.shop_items.findMany({
        where,
        skip: (page - 1) * 12, // PRODUCTS_PER_PAGE
        take: 12 + 1,
        include: {
            brands: true,     
            categories: true, 
        },
        orderBy: { item_id: 'asc' }
    });
    
    const hasMore = items.length > 12;
    const products = items.slice(0, 12);

    return {
        products: products.map((item: any) => ({
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
            products: {
                select: {
                    colors: true,
                    sizes: true
                }
            }
        }
    });

    if (!item) return null;

    const availableColors = [...new Set(item.products.map((p: any) => p.colors?.color_name).filter(Boolean))] as string[];
    const availableSizes = [...new Set(item.products.map((p: any) => p.sizes?.size_name).filter(Boolean))] as string[];
    
    return {
        itemId: item.item_id,
        name: item.item_name || 'No Name',
        brandName: item.brands?.brand_name || null,
        description: item.item_description,
        price: (item.item_price as unknown as Decimal).toNumber(),
        discount: item.item_discount ? (item.item_discount as unknown as Decimal).toNumber() : null,
        imageURL: formatImageUrl(item.item_image),
        itemCode: item.item_code,
        productCategoryName: item.categories?.category_name || 'Uncategorized',
        availableColors,
        availableSizes
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

    return orders.map((order: any) => {
        const totalAmount = order.order_products.reduce((sum: number, item: any) => sum + item.quantity * ((item.price_at_purchase as unknown as Decimal).toNumber() - ((item.discount_on_unit as unknown as Decimal)?.toNumber() || 0)), 0);
        const itemCount = order.order_products.reduce((sum: number, item: any) => sum + item.quantity, 0);

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

    const items: CartItem[] = order.order_products.map((op: any) => ({
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
        productCategoryName: op.products.shop_items.categories.category_name || ''
    }));

    const totalOrderAmount = items.reduce((sum, item) => sum + item.quantity * (item.priceAtPurchase - (item.discountOnUnit || 0)), 0);

    return {
        orderId: order.order_id,
        orderCode: order.order_code || '',
        orderTime: order.order_time.toISOString(),
        orderStatus: order.order_status,
        userName: order.users?.user_name || 'Guest',
        totalOrderAmount,
        items,
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
    return categories.map((c: any) => c.category_name || '').filter(Boolean);
  },
  ['categories_by_audience'], // Уникальный ключ для кеша
  { revalidate: 3600 } // Кеш на 1 час
);


export const getAvailableFilters = cache(
  async (audience: string, categoryName?: string): Promise<FilterOptions> => {
    console.log(`\x1b[36m[CACHE MISS]\x1b[0m Fetching filters for ${audience}/${categoryName || 'all'}`);
    
    const baseWhere: any = {
        categories: {
            OR: [
                { audience: audience.toUpperCase() },
                { audience: 'UNISEX' },
                { audience: null }
            ],
        },
    };
    if (categoryName) {
        baseWhere.categories.category_name = categoryName;
    }
    
    const relevantShopItems = await prisma.shop_items.findMany({
        where: baseWhere,
        select: { item_id: true }
    });

    if (relevantShopItems.length === 0) {
        const categories = await getCategoriesByAudience(audience);
        return { categories, sizes: [], brands: [], materials: [], colors: [] };
    }

    const relevantItemIds = relevantShopItems.map((item: any) => item.item_id);

    const [brands, sizes, materials, colors, categories] = await Promise.all([
        prisma.brands.findMany({ where: { shop_items: { some: { item_id: { in: relevantItemIds } } } }, select: { brand_name: true }, orderBy: { brand_name: 'asc' } }),
        prisma.sizes.findMany({ where: { products: { some: { item_id: { in: relevantItemIds } } } }, select: { size_name: true }, orderBy: { size_id: 'asc' } }),
        prisma.materials.findMany({ where: { shop_items: { some: { item_id: { in: relevantItemIds } } } }, select: { material_name: true }, orderBy: { material_name: 'asc' } }),
        prisma.colors.findMany({ where: { products: { some: { item_id: { in: relevantItemIds } } } }, select: { color_name: true, color_rgb: true }, orderBy: { color_name: 'asc' } }),
        getCategoriesByAudience(audience),
    ]);

    return {
      categories,
      brands: brands.map((b: any) => b.brand_name).filter(Boolean) as string[],
      sizes: sizes.map((s: any) => s.size_name).filter(Boolean) as string[],
      materials: materials.map((m: any) => m.material_name).filter(Boolean) as string[],
      colors: colors.map((c: any) => ({ name: c.color_name || '', rgb: c.color_rgb })).filter((c: any) => c.name),
    };
  },
  ['available_filters'], // Уникальный ключ для кеша
  { revalidate: 3600 } // Кеш на 1 час
);