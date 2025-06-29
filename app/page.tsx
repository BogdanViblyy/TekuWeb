'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useIntro } from '@/context/IntroContext';
import Intro from '@/components/Intro';
import Header from '@/components/Header';
import { getSession } from '@/app/actions';
import { User } from '@/types';
import { useContentAnimation } from '@/context/ContentAnimationContext';

function AudienceCard({ href, imgSrc, title, textColor = 'text-black' }: { href: string; imgSrc: string; title: string; textColor?: string }) {
  return (
    <Link href={href} className="block group transition-transform duration-300 ease-in-out hover:scale-105 focus:outline-none">
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <Image
          src={imgSrc}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-10 transition-opacity duration-300 group-hover:opacity-0">
          <h2 className={`text-3xl md:text-2xl lg:text-3xl font-extrabold uppercase tracking-widest ${textColor}`}>
            {title}
          </h2>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const { isIntroFinished } = useIntro();
  const { shouldAnimateContent, contentKey, resetContentAnimation } = useContentAnimation();
  const [user, setUser] = useState<User | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const fetchUser = async () => {
      const session = await getSession();
      setUser(session);
    };
    fetchUser();
    
    // Сбрасываем анимацию контента при каждой загрузке
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

  const handleIntroComplete = () => {
    // Дополнительные действия после завершения интро
  };

  if (!isClient) {
    return <div className="min-h-screen bg-gray-100" />;
  }

  return (
    <div className="relative min-h-screen">
      <Header user={user} isIntroFinished={isIntroFinished} />
      
      {!isIntroFinished && (
        <Intro 
          onComplete={handleIntroComplete} 
          user={user} 
        />
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
            <motion.div variants={itemVariants}><AudienceCard href="/products/men" imgSrc="/images/menswear.jpg" title="Menswear" /></motion.div>
            <motion.div variants={itemVariants}><AudienceCard href="/products/women" imgSrc="/images/womenswear.jpg" title="Womenswear" /></motion.div>
            <motion.div variants={itemVariants}><AudienceCard href="/products/kids" imgSrc="/images/kidswear.jpg" title="Kidswear" textColor="text-white" /></motion.div>
          </div>
          <motion.div variants={itemVariants} className="border-t border-gray-200 mt-8"></motion.div>
        </div>
        <motion.footer variants={itemVariants} className="text-center pb-8"><p className="text-sm text-gray-500 italic">Style is everything.</p></motion.footer>
      </motion.div>
    </div>
  );
}