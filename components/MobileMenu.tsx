// components/MobileMenu.tsx
'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function MobileMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();
    const { itemCount } = useCart();
    const tNav = useTranslations('nav');
    const tFooter = useTranslations('footer');
    const tCommon = useTranslations('common');

    const navLinks = [
        { href: '/search?audience=WOMEN', label: tNav('women') },
        { href: '/search?audience=MEN', label: tNav('men') },
        { href: '/search?audience=KIDS', label: tNav('kids') },
        { href: '/search', label: tNav('search') },
    ];

    const accountLinks = user
        ? [
            { href: '/profile', label: tNav('profile') },
            { href: '/profile/orders', label: tNav('orders') },
        ]
        : [
            { href: '/auth/login', label: tNav('logIn') },
            { href: '/auth/register', label: tNav('register') },
        ];

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="md:hidden p-2 -ml-2 text-gray-600 hover:text-black transition"
                aria-label={tNav('openMenu')}
            >
                <Bars3Icon className="h-6 w-6" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Slide-out panel */}
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white z-50 shadow-xl flex flex-col"
                        >
                            <div className="flex items-center justify-between px-4 h-[var(--header-height)] border-b">
                                <span className="text-2xl font-extrabold tracking-widest">{tCommon('brandName')}</span>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 text-gray-600 hover:text-black transition"
                                    aria-label={tNav('closeMenu')}
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            <nav className="flex-1 overflow-y-auto py-4">
                                <div className="px-4 mb-2">
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{tNav('shop')}</p>
                                </div>
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsOpen(false)}
                                        className="block px-4 py-3 text-lg text-gray-900 hover:bg-gray-50 transition"
                                    >
                                        {link.label}
                                    </Link>
                                ))}

                                <div className="border-t my-4" />

                                <div className="px-4 mb-2">
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{tNav('account')}</p>
                                </div>
                                {accountLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsOpen(false)}
                                        className="block px-4 py-3 text-lg text-gray-900 hover:bg-gray-50 transition"
                                    >
                                        {link.label}
                                    </Link>
                                ))}

                                <Link
                                    href="/wishlist"
                                    onClick={() => setIsOpen(false)}
                                    className="block px-4 py-3 text-lg text-gray-900 hover:bg-gray-50 transition"
                                >
                                    {tNav('wishlist')}
                                </Link>

                                <Link
                                    href="/cart"
                                    onClick={() => setIsOpen(false)}
                                    className="block px-4 py-3 text-lg text-gray-900 hover:bg-gray-50 transition"
                                >
                                    {tNav('cart')} {itemCount > 0 && <span className="text-sm text-gray-500">({itemCount})</span>}
                                </Link>
                            </nav>

                            <div className="border-t px-4 py-4">
                                <div className="flex space-x-4 text-sm text-gray-500">
                                    <Link href="/about" onClick={() => setIsOpen(false)} className="hover:text-black">{tFooter('about')}</Link>
                                    <Link href="/contact" onClick={() => setIsOpen(false)} className="hover:text-black">{tFooter('contact')}</Link>
                                    <Link href="/privacy" onClick={() => setIsOpen(false)} className="hover:text-black">{tFooter('privacy')}</Link>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
