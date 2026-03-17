import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import Footer from '@/components/Footer';
import LayoutHeader from '@/components/LayoutHeader';
import { Toaster } from 'react-hot-toast';
import '@/styles/globals.css';
import { getSession, getCart } from '@/app/actions';
import { Providers } from '@/context/Providers';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
    title: 'TEKU — Premium Clothing',
    description: 'Modern premium clothing store built with Next.js',
};

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    // Validate locale
    if (!routing.locales.includes(locale as 'en' | 'ru')) {
        notFound();
    }

    setRequestLocale(locale);

    const messages = await getMessages();
    const user = await getSession();
    const cartItems = (await getCart()).items;
    const bodyClass = user ? 'user-logged-in' : 'guest-user';

    return (
        <html lang={locale}>
            <body className={`${inter.className} ${bodyClass} bg-white text-black`}>
                <NextIntlClientProvider messages={messages}>
                    <Providers user={user} cart={cartItems}>
                        <div className="flex flex-col min-h-screen">
                            <Toaster />
                            <LayoutHeader />
                            <main className="flex-grow">
                                {children}
                            </main>
                            <Footer />
                        </div>
                    </Providers>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
