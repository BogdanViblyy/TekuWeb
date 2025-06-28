// app/profile/orders/[id]/page.tsx
import { getSession } from "@/app/actions";
import { getOrderDetails } from "@/lib/data";
import { redirect } from "next/navigation";
import Image from 'next/image';
import { getDefaultImageUrl } from "@/lib/utils";

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
    const user = await getSession();
    if (!user) {
        redirect('/auth/login');
    }

    const orderId = parseInt(params.id, 10);
    if (isNaN(orderId)) {
        return <div className="text-center py-20">Invalid order ID.</div>;
    }

    const order = await getOrderDetails(orderId, user.id);

    if (!order) {
        return <div className="text-center py-20">Order not found or you do not have permission to view it.</div>
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold">Order Details</h1>
            <p className="text-lg text-gray-600 mb-6">Order #{order.orderCode}</p>

            <div className="bg-gray-50 p-6 rounded-lg mb-8">
                <div className="grid md:grid-cols-3 gap-4">
                    <div>
                        <p className="font-semibold">Order Date</p>
                        <p>{new Date(order.orderTime).toLocaleString()}</p>
                    </div>
                     <div>
                        <p className="font-semibold">Order Status</p>
                        <p>{order.orderStatus}</p>
                    </div>
                    <div>
                        <p className="font-semibold">Order Total</p>
                        <p>${order.totalOrderAmount.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">Items in this order</h2>
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
                            <p className="text-sm text-gray-500">Color: {item.colorName} | Size: {item.sizeName}</p>
                            <p className="text-sm">Qty: {item.quantity}</p>
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