// components/StorefrontShell.tsx
'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import LayoutHeader from './LayoutHeader';
import Footer from './Footer';
import { Toaster } from 'react-hot-toast';

export default function StorefrontShell({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    // Admin routes use their own layout — skip storefront chrome
    const isAdmin = pathname.includes('/admin');

    if (isAdmin) {
        return <>{children}</>;
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Toaster />
            <LayoutHeader />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
        </div>
    );
}
