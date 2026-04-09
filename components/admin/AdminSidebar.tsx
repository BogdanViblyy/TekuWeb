'use client';

import { Link } from '@/i18n/navigation';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    Warehouse,
    ShoppingCart,
    Settings,
    ArrowLeft,
} from 'lucide-react';

const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Inventory', href: '/admin/inventory', icon: Warehouse },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
];

const bottomItems = [
    { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    const isActive = (href: string, exact?: boolean) => {
        // Strip locale prefix for matching
        const clean = pathname.replace(/^\/(en|ru)/, '');
        if (exact) return clean === href;
        return clean.startsWith(href);
    };

    return (
        <aside className="admin-sidebar">
            <div className="admin-nav-section">Main</div>
            <nav>
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`admin-nav-item ${isActive(item.href, item.exact) ? 'active' : ''}`}
                    >
                        <item.icon />
                        {item.label}
                    </Link>
                ))}
            </nav>

            <div className="admin-nav-section" style={{ marginTop: 'auto', paddingTop: '2rem' }}>System</div>
            <nav>
                {bottomItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`admin-nav-item ${isActive(item.href) ? 'active' : ''}`}
                    >
                        <item.icon />
                        {item.label}
                    </Link>
                ))}
                <Link href="/" className="admin-nav-item" style={{ marginTop: '0.5rem' }}>
                    <ArrowLeft />
                    Back to Store
                </Link>
            </nav>
        </aside>
    );
}
