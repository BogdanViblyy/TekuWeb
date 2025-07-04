// components/Header.tsx
import Link from 'next/link';
import HeaderClientComponents from './HeaderClientComponents';
import { User } from '@/types';
import { forwardRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  user: User | null;
  isIntroFinished: boolean;
}

const Header = forwardRef<HTMLDivElement, HeaderProps>(({ user, isIntroFinished }, ref) => {
  const [showBanner, setShowBanner] = useState(false);
  
  useEffect(() => {
    if (isIntroFinished && !user) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isIntroFinished, user]);

  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-white shadow-sm">
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'var(--banner-height)', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-black text-white text-center overflow-hidden"
          >
            <div className="h-[var(--banner-height)] flex items-center justify-center">
              <Link href="/auth/login" className="hover:underline text-sm">
                Log in for a personalized experience
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav aria-label="Top" className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-[var(--header-height)] items-center relative">
          {/* Абсолютное центрирование логотипа */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Link href="/">
              <span className="sr-only">Teku</span>
              <div ref={ref}>
                <h1 className="text-4xl font-extrabold tracking-widest text-black">
                  TEKU
                </h1>
              </div>
            </Link>
          </div>
          
          {/* Блок для элементов справа */}
          <div className="ml-auto">
            <HeaderClientComponents />
          </div>
        </div>
      </nav>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;