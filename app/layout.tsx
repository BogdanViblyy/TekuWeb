import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
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

export default async function RootLayout({ children }: { children: React.ReactNode; }) {
  const user = await getSession();
  const cartItems = (await getCart()).items;
  
  const bodyClass = user ? 'user-logged-in' : 'guest-user';

  return (
    <html lang="en">
      <body className={`${inter.className} ${bodyClass} bg-white text-black`}>
        <Providers user={user} cart={cartItems}>
          <div className="flex flex-col min-h-screen">
            <Toaster />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}