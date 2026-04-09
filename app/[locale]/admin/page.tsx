'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import StatCard from '@/components/admin/StatCard';
import DataTable from '@/components/admin/DataTable';
import { DollarSign, ShoppingCart, Package, TrendingUp } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';

interface DashboardData {
    totalRevenue: number;
    totalProducts: number;
    totalItems: number;
    activeCartsCount: number;
    totalOrdersCount: number;
    recentOrders: RecentOrder[];
}

interface RecentOrder {
    order_id: number;
    order_code: string | null;
    order_time: string;
    order_status: string;
    user_name: string;
    total: number;
    item_count: number;
}

const statusBadgeClass: Record<string, string> = {
    PLACED: 'admin-badge admin-badge-info',
    PROCESSING: 'admin-badge admin-badge-warning',
    SHIPPED: 'admin-badge admin-badge-default',
    DELIVERED: 'admin-badge admin-badge-success',
    CANCELLED: 'admin-badge admin-badge-danger',
};

const orderColumns: ColumnDef<RecentOrder, any>[] = [
    {
        accessorKey: 'order_code',
        header: 'Order',
        cell: ({ getValue }) => (
            <span style={{ color: '#ffffff', fontWeight: 500 }}>
                {getValue() || '—'}
            </span>
        ),
    },
    {
        accessorKey: 'user_name',
        header: 'Customer',
    },
    {
        accessorKey: 'order_status',
        header: 'Status',
        cell: ({ getValue }) => {
            const status = getValue() as string;
            return (
                <span className={statusBadgeClass[status] || 'admin-badge admin-badge-default'}>
                    {status}
                </span>
            );
        },
    },
    {
        accessorKey: 'item_count',
        header: 'Items',
    },
    {
        accessorKey: 'total',
        header: 'Total',
        cell: ({ getValue }) => `$${(getValue() as number).toFixed(2)}`,
    },
    {
        accessorKey: 'order_time',
        header: 'Date',
        cell: ({ getValue }) =>
            new Date(getValue() as string).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
            }),
    },
];

export default function AdminDashboard() {
    const { data, isLoading } = useQuery<DashboardData>({
        queryKey: ['admin-dashboard'],
        queryFn: async () => {
            const res = await fetch('/api/admin/dashboard');
            if (!res.ok) throw new Error('Failed to fetch dashboard data');
            return res.json();
        },
        refetchInterval: 30000,
    });

    if (isLoading || !data) {
        return (
            <div>
                <h1 className="admin-page-title">Command Center</h1>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="admin-skeleton" style={{ height: '120px' }} />
                    ))}
                </div>
                <div className="admin-skeleton" style={{ height: '400px' }} />
            </div>
        );
    }

    return (
        <div>
            <motion.h1
                className="admin-page-title"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                Command Center
            </motion.h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                <StatCard
                    label="Total Revenue"
                    value={`$${data.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                    subtitle={`${data.totalOrdersCount} orders`}
                    icon={DollarSign}
                />
                <StatCard
                    label="Active Carts"
                    value={data.activeCartsCount}
                    subtitle="Pending checkout"
                    icon={ShoppingCart}
                />
                <StatCard
                    label="Products"
                    value={data.totalItems}
                    subtitle={`${data.totalProducts} variants`}
                    icon={Package}
                />
                <StatCard
                    label="Total Orders"
                    value={data.totalOrdersCount}
                    subtitle="Lifetime"
                    icon={TrendingUp}
                />
            </div>

            <div>
                <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#a1a1aa' }}>
                    Recent Orders
                </h2>
                <DataTable
                    data={data.recentOrders}
                    columns={orderColumns}
                    searchPlaceholder="Search orders..."
                    pageSize={10}
                />
            </div>
        </div>
    );
}
