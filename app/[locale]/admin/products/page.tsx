'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { motion } from 'framer-motion';
import DataTable from '@/components/admin/DataTable';
import ProductFormDrawer from '@/components/admin/ProductFormDrawer';
import { Plus, Trash2, Edit } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';

interface ProductItem {
    item_id: number;
    item_name: string;
    item_price: number;
    item_discount: number | null;
    item_code: string | null;
    item_image: string | null;
    brand_name: string | null;
    category_name: string | null;
    material_name: string | null;
    variant_count: number;
}

interface LookupData {
    categories: { category_id: number; category_name: string }[];
    brands: { brand_id: number; brand_name: string }[];
    materials: { material_id: number; material_name: string }[];
    colors: { color_id: number; color_name: string }[];
    sizes: { size_id: number; size_name: string }[];
}

export default function ProductsPage() {
    const queryClient = useQueryClient();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);

    const { data: productData, isLoading } = useQuery<{ items: ProductItem[] }>({
        queryKey: ['admin-products'],
        queryFn: async () => {
            const res = await fetch('/api/admin/products');
            if (!res.ok) throw new Error('Failed');
            return res.json();
        },
    });

    const { data: lookups } = useQuery<LookupData>({
        queryKey: ['admin-lookups'],
        queryFn: async () => {
            const res = await fetch('/api/admin/lookups');
            if (!res.ok) throw new Error('Failed');
            return res.json();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed');
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
    });

    const handleCreate = async (data: any) => {
        const res = await fetch('/api/admin/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Create failed');
        }
        queryClient.invalidateQueries({ queryKey: ['admin-products'] });
        queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
    };

    const handleEdit = async (itemId: number) => {
        const res = await fetch(`/api/admin/products/${itemId}`);
        if (!res.ok) return;
        const data = await res.json();
        setEditItem(data);
        setDrawerOpen(true);
    };

    const handleUpdate = async (data: any) => {
        if (!editItem) return;
        const res = await fetch(`/api/admin/products/${editItem.item_id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Update failed');
        }
        queryClient.invalidateQueries({ queryKey: ['admin-products'] });
        queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
        setEditItem(null);
    };

    const columns: ColumnDef<ProductItem, any>[] = [
        {
            accessorKey: 'item_id',
            header: 'ID',
            cell: ({ getValue }) => (
                <span style={{ color: '#71717a', fontFamily: 'monospace' }}>#{getValue()}</span>
            ),
        },
        {
            accessorKey: 'item_name',
            header: 'Product Name',
            cell: ({ getValue }) => (
                <span style={{ color: '#ffffff', fontWeight: 500 }}>{getValue() as string}</span>
            ),
        },
        {
            accessorKey: 'item_price',
            header: 'Price',
            cell: ({ row }) => {
                const price = row.original.item_price;
                const discount = row.original.item_discount;
                return (
                    <span>
                        ${price.toFixed(2)}
                        {discount && discount > 0 && (
                            <span style={{ color: '#4ade80', marginLeft: '0.5rem', fontSize: '0.75rem' }}>
                                -${discount.toFixed(2)}
                            </span>
                        )}
                    </span>
                );
            },
        },
        {
            accessorKey: 'brand_name',
            header: 'Brand',
            cell: ({ getValue }) => getValue() || <span style={{ color: '#3f3f46' }}>—</span>,
        },
        {
            accessorKey: 'category_name',
            header: 'Category',
            cell: ({ getValue }) => getValue() || <span style={{ color: '#3f3f46' }}>—</span>,
        },
        {
            accessorKey: 'variant_count',
            header: 'Variants',
            cell: ({ getValue }) => (
                <span className="admin-badge admin-badge-default">{getValue() as number}</span>
            ),
        },
        {
            id: 'actions',
            header: '',
            enableSorting: false,
            cell: ({ row }) => (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        className="admin-btn admin-btn-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(row.original.item_id);
                        }}
                    >
                        <Edit size={14} />
                    </button>
                    <button
                        className="admin-btn admin-btn-sm admin-btn-danger"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete "${row.original.item_name}"?`)) {
                                deleteMutation.mutate(row.original.item_id);
                            }
                        }}
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            ),
        },
    ];

    if (isLoading) {
        return (
            <div>
                <h1 className="admin-page-title">Product Factory</h1>
                <div className="admin-skeleton" style={{ height: '500px' }} />
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
                Product Factory
            </motion.h1>

            <DataTable
                data={productData?.items || []}
                columns={columns}
                searchPlaceholder="Search products..."
                toolbar={
                    <button
                        className="admin-btn admin-btn-primary"
                        onClick={() => {
                            setEditItem(null);
                            setDrawerOpen(true);
                        }}
                    >
                        <Plus size={16} />
                        Create Product
                    </button>
                }
            />

            {lookups && (
                <ProductFormDrawer
                    isOpen={drawerOpen}
                    onClose={() => {
                        setDrawerOpen(false);
                        setEditItem(null);
                    }}
                    onSubmit={editItem ? handleUpdate : handleCreate}
                    lookups={lookups}
                    editData={editItem}
                />
            )}
        </div>
    );
}
