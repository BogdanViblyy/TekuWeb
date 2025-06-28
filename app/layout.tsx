// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Toaster } from 'react-hot-toast';
import '@/styles/globals.css';
import { getSession, getCart } from '@/app/actions';
import { Providers } from '@/context/Providers';
import { User, CartItem } from '@/types';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Teku Clothing Store',
  description: 'Modern clothing web store built with Next.js',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  const cartItems = (await getCart()).items;
  
  const paddingTopClass = user ? 'pt-16' : 'pt-24';

  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-black`}>
        {/* Providers теперь снова в простом виде */}
        <Providers user={user} cart={cartItems}>
          <div className="flex flex-col min-h-screen">
            <Header user={user} />
            <Toaster position="top-center" />
            <main className={`${paddingTopClass} flex-grow`}>
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}