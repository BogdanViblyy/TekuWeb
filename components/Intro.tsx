'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { useIntro } from '@/context/IntroContext';
import { useWindowCenter } from '@/hooks/useWindowCenter';
import { User } from '@/types';
import { useContentAnimation } from '@/context/ContentAnimationContext';

interface IntroProps {
  onComplete: () => void;
  user: User | null;
}

export default function Intro({ onComplete, user }: IntroProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [animationStage, setAnimationStage] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [logoRect, setLogoRect] = useState<DOMRect | null>(null);
  const bgControls = useAnimationControls();
  const wordGroupControls = useAnimationControls();
  const letterControls = [
    useAnimationControls(), useAnimationControls(), useAnimationControls(), useAnimationControls()
  ];
  const letterRefs = [
    useRef<HTMLSpanElement>(null), useRef<HTMLSpanElement>(null), useRef<HTMLSpanElement>(null), useRef<HTMLSpanElement>(null)
  ];
  const wordGroupRef = useRef<HTMLDivElement>(null);
  const tempHeaderRef = useRef<HTMLDivElement>(null);
  const { setIsIntroFinished } = useIntro();
  const { setShouldAnimateContent } = useContentAnimation();
  const hasAnimated = useRef(false);
  const windowCenter = useWindowCenter();

  // Инициализация размеров
  useEffect(() => {
    const measureElements = () => {
      if (tempHeaderRef.current) {
        // Получаем высоту хедера
        const height = tempHeaderRef.current.offsetHeight;
        setHeaderHeight(height);

        // Получаем позицию логотипа
        const logoElement = tempHeaderRef.current.querySelector('h1');
        if (logoElement) {
          setLogoRect(logoElement.getBoundingClientRect());
        }
      }
    };

    const timer = setTimeout(measureElements, 150);
    return () => clearTimeout(timer);
  }, []);

  // Основной эффект анимации
  useEffect(() => {
    if (hasAnimated.current) return;
    if (!windowCenter.ready || windowCenter.x === 0 || windowCenter.y === 0) return;
    if (!logoRect || headerHeight === 0) return;

    hasAnimated.current = true;
    document.body.style.overflow = 'hidden';

    const sequence = async () => {
      try {
        // --- АКТ 1-2: СЛОЖНАЯ АНИМАЦИЯ БУКВ ---
        // Даем время на рендер для измерения размеров
        await new Promise(r => setTimeout(r, 50));
        const widths = letterRefs.map(ref => ref.current?.getBoundingClientRect().width || 0);
        const heights = letterRefs.map(ref => ref.current?.getBoundingClientRect().height || 0);

        // АКТ 0: Мгновенное позиционирование невидимых букв
        const initialPositions = [
          { x: windowCenter.x - (widths[0] / 2), y: windowCenter.y - (heights[0] / 2) },
          { x: windowCenter.x, y: windowCenter.y - (heights[1] / 2) },
          { x: windowCenter.x, y: windowCenter.y - (heights[2] / 2) },
          { x: windowCenter.x, y: windowCenter.y - (heights[3] / 2) },
        ];
        letterControls.forEach((control, i) => {
          control.set({ x: initialPositions[i].x, y: initialPositions[i].y });
        });

        // АКТ 1: Появление "Т"
        await letterControls[0].start({ opacity: 1, scale: 1.2 }, { duration: 1, ease: 'easeOut', delay: 0.2 });
        await new Promise(r => setTimeout(r, 200));
        
        // АКТ 2: Появление "E" и центрирование
        const teWidth = widths[0] * 1 + widths[1];
        await Promise.all([
          letterControls[0].start({ scale: 1, x: windowCenter.x - teWidth / 2 }, { duration: 0.5, ease: 'easeOut' }),
          letterControls[1].start({ opacity: 1, x: windowCenter.x + (widths[0] * 1) - teWidth / 2 }, { duration: 0.4, delay: 0.1 }),
        ]);

        // АКТ 3: Появление "K"
        const tekWidth = teWidth + widths[2];
        await Promise.all([
          letterControls[0].start({ x: windowCenter.x - tekWidth / 2 }, { duration: 0.4, ease: 'easeOut' }),
          letterControls[1].start({ x: windowCenter.x + widths[0] - tekWidth / 2 }, { duration: 0.4, ease: 'easeOut' }),
          letterControls[2].start({ opacity: 1, x: windowCenter.x + teWidth - tekWidth / 2 }, { duration: 0.4, delay: 0.1 }),
        ]);
        
        // АКТ 4: Появление "U"
        const tekuWidth = tekWidth + widths[3];
        await Promise.all([
          letterControls[0].start({ x: windowCenter.x - tekuWidth / 2 }, { duration: 0.4, ease: 'easeOut' }),
          letterControls[1].start({ x: windowCenter.x + widths[0] - tekuWidth / 2 }, { duration: 0.4, ease: 'easeOut' }),
          letterControls[2].start({ x: windowCenter.x + teWidth - tekuWidth / 2 }, { duration: 0.4, ease: 'easeOut' }),
          letterControls[3].start({ opacity: 1, x: windowCenter.x + tekWidth - tekuWidth / 2 }, { duration: 0.4, delay: 0.1 }),
        ]);
        
        // Пауза, чтобы показать полное слово
        await new Promise(r => setTimeout(r, 1000));
        
        // --- АКТ 3: ПОДГОТОВКА К ТРАНСФОРМАЦИИ ---
        setAnimationStage(1);
        
        // Запускаем анимацию контента
        setShouldAnimateContent(true);
        
        // --- АКТ 4: ТРАНСФОРМАЦИЯ В ХЕДЕР ---
        setAnimationStage(2);
        
        // Рассчитываем центр группы букв
        const wordGroupRect = wordGroupRef.current?.getBoundingClientRect();
        if (!wordGroupRect) return;
        
        const wordCenterX = wordGroupRect.left + wordGroupRect.width / 2;
        const wordCenterY = wordGroupRect.top + wordGroupRect.height / 2;
        
        // Получаем центр логотипа в хедере
        const logoCenterX = logoRect.left + logoRect.width / 2;
        const logoCenterY = logoRect.top + logoRect.height / 2;
        
        // Вычисляем смещение и масштаб
        const targetX = logoCenterX - wordCenterX;
        const targetY = logoCenterY - wordCenterY;
        const targetScale = Math.min(
          logoRect.width / wordGroupRect.width,
          logoRect.height / wordGroupRect.height
        );
        
        // Анимация фона и группы букв
        await Promise.all([
          bgControls.start({ 
            height: headerHeight,
            y: 0,
            transition: { duration: 0.7, ease: "easeOut" }
          }),
          wordGroupControls.start({
            x: targetX,
            y: targetY,
            scale: targetScale,
            transition: { duration: 0.7, ease: "easeOut" }
          })
        ]);
        
        // --- АКТ 5: ИСЧЕЗНОВЕНИЕ ---
        setAnimationStage(3);
        await new Promise(r => setTimeout(r, 1000));
        
        await Promise.all([
          wordGroupControls.start({ 
            opacity: 0,
            transition: { duration: 0.5 }
          }),
          bgControls.start({ 
            opacity: 0,
            transition: { duration: 0.5 }
          })
        ]);
        
        // Завершаем анимацию
        setIsVisible(false);
        setIsIntroFinished(true);
        onComplete();
      } catch (error) {
        setIsVisible(false);
        setIsIntroFinished(true);
        onComplete();
      }
    };
    
    sequence();
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [logoRect, headerHeight, windowCenter]);

  return (
    <>
      {/* Временный хедер для измерений */}
      <div 
        ref={tempHeaderRef} 
        className="fixed top-0 left-0 right-0 z-0"
        style={{ 
          visibility: 'hidden',
          pointerEvents: 'none',
          height: 'auto'
        }}
      >
        <div className="bg-white shadow-sm">
          <nav aria-label="Top" className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-[var(--header-height)] items-center justify-center">
              <div className="flex-shrink-0">
                <h1 className="text-4xl font-extrabold tracking-widest text-black">
                  TEKU
                </h1>
              </div>
            </div>
          </nav>
        </div>
      </div>
      
      <AnimatePresence>
        {isVisible && (
          <motion.div 
            key="intro-bg" 
            className="fixed inset-0 bg-black z-50"
            initial={{ opacity: 1 }}
            animate={bgControls}
          >
            {/* Группа для всего слова - позиционируем в центре */}
            {windowCenter.ready && (
              <motion.div
                ref={wordGroupRef}
                className="absolute"
                style={{
                  top: windowCenter.y,
                  left: windowCenter.x,
                  transform: 'translate(-50%, -50%)'
                }}
                animate={wordGroupControls}
              >
                {"TEKU".split("").map((char, index) => (
                  <motion.span
                    ref={letterRefs[index]}
                    key={`letter-${index}`}
                    className="inline-block text-white font-black text-9xl mx-1"
                    initial={{ opacity: 0 }}
                    animate={letterControls[index]}
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}