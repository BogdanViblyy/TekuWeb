// app/profile/orders/page.tsx
import { getSession } from "@/app/actions";
import { getUserOrders } from "@/lib/data";
import { UserOrderSummary } from "@/types";
import { redirect } from "next/navigation";
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';

function OrderCard({ order, tProfile }: { order: UserOrderSummary, tProfile: any }) {
    return (
        <div className="border rounded-lg p-4 flex justify-between items-center">
            <div>
                <p className="font-bold">{order.orderCode}</p>
                <p className="text-sm text-gray-500">{new Date(order.orderTime).toLocaleDateString()}</p>
                <p className="text-sm">{tProfile('orderStatus')}: <span className="font-semibold">{order.orderStatus}</span></p>
            </div>
            <div className="text-right">
                <p className="font-bold">${order.totalAmount.toFixed(2)}</p>
                <Link href={`/profile/orders/${order.orderId}`} className="text-blue-600 hover:underline text-sm">
                    {tProfile('viewOrder')}
                </Link>
            </div>
        </div>
    );
}

export default async function OrderHistoryPage() {
    const user = await getSession();
    if (!user) {
        redirect('/auth/login');
    }

    const orders = await getUserOrders(user.id);
    const tProfile = await getTranslations('profile');

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-6">{tProfile('yourOrders')}</h1>
            {orders.length > 0 ? (
                <div className="space-y-4">
                    {orders.map(order => <OrderCard key={order.orderId} order={order} tProfile={tProfile} />)}
                </div>
            ) : (
                <p>{tProfile('noOrders')}</p>
            )}
        </div>
    );
}
