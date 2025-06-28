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
  const [user, cartData] = await Promise.all([
    getSession(),
    getCart()
  ]);
  
  const cartItems = cartData ? cartData.items : [];
  const mainPaddingTop = user ? 'pt-16' : 'pt-24';

  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-black flex flex-col min-h-screen`}>
        <Providers user={user} cart={cartItems}>
          <Toaster position="top-center" />
          {/* Теперь Header будет получать user как prop */}
          <Header user={user} />
          <main className={`${mainPaddingTop} flex-grow`}>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}