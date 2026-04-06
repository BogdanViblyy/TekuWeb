'use client';

import { motion, Variants } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useIntro } from '@/context/IntroContext';
import Intro from '@/components/Intro';
import AudienceCard from '@/components/AudienceCard';
import { useContentAnimation } from '@/context/ContentAnimationContext';
import { useTranslations } from 'next-intl';

export default function HomePage() {
  const { isIntroFinished } = useIntro();
  const { shouldAnimateContent, contentKey, resetContentAnimation } = useContentAnimation();
  const [isClient, setIsClient] = useState(false);
  const tHome = useTranslations('home');
  const tCommon = useTranslations('common');

  useEffect(() => {
    setIsClient(true);
    resetContentAnimation();
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delay: 0.2 } },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  if (!isClient) {
    return <div className="min-h-screen bg-gray-100" />;
  }

  return (
    <div className="relative min-h-screen">
      {!isIntroFinished && (
        <Intro />
      )}

      {/* Контент страницы с анимацией */}
      <motion.div
        key={contentKey}
        className="w-full"
        variants={containerVariants}
        initial="hidden"
        animate={shouldAnimateContent ? "visible" : "hidden"}
      >
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 pt-[calc(var(--header-total-height)+3rem)]">
          <motion.div variants={itemVariants} className="border-b border-gray-200 mb-8"></motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div variants={itemVariants}><AudienceCard href="/products/men" imgSrc="/images/menswear.jpg" title={tHome('menswear')} /></motion.div>
            <motion.div variants={itemVariants}><AudienceCard href="/products/women" imgSrc="/images/womenswear.jpg" title={tHome('womenswear')} /></motion.div>
            <motion.div variants={itemVariants}><AudienceCard href="/products/kids" imgSrc="/images/kidswear.jpg" title={tHome('kidswear')} textColor="text-white" /></motion.div>
          </div>
          <motion.div variants={itemVariants} className="border-t border-gray-200 mt-8"></motion.div>
        </div>
        <motion.footer variants={itemVariants} className="text-center pb-8"><p className="text-sm text-gray-500 italic">{tCommon('styleIsEverything')}</p></motion.footer>
      </motion.div>
    </div>
  );
}