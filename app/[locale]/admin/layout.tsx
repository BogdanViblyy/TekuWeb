import { redirect } from 'next/navigation';
import { getSession } from '@/app/actions';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminQueryProvider from '@/components/admin/AdminQueryProvider';
import '@/styles/admin.css';

export const metadata = {
    title: 'TEKU.admin — Control Panel',
    description: 'Internal admin panel for TekuWeb e-commerce platform',
};

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getSession();

    // Double-check server-side (middleware handles redirect, but belt-and-suspenders)
    if (!user || user.role !== 'ADMIN') {
        redirect('/');
    }

    return (
        <div className="admin-shell">
            <AdminQueryProvider>
                <AdminHeader user={user} />
                <AdminSidebar />
                <main className="admin-main">
                    {children}
                </main>
            </AdminQueryProvider>
        </div>
    );
}
