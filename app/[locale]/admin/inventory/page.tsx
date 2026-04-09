'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import DataTable from '@/components/admin/DataTable';
import { Save, Package } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';

interface InventoryItem {
    id: number;
    item_id: number;
    item_name: string;
    item_price: number;
    item_discount: number | null;
    item_code: string | null;
    color_name: string;
    size_name: string;
    product_quantity: number;
}

export default function InventoryPage() {
    const queryClient = useQueryClient();
    const [editedRows, setEditedRows] = useState<Record<number, Partial<InventoryItem>>>({});
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    const { data, isLoading } = useQuery<{ products: InventoryItem[] }>({
        queryKey: ['admin-inventory'],
        queryFn: async () => {
            const res = await fetch('/api/admin/inventory');
            if (!res.ok) throw new Error('Failed');
            return res.json();
        },
    });

    const bulkMutation = useMutation({
        mutationFn: async (updates: any[]) => {
            const res = await fetch('/api/admin/inventory', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ updates }),
            });
            if (!res.ok) throw new Error('Update failed');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
            setEditedRows({});
            setSelectedIds(new Set());
        },
    });

    const handleQuantityChange = useCallback((id: number, value: number) => {
        setEditedRows((prev) => ({
            ...prev,
            [id]: { ...prev[id], id, product_quantity: value },
        }));
    }, []);

    const handleSave = () => {
        const updates = Object.values(editedRows).map((row) => ({
            id: row.id,
            item_id: data?.products.find((p) => p.id === row.id)?.item_id,
            product_quantity: row.product_quantity,
        }));
        bulkMutation.mutate(updates);
    };

    const toggleSelect = (id: number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const hasChanges = Object.keys(editedRows).length > 0;

    const columns: ColumnDef<InventoryItem, any>[] = [
        {
            id: 'select',
            header: () => <input type="checkbox" className="admin-checkbox" />,
            cell: ({ row }) => (
                <input
                    type="checkbox"
                    className="admin-checkbox"
                    checked={selectedIds.has(row.original.id)}
                    onChange={() => toggleSelect(row.original.id)}
                />
            ),
            enableSorting: false,
        },
        {
            accessorKey: 'item_name',
            header: 'Product',
            cell: ({ getValue }) => (
                <span style={{ color: '#ffffff', fontWeight: 500 }}>{getValue() as string}</span>
            ),
        },
        {
            accessorKey: 'item_code',
            header: 'SKU',
            cell: ({ getValue }) => (
                <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: '#71717a' }}>
                    {(getValue() as string) || '—'}
                </span>
            ),
        },
        {
            accessorKey: 'color_name',
            header: 'Color',
        },
        {
            accessorKey: 'size_name',
            header: 'Size',
        },
        {
            accessorKey: 'item_price',
            header: 'Price',
            cell: ({ row }) => {
                const price = row.original.item_price;
                const discount = row.original.item_discount;
                const effective = discount ? price - discount : price;
                return (
                    <span>
                        ${effective.toFixed(2)}
                        {discount && discount > 0 && (
                            <span style={{ textDecoration: 'line-through', color: '#3f3f46', marginLeft: '0.5rem', fontSize: '0.75rem' }}>
                                ${price.toFixed(2)}
                            </span>
                        )}
                    </span>
                );
            },
        },
        {
            accessorKey: 'product_quantity',
            header: 'Stock',
            cell: ({ row }) => {
                const original = row.original;
                const edited = editedRows[original.id];
                const qty = edited?.product_quantity ?? original.product_quantity;

                return (
                    <input
                        type="number"
                        className="admin-inline-input"
                        value={qty}
                        onChange={(e) => handleQuantityChange(original.id, parseInt(e.target.value) || 0)}
                        style={{
                            width: '80px',
                            color: edited?.product_quantity !== undefined ? '#4ade80' : undefined,
                        }}
                    />
                );
            },
        },
        {
            id: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const qty = editedRows[row.original.id]?.product_quantity ?? row.original.product_quantity;
                if (qty === 0) return <span className="admin-badge admin-badge-danger">OUT</span>;
                if (qty <= 5) return <span className="admin-badge admin-badge-warning">LOW</span>;
                return <span className="admin-badge admin-badge-success">OK</span>;
            },
        },
    ];

    if (isLoading) {
        return (
            <div>
                <h1 className="admin-page-title">Inventory Grid</h1>
                <div className="admin-skeleton" style={{ height: '600px' }} />
            </div>
        );
    }

    return (
        <div>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}
            >
                <h1 className="admin-page-title" style={{ marginBottom: 0 }}>Inventory Grid</h1>
                {hasChanges && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="admin-btn admin-btn-primary"
                        onClick={handleSave}
                        disabled={bulkMutation.isPending}
                    >
                        <Save size={16} />
                        {bulkMutation.isPending ? 'Saving...' : `Save ${Object.keys(editedRows).length} Changes`}
                    </motion.button>
                )}
            </motion.div>

            <DataTable
                data={data?.products || []}
                columns={columns}
                searchPlaceholder="Search inventory..."
                pageSize={25}
            />
        </div>
    );
}
