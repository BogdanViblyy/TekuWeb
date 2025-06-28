// components/Header.tsx
'use client'; // <-- 1. Делаем компонент клиентским

import Link from 'next/link';
import HeaderClientComponents from './HeaderClientComponents';
import { motion } from 'framer-motion'; // <-- 2. Импортируем motion
import { User } from '@/types';

// 3. Принимаем user как prop
export default function Header({ user }: { user: User | null }) {
  return (
    // 4. Оборачиваем header в motion.header и добавляем анимацию
    <motion.header 
      initial={{ y: -100, opacity: 0 }} // Начальное состояние: за пределами экрана сверху и прозрачный
      animate={{ y: 0, opacity: 1 }}     // Финальное состояние: на своем месте и непрозрачный
      transition={{ duration: 0.5, ease: "easeOut" }} // Параметры анимации
      className="fixed top-0 left-0 right-0 z-30 bg-white bg-opacity-95 shadow-sm backdrop-blur-md"
    >
      {!user && (
        <div className="bg-black text-white text-center py-2 text-sm">
          <Link href="/auth/login" className="hover:underline">
            Log in for a personalized experience
          </Link>
        </div>
      )}
      
      <nav aria-label="Top" className="container mx-auto px-4 sm:px-6 lg:px-8">
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
    </motion.header>
  );
}