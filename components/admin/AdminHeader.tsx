'use client';

import { User } from '@/types';
import { LogOut } from 'lucide-react';
import { logout } from '@/app/actions';

interface AdminHeaderProps {
    user: User;
}

export default function AdminHeader({ user }: AdminHeaderProps) {
    return (
        <div className="admin-topbar">
            <div className="admin-logo">
                TEKU<span>.admin</span>
            </div>

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.8125rem', color: '#a1a1aa' }}>
                    {user.name}
                </span>
                <form action={logout}>
                    <button
                        type="submit"
                        className="admin-btn admin-btn-sm"
                        title="Logout"
                    >
                        <LogOut size={14} />
                    </button>
                </form>
            </div>
        </div>
    );
}
