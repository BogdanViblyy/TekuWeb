// components/HomepageAnimation.tsx
'use client';

import { motion, Variants } from 'framer-motion';

// Определяем варианты только для контейнера
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

// Варианты для дочерних элементов теперь будут в самих дочерних компонентах
export default function HomepageAnimation({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
}

// Экспорт itemVariants больше не нужен здесь
export const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};