'use client';

import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    flexRender,
    type ColumnDef,
    type SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface DataTableProps<T> {
    data: T[];
    columns: ColumnDef<T, any>[];
    searchPlaceholder?: string;
    searchColumn?: string;
    pageSize?: number;
    onRowClick?: (row: T) => void;
    toolbar?: React.ReactNode;
}

export default function DataTable<T>({
    data,
    columns,
    searchPlaceholder = 'Search...',
    searchColumn,
    pageSize = 20,
    onRowClick,
    toolbar,
}: DataTableProps<T>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            globalFilter: searchColumn ? undefined : globalFilter,
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: { pageSize },
        },
    });

    return (
        <div className="admin-table-wrap">
            <div className="admin-toolbar">
                <input
                    type="text"
                    className="admin-search"
                    placeholder={searchPlaceholder}
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                />
                {toolbar}
            </div>

            <table className="admin-table">
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th
                                    key={header.id}
                                    onClick={header.column.getToggleSortingHandler()}
                                    style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                        {header.column.getCanSort() && (
                                            <span style={{ display: 'inline-flex' }}>
                                                {{
                                                    asc: <ChevronUp size={14} />,
                                                    desc: <ChevronDown size={14} />,
                                                }[header.column.getIsSorted() as string] ?? (
                                                    <ChevronsUpDown size={14} style={{ opacity: 0.3 }} />
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    <AnimatePresence>
                        {table.getRowModel().rows.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    style={{ textAlign: 'center', padding: '3rem', color: '#71717a' }}
                                >
                                    No results found
                                </td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <motion.tr
                                    key={row.id}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                    onClick={() => onRowClick?.(row.original)}
                                    style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </motion.tr>
                            ))
                        )}
                    </AnimatePresence>
                </tbody>
            </table>

            <div className="admin-pagination">
                <span>
                    Page {table.getState().pagination.pageIndex + 1} of{' '}
                    {table.getPageCount() || 1}
                    {' · '}
                    {table.getFilteredRowModel().rows.length} total
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        className="admin-btn admin-btn-sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        style={{ opacity: table.getCanPreviousPage() ? 1 : 0.3 }}
                    >
                        <ChevronLeft size={14} />
                    </button>
                    <button
                        className="admin-btn admin-btn-sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        style={{ opacity: table.getCanNextPage() ? 1 : 0.3 }}
                    >
                        <ChevronRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}
