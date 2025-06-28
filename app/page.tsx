// app/page.tsx
// Этот файл теперь серверный, никаких импортов 'framer-motion' или 'use client'
import HomepageAnimation from '@/components/HomepageAnimation';
import AnimatedAudienceCard from '@/components/AnimatedAudienceCard';
import { motion } from 'framer-motion'; // УДАЛЯЕМ ЭТОТ ИМПОРТ
import { itemVariants } from '@/components/HomepageAnimation'; // И ЭТОТ

export default function HomePage() {
  return (
    <HomepageAnimation>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Анимированный разделитель. Так как он использует motion, его тоже нужно вынести. */}
        {/* Для простоты пока уберем его анимацию. */}
        <div className="border-b border-gray-200 mb-8"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Используем наш новый анимированный клиентский компонент */}
          <AnimatedAudienceCard href="/products/men" imgSrc="/images/menswear.jpg" title="Menswear" />
          <AnimatedAudienceCard href="/products/women" imgSrc="/images/womenswear.jpg" title="Womenswear" />
          <AnimatedAudienceCard href="/products/kids" imgSrc="/images/kidswear.jpg" title="Kidswear" textColor="text-white" />
        </div>
        
        <div className="border-t border-gray-200 mt-8"></div>
      </div>
    </HomepageAnimation>
  );
}