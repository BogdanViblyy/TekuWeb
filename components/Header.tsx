// components/Header.tsx
import Link from 'next/link';
import HeaderClientComponents from './HeaderClientComponents';
import { User } from '@/types';

export default function Header({ user }: { user: User | null }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-white shadow-sm">
      {!user && (
        <div className="bg-black text-white text-center py-2 text-sm h-[var(--banner-height)] flex items-center justify-center">
          <Link href="/auth/login" className="hover:underline">
            Log in for a personalized experience
          </Link>
        </div>
      )}
      <nav aria-label="Top" className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-[var(--header-height)] items-center justify-between">
          <div className="flex flex-1"></div>
          <div className="flex-shrink-0">
            <Link href="/">
              <span className="sr-only">Teku</span>
              {/* Этот логотип будет изначально скрыт под анимированным */}
              <h1 className="text-4xl font-extrabold tracking-widest text-black">TEKU</h1>
            </Link>
          </div>
          <HeaderClientComponents />
        </div>
      </nav>
    </header>
  );
}