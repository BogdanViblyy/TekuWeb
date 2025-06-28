// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer'; // <-- 1. ИМПОРТИРУЕМ ФУТЕР
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
  let user: User | null = null;
  let cartItems: CartItem[] = [];

  try {
    const [userData, cartData] = await Promise.all([
      getSession(),
      getCart()
    ]);
    
    user = userData;
    cartItems = cartData?.items || [];

  } catch (error) {
    console.error("Failed to fetch initial data in RootLayout:", error);
  }

  const mainPaddingTop = user ? 'pt-16' : 'pt-24';

  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-black flex flex-col min-h-screen`}>
        <Providers user={user} cart={cartItems}>
          <Toaster position="top-center" />
          <Header />
          {/* 
            --- ИЗМЕНЕНИЕ ЗДЕСЬ ---
            1. Добавили `flex-grow` к main, чтобы он занимал все доступное пространство
               и прижимал футер к низу на страницах с малым количеством контента.
          */}
          <main className={`${mainPaddingTop} flex-grow`}>{children}</main>
          
          {/* --- 2. ДОБАВЛЯЕМ ФУТЕР ЗДЕСЬ --- */}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}