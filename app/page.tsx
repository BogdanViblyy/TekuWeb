// app/page.tsx -> внутри компонента Intro

'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, useAnimationControls, Variants } from 'framer-motion';
import { useWindowCenter } from '@/hooks/useWindowCenter';

// Внутри файла app/page.tsx, компонент Intro

function Intro() {
  const [isVisible, setIsVisible] = useState(true);
  const letterControls = [
    useAnimationControls(), useAnimationControls(), useAnimationControls(), useAnimationControls(),
  ];
  const letterRefs = [
    useRef<HTMLSpanElement>(null), useRef<HTMLSpanElement>(null), useRef<HTMLSpanElement>(null), useRef<HTMLSpanElement>(null),
  ];
  const windowCenter = useWindowCenter();
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current || windowCenter.x === 0 || windowCenter.y === 0) {
      return;
    }

    hasAnimated.current = true;
    document.body.style.overflow = 'hidden';

    const sequence = async () => {
      await new Promise(r => setTimeout(r, 50));
      const widths = letterRefs.map(ref => ref.current?.getBoundingClientRect().width || 0);
      const heights = letterRefs.map(ref => ref.current?.getBoundingClientRect().height || 0);

      const initialPositions = [
        // --- ВАШЕ ИСПРАВЛЕНИЕ ПРИМЕНЕНО ---
        // Множитель 1.2 убран для идеального центрирования по вертикали.
        { x: windowCenter.x - (widths[0] / 2), y: windowCenter.y - (heights[0] / 2 * 1) },
        { x: windowCenter.x, y: windowCenter.y - (heights[1] / 2) },
        { x: windowCenter.x, y: windowCenter.y - (heights[2] / 2) },
        { x: windowCenter.x, y: windowCenter.y - (heights[3] / 2) },
      ];
      letterControls.forEach((control, i) => {
        control.set({ x: initialPositions[i].x, y: initialPositions[i].y });
      });

      await letterControls[0].start({ opacity: 1, scale: 1.2 }, { duration: 1, ease: 'easeOut', delay: 0.2 });
      await new Promise(r => setTimeout(r, 200));
      
      const teWidth = widths[0] + widths[1];
      await Promise.all([
        letterControls[0].start({ scale: 1, x: windowCenter.x - teWidth / 2 }, { duration: 0.5, ease: 'easeOut' }),
        letterControls[1].start({ opacity: 1, x: windowCenter.x + widths[0] - teWidth / 2 }, { duration: 0.4, delay: 0.1 }),
      ]);

      const tekWidth = teWidth + widths[2];
      await Promise.all([
        letterControls[0].start({ x: windowCenter.x - tekWidth / 2 }, { duration: 0.4, ease: 'easeOut' }),
        letterControls[1].start({ x: windowCenter.x + widths[0] - tekWidth / 2 }, { duration: 0.4, ease: 'easeOut' }),
        letterControls[2].start({ opacity: 1, x: windowCenter.x + teWidth - tekWidth / 2 }, { duration: 0.4, delay: 0.1 }),
      ]);
      
      const tekuWidth = tekWidth + widths[3];
      await Promise.all([
        letterControls[0].start({ x: windowCenter.x - tekuWidth / 2 }, { duration: 0.4, ease: 'easeOut' }),
        letterControls[1].start({ x: windowCenter.x + widths[0] - tekuWidth / 2 }, { duration: 0.4, ease: 'easeOut' }),
        letterControls[2].start({ x: windowCenter.x + teWidth - tekuWidth / 2 }, { duration: 0.4, ease: 'easeOut' }),
        letterControls[3].start({ opacity: 1, x: windowCenter.x + tekWidth - tekuWidth / 2 }, { duration: 0.4, delay: 0.1 }),
      ]);
      
      await new Promise(r => setTimeout(r, 1000));
      
      await Promise.all(letterControls.map(control => control.start({ opacity: 0 }, { duration: 0.5 })));
      
      setIsVisible(false);
    };
    
    sequence();
    
    return () => { document.body.style.overflow = 'auto'; };
  }, [windowCenter]);

  return (
      <AnimatePresence onExitComplete={() => document.body.style.overflow = 'auto'}>
          {isVisible && (
              <div className="fixed inset-0 bg-black z-50">
                  {"TEKU".split("").map((char, index) => (
                      <motion.span
                          ref={letterRefs[index]}
                          key={index}
                          className="fixed top-0 left-0 text-white font-black text-9xl"
                          initial={{ opacity: 0 }}
                          animate={letterControls[index]}
                      >
                          {char}
                      </motion.span>
                  ))}
              </div>
          )}
      </AnimatePresence>
  );
}
// --- Компоненты HomePage и AudienceCard остаются без изменений ---
function AudienceCard({ href, imgSrc, title, textColor = 'text-black' }: { href: string; imgSrc: string; title: string; textColor?: string }) {
  return (
    <Link href={href} className="block group transition-transform duration-300 ease-in-out hover:scale-105 focus:outline-none">
        <div className="relative aspect-[3/4] w-full overflow-hidden">
            <Image src={imgSrc} alt={title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" priority />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-10 transition-opacity duration-300 group-hover:opacity-0">
                <h2 className={`text-3xl md:text-2xl lg:text-3xl font-extrabold uppercase tracking-widest ${textColor}`}>{title}</h2>
            </div>
        </div>
    </Link>
  );
}

export default function HomePage() {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
      const timer = setTimeout(() => {
          setShowContent(true);
      }, 4000); // Подбираем время под новую анимацию
      return () => clearTimeout(timer);
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const itemVariants: Variants = {
      hidden: { y: 20, opacity: 0 },
      visible: { y: 0, opacity: 1 },
  };
  
  return (
    <>
      <Intro />
      <motion.div
          className="w-full"
          variants={containerVariants}
          initial="hidden"
          animate={showContent ? "visible" : "hidden"}
      >
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
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
    </>
  );
}