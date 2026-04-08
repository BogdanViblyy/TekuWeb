// app/profile/page.tsx
import { getSession } from "@/app/actions";
import { getUserOrders } from "@/lib/data";
import { redirect } from "next/navigation";
import { Link } from '@/i18n/navigation';
import { logout } from '@/app/actions';
import { getTranslations } from 'next-intl/server';
import RecentlyViewed from '@/components/RecentlyViewed';

export default async function ProfilePage() {
    const user = await getSession();

    if (!user) {
        redirect('/auth/login');
    }

    const recentOrders = await getUserOrders(user.id);
    const mostRecentOrder = recentOrders.length > 0 ? recentOrders[0] : null;
    const tProfile = await getTranslations('profile');

    return (
        <div className="container mx-auto px-4 py-8 pt-[calc(var(--header-total-height)+3rem)]">
            <h1 className="text-4xl font-bold mb-2">{tProfile('welcome')}, {user.name}!</h1>
            <p className="text-gray-600 mb-8">{user.email}</p>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Recent Order Section */}
                <div className="p-6 border rounded-lg">
                    <h2 className="text-2xl font-semibold mb-4">Most Recent Order</h2>
                    {mostRecentOrder ? (
                        <div>
                            <p><strong>Order #:</strong> {mostRecentOrder.orderCode}</p>
                            <p><strong>{tProfile('orderDate')}:</strong> {new Date(mostRecentOrder.orderTime).toLocaleDateString()}</p>
                            <p><strong>{tProfile('orderStatus')}:</strong> <span className="font-medium">{mostRecentOrder.orderStatus}</span></p>
                            <p><strong>{tProfile('orderTotal')}:</strong> ${mostRecentOrder.totalAmount.toFixed(2)}</p>
                             <Link href={`/profile/orders/${mostRecentOrder.orderId}`} className="text-blue-600 hover:underline mt-2 inline-block">
                                {tProfile('viewOrder')}
                            </Link>
                        </div>
                    ) : (
                        <p>{tProfile('noOrders')}</p>
                    )}
                    <Link href="/profile/orders" className="block text-center w-full bg-gray-200 text-black mt-6 py-2 rounded-md hover:bg-gray-300 transition">
                        {tProfile('yourOrders')}
                    </Link>
                </div>

                {/* Account Actions Section */}
                <div className="p-6 border rounded-lg">
                    <h2 className="text-2xl font-semibold mb-4">Account Settings</h2>
                    <div className="space-y-4">
                        <p>Manage your account details and preferences here.</p>
                        {/* More settings can be added here */}
                        <form action={logout}>
                            <button type="submit" className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition">
                                {tProfile('logoutButton')}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <RecentlyViewed />
        </div>
    );
}