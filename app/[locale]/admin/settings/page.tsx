'use client';

import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Monitor, Database, Shield, Globe } from 'lucide-react';

export default function SettingsPage() {
    const { user } = useAuth();

    const systemInfo = [
        { icon: Monitor, label: 'Framework', value: 'Next.js 16.1' },
        { icon: Database, label: 'Database', value: 'MySQL + Prisma 6.x' },
        { icon: Shield, label: 'Auth', value: 'JWT (jose)' },
        { icon: Globe, label: 'i18n', value: 'next-intl (en, ru)' },
    ];

    return (
        <div>
            <motion.h1
                className="admin-page-title"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                Settings
            </motion.h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Admin Profile */}
                <div className="admin-stat-card">
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#a1a1aa', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Admin Profile
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <div className="admin-label">Name</div>
                            <div style={{ color: '#fafafa', fontWeight: 500 }}>{user?.name || '—'}</div>
                        </div>
                        <div>
                            <div className="admin-label">Email</div>
                            <div style={{ color: '#fafafa', fontWeight: 500 }}>{user?.email || '—'}</div>
                        </div>
                        <div>
                            <div className="admin-label">Role</div>
                            <span className="admin-badge admin-badge-success">ADMIN</span>
                        </div>
                    </div>
                </div>

                {/* System Info */}
                <div className="admin-stat-card">
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#a1a1aa', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        System
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {systemInfo.map((info) => (
                            <div key={info.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <info.icon size={16} strokeWidth={1.5} style={{ color: '#3f3f46' }} />
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#71717a' }}>{info.label}</div>
                                    <div style={{ fontSize: '0.875rem', color: '#fafafa' }}>{info.value}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
