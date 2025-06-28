// types/index.ts

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface CartItem {
  orderProductId: number;
  shopItemId: number;
  productName: string;
  quantity: number;
  priceAtPurchase: number;
  discountOnUnit: number | null;
  colorName: string;
  sizeName: string;
  imageURL: string | null;
  productVariantId: number;
  availableStock: number | null;
  productCategoryName: string;
}

export interface Product {
    itemId: number;
    name: string;
    brandName: string | null;
    description: string | null;
    price: number;
    discount: number | null;
    imageURL: string | null;
    productCategoryName: string;
}

export interface ShopItemDetails extends Product {
    itemCode: string | null;
    availableColors: string[];
    availableSizes: string[];
}

export interface ColorFilter {
    name: string;
    rgb: string | null;
}

export interface FilterOptions {
    categories: string[];
    sizes: string[];
    brands: string[];
    materials: string[];
    colors: ColorFilter[];
}

export interface UserOrderSummary {
    orderId: number;
    orderCode: string;
    orderTime: string; // ISO string
    orderStatus: string;
    totalAmount: number;
    itemCount: number;
}

export interface OrderFullDetails {
    orderId: number;
    orderCode: string;
    orderTime: string; // ISO string
    orderStatus: string;
    userName: string;
    totalOrderAmount: number;
    items: CartItem[];
}