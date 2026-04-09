'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { use } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Package } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import AdminOrderTimeline from '@/components/admin/AdminOrderTimeline';

interface OrderDetail {
    order_id: number;
    order_code: string | null;
    order_time: string;
    order_status: string;
    user_name: string;
    user_email: string;
    total: number;
    items: {
        id: number;
        product_name: string;
        color_name: string;
        size_name: string;
        quantity: number;
        price_at_purchase: number;
        discount_on_unit: number;
        image: string | null;
    }[];
    status_history: {
        status: string;
        changedAt: string;
        note: string | null;
    }[];
}

const nextStatusMap: Record<string, string | null> = {
    PLACED: 'PROCESSING',
    PROCESSING: 'SHIPPED',
    SHIPPED: 'DELIVERED',
    DELIVERED: null,
    CANCELLED: null,
};

const statusBadgeClass: Record<string, string> = {
    PLACED: 'admin-badge admin-badge-info',
    PROCESSING: 'admin-badge admin-badge-warning',
    SHIPPED: 'admin-badge admin-badge-default',
    DELIVERED: 'admin-badge admin-badge-success',
    CANCELLED: 'admin-badge admin-badge-danger',
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const queryClient = useQueryClient();

    const { data: order, isLoading } = useQuery<OrderDetail>({
        queryKey: ['admin-order', id],
        queryFn: async () => {
            const res = await fetch(`/api/admin/orders/${id}`);
            if (!res.ok) throw new Error('Failed');
            return res.json();
        },
    });

    const statusMutation = useMutation({
        mutationFn: async (newStatus: string) => {
            const res = await fetch(`/api/admin/orders/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error('Update failed');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-order', id] });
            queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
        },
    });

    if (isLoading || !order) {
        return (
            <div>
                <div className="admin-skeleton" style={{ height: '40px', width: '200px', marginBottom: '2rem' }} />
                <div className="admin-skeleton" style={{ height: '400px' }} />
            </div>
        );
    }

    const nextStatus = nextStatusMap[order.order_status];

    return (
        <div>
            <Link href="/admin/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#71717a', fontSize: '0.875rem', marginBottom: '1.5rem', textDecoration: 'none' }}>
                <ArrowLeft size={16} /> Back to Orders
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Order Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                    <div>
                        <h1 className="admin-page-title" style={{ marginBottom: '0.5rem' }}>
                            {order.order_code || `Order #${order.order_id}`}
                        </h1>
                        <div style={{ fontSize: '0.875rem', color: '#71717a' }}>
                            {order.user_name} · {order.user_email} · {new Date(order.order_time).toLocaleString()}
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span className={statusBadgeClass[order.order_status] || 'admin-badge admin-badge-default'} style={{ fontSize: '0.8125rem', padding: '0.25rem 0.75rem' }}>
                            {order.order_status}
                        </span>
                        {nextStatus && (
                            <button
                                className="admin-btn admin-btn-primary"
                                onClick={() => statusMutation.mutate(nextStatus)}
                                disabled={statusMutation.isPending}
                            >
                                {statusMutation.isPending ? 'Updating…' : `→ ${nextStatus}`}
                            </button>
                        )}
                        {order.order_status !== 'CANCELLED' && order.order_status !== 'DELIVERED' && (
                            <button
                                className="admin-btn admin-btn-danger"
                                onClick={() => {
                                    if (confirm('Cancel this order?')) {
                                        statusMutation.mutate('CANCELLED');
                                    }
                                }}
                                disabled={statusMutation.isPending}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' }}>
                    {/* Items List */}
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Variant</th>
                                    <th>Qty</th>
                                    <th>Unit Price</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((item) => (
                                    <tr key={item.id}>
                                        <td style={{ color: '#fafafa', fontWeight: 500 }}>{item.product_name}</td>
                                        <td>
                                            {item.color_name} / {item.size_name}
                                        </td>
                                        <td>{item.quantity}</td>
                                        <td>
                                            ${(item.price_at_purchase - item.discount_on_unit).toFixed(2)}
                                            {item.discount_on_unit > 0 && (
                                                <span style={{ textDecoration: 'line-through', color: '#3f3f46', marginLeft: '0.5rem', fontSize: '0.75rem' }}>
                                                    ${item.price_at_purchase.toFixed(2)}
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ color: '#fafafa', fontWeight: 500 }}>
                                            ${(item.quantity * (item.price_at_purchase - item.discount_on_unit)).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={4} style={{ textAlign: 'right', fontWeight: 600, color: '#fafafa' }}>
                                        Total
                                    </td>
                                    <td style={{ fontWeight: 700, color: '#ffffff', fontSize: '1.125rem' }}>
                                        ${order.total.toFixed(2)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Timeline */}
                    <div>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#a1a1aa', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Status History
                        </h3>
                        <AdminOrderTimeline
                            history={order.status_history}
                            currentStatus={order.order_status}
                        />
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
