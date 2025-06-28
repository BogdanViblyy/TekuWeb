// components/Header.tsx
import Link from 'next/link';
import { getSession } from '@/app/actions';
import HeaderClientComponents from './HeaderClientComponents';

export default async function Header() {
  const user = await getSession();

  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-white bg-opacity-95 shadow-sm backdrop-blur-md">
      {!user && (
        <div className="bg-black text-white text-center py-2 text-sm">
          <Link href="/auth/login" className="hover:underline">
            Log in for a personalized experience
          </Link>
        </div>
      )}
      
      <nav aria-label="Top" className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* --- ИЗМЕНЕНИЕ ЗДЕСЬ --- */}
        {/* Удален класс `border-b border-gray-200` с этого div */}
        <div>
          <div className="flex h-16 items-center justify-between">
            <div className="flex flex-1"></div>
            <div className="flex-shrink-0">
              <Link href="/">
                <span className="sr-only">Teku</span>
                <h1 className="text-4xl font-extrabold tracking-widest text-gray-900">
                  TEKU
                </h1>
              </Link>
            </div>
            <HeaderClientComponents />
          </div>
        </div>
      </nav>
    </header>
  );
}