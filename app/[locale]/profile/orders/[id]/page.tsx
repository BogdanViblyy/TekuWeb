// app/profile/orders/[id]/page.tsx
import { getSession } from "@/app/actions";
import { getOrderDetails } from "@/lib/data";
import { redirect } from "next/navigation";
import Image from 'next/image';
import { getDefaultImageUrl } from "@/lib/utils";
import OrderStatusTimeline from "@/components/OrderStatusTimeline";
import { getTranslations, getLocale } from 'next-intl/server';

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const user = await getSession();
    if (!user) {
        redirect('/auth/login');
    }

    const { id } = await params;
    const orderId = parseInt(id, 10);

    const tProfile = await getTranslations('profile');
    const tStatus = await getTranslations('orderStatus');
    const tProduct = await getTranslations('product');
    const tCart = await getTranslations('cart');
    const tErrors = await getTranslations('errors');

    if (isNaN(orderId)) {
        return <div className="text-center py-20 pt-[calc(var(--header-total-height)+3rem)]">{tErrors('invalidOrderId')}</div>;
    }

    const locale = await getLocale();
    const order = await getOrderDetails(orderId, user.id, locale);

    if (!order) {
        return <div className="text-center py-20 pt-[calc(var(--header-total-height)+3rem)]">{tErrors('orderNotFound')}</div>
    }

    return (
        <div className="container mx-auto max-w-4xl px-4 py-8 pt-[calc(var(--header-total-height)+3rem)]">
            <h1 className="text-3xl font-bold">{tProfile('orderDetails')}</h1>
            <p className="text-lg text-gray-600 mb-6">{tProfile('orderNumber')}: {order.orderCode}</p>

            {/* Status Timeline */}
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
                <OrderStatusTimeline
                    currentStatus={order.orderStatus}
                    history={order.statusHistory}
                />
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-8">
                <div className="grid md:grid-cols-3 gap-4">
                    <div>
                        <p className="font-semibold">{tProfile('orderDate')}</p>
                        <p>{new Date(order.orderTime).toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="font-semibold">{tProfile('orderStatus')}</p>
                        <p className="capitalize">{tStatus(order.orderStatus.toLowerCase() as any)}</p>
                    </div>
                    <div>
                        <p className="font-semibold">{tProfile('orderTotal')}</p>
                        <p>${order.totalOrderAmount.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">{tProfile('orderItems')}</h2>
            <div className="space-y-4">
                {order.items.map(item => (
                    <div key={item.orderProductId} className="flex items-start space-x-4 p-4 border rounded-lg">
                        <div className="w-24 h-24 relative flex-shrink-0">
                            <Image
                                src={item.imageURL || getDefaultImageUrl(item.productCategoryName)}
                                alt={item.productName || 'Item'}
                                fill
                                style={{ objectFit: 'cover' }}
                                className="rounded-md"
                            />
                        </div>
                        <div className="flex-grow">
                            <h3 className="font-semibold">{item.productName}</h3>
                            <p className="text-sm text-gray-500">{tProduct('color')}: {item.colorName} | {tProduct('size')}: {item.sizeName}</p>
                            <p className="text-sm">{tCart('qty')}: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-semibold">${(item.quantity * (item.priceAtPurchase - (item.discountOnUnit || 0))).toFixed(2)}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}