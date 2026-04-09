'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
}

export default function StatCard({ label, value, subtitle, icon: Icon }: StatCardProps) {
    return (
        <motion.div
            className="admin-stat-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div className="admin-stat-label">{label}</div>
                    <div className="admin-stat-value">{value}</div>
                    {subtitle && <div className="admin-stat-sub">{subtitle}</div>}
                </div>
                <Icon
                    size={20}
                    strokeWidth={1.5}
                    style={{ color: '#3f3f46', marginTop: '0.25rem' }}
                />
            </div>
        </motion.div>
    );
}
