'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { motion } from 'framer-motion';
import DataTable from '@/components/admin/DataTable';
import { type ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';

interface OrderItem {
    order_id: number;
    order_code: string | null;
    order_time: string;
    order_status: string;
    user_name: string;
    user_email: string;
    total: number;
    item_count: number;
}

const statusTabs = ['ALL', 'PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const statusBadgeClass: Record<string, string> = {
    PLACED: 'admin-badge admin-badge-info',
    PROCESSING: 'admin-badge admin-badge-warning',
    SHIPPED: 'admin-badge admin-badge-default',
    DELIVERED: 'admin-badge admin-badge-success',
    CANCELLED: 'admin-badge admin-badge-danger',
};

export default function OrdersPage() {
    const [activeTab, setActiveTab] = useState('ALL');
    const router = useRouter();

    const { data, isLoading } = useQuery<{ orders: OrderItem[] }>({
        queryKey: ['admin-orders', activeTab],
        queryFn: async () => {
            const qs = activeTab !== 'ALL' ? `?status=${activeTab}` : '';
            const res = await fetch(`/api/admin/orders${qs}`);
            if (!res.ok) throw new Error('Failed');
            return res.json();
        },
    });

    const columns: ColumnDef<OrderItem, any>[] = [
        {
            accessorKey: 'order_code',
            header: 'Order Code',
            cell: ({ getValue }) => (
                <span style={{ color: '#ffffff', fontWeight: 500, fontFamily: 'monospace' }}>
                    {(getValue() as string) || '—'}
                </span>
            ),
        },
        {
            accessorKey: 'user_name',
            header: 'Customer',
            cell: ({ row }) => (
                <div>
                    <div style={{ color: '#fafafa', fontWeight: 500 }}>{row.original.user_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#71717a' }}>{row.original.user_email}</div>
                </div>
            ),
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
            cell: ({ getValue }) => (
                <span style={{ fontWeight: 500 }}>${(getValue() as number).toFixed(2)}</span>
            ),
        },
        {
            accessorKey: 'order_time',
            header: 'Date',
            cell: ({ getValue }) =>
                new Date(getValue() as string).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                }),
        },
    ];

    return (
        <div>
            <motion.h1
                className="admin-page-title"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                Order Management
            </motion.h1>

            <div className="admin-tabs">
                {statusTabs.map((tab) => (
                    <button
                        key={tab}
                        className={`admin-tab ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="admin-skeleton" style={{ height: '500px' }} />
            ) : (
                <DataTable
                    data={data?.orders || []}
                    columns={columns}
                    searchPlaceholder="Search orders..."
                    onRowClick={(row) => router.push(`/admin/orders/${row.order_id}`)}
                />
            )}
        </div>
    );
}
