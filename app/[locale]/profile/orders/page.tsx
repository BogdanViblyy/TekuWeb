// app/profile/orders/page.tsx
import { getSession } from "@/app/actions";
import { getUserOrders } from "@/lib/data";
import { UserOrderSummary } from "@/types";
import { redirect } from "next/navigation";
import Link from 'next/link';

function OrderCard({ order }: { order: UserOrderSummary }) {
    return (
        <div className="border rounded-lg p-4 flex justify-between items-center">
            <div>
                <p className="font-bold">{order.orderCode}</p>
                <p className="text-sm text-gray-500">{new Date(order.orderTime).toLocaleDateString()}</p>
                <p className="text-sm">Status: <span className="font-semibold">{order.orderStatus}</span></p>
            </div>
            <div className="text-right">
                <p className="font-bold">${order.totalAmount.toFixed(2)}</p>
                <Link href={`/profile/orders/${order.orderId}`} className="text-blue-600 hover:underline text-sm">
                    View Details
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

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-6">Your Orders</h1>
            {orders.length > 0 ? (
                <div className="space-y-4">
                    {orders.map(order => <OrderCard key={order.orderId} order={order} />)}
                </div>
            ) : (
                <p>You haven't placed any orders yet.</p>
            )}
        </div>
    );
}
