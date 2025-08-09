// components/Intro.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { gsap } from 'gsap';
import { useWindowCenter } from '@/hooks/useWindowCenter';

type Props = { onComplete: () => void };

// --- Вспомогательные функции для Range API ---
function collectTextNodes(node: Node, out: Text[] = []) {
  if (node.nodeType === Node.TEXT_NODE) {
    const t = node as Text;
    if (t.data.trim().length > 0) out.push(t);
  } else {
    node.childNodes.forEach((n) => collectTextNodes(n as Node, out));
  }
  return out;
}
function getGlyphRectsByRange(root: Element, text: string): DOMRect[] {
  try {
    const textNodes = collectTextNodes(root);
    if (textNodes.length === 0) return [];
    const rects: DOMRect[] = [];
    const range = document.createRange();
    let globalIndex = 0;

    for (const tn of textNodes) {
      const nodeText = tn.data;
      for (let i = 0; i < nodeText.length && globalIndex < text.length; i++, globalIndex++) {
        range.setStart(tn, i);
        range.setEnd(tn, i + 1);
        rects.push(range.getBoundingClientRect());
        if (rects.length === text.length) break;
      }
      if (rects.length === text.length) break;
    }
    return rects.length === text.length ? rects : [];
  } catch {
    return [];
  }
}

export default function Intro({ onComplete }: Props) {
  const [isVisible, setIsVisible] = useState(true);

  // Framer для актов 1–2
  const bgControls = useAnimationControls();
  const letterControls = [
    useAnimationControls(),
    useAnimationControls(),
    useAnimationControls(),
    useAnimationControls(),
  ];

  // refs
  const letterRefs = [
    useRef<HTMLSpanElement | null>(null),
    useRef<HTMLSpanElement | null>(null),
    useRef<HTMLSpanElement | null>(null),
    useRef<HTMLSpanElement | null>(null),
  ];
  const bgRef = useRef<HTMLDivElement | null>(null);

  const windowCenter = useWindowCenter();
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current || windowCenter.x === 0 || !windowCenter.ready) return;
    hasAnimated.current = true;

    const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Блокируем скролл на время интро
    document.body.style.overflow = 'hidden';

    const sequence = async () => {
      // Небольшая задержка на рендер
      await new Promise((r) => setTimeout(r, 50));

      // ===== Акты 0..4 (твоя логика появления букв — без изменений) =====
      const widths = letterRefs.map((r) => r.current?.getBoundingClientRect().width || 0);
      const heights = letterRefs.map((r) => r.current?.getBoundingClientRect().height || 0);

      const initialPositions = [
        { x: windowCenter.x - widths[0] / 2, y: windowCenter.y - heights[0] / 2 },
        { x: windowCenter.x, y: windowCenter.y - heights[1] / 2 },
        { x: windowCenter.x, y: windowCenter.y - heights[2] / 2 },
        { x: windowCenter.x, y: windowCenter.y - heights[3] / 2 },
      ];

      letterControls.forEach((control, i) => {
        control.set({ x: initialPositions[i].x, y: initialPositions[i].y, color: '#fff' });
        const el = letterRefs[i].current;
        if (el) {
          // важный якорь для точного позиционирования
          el.style.transformOrigin = 'left top';
          (el.style as any).WebkitTransformOrigin = 'left top';
          el.style.willChange = 'transform, opacity, color';
        }
      });

      // Акт 1
      await letterControls[0].start(
          { opacity: 1, scale: 1.2 },
          { duration: 1, ease: 'easeOut', delay: 0.2 }
      );
      await new Promise((r) => setTimeout(r, 200));

      // Акт 2
      const teWidth = widths[0] + widths[1];
      await Promise.all([
        letterControls[0].start(
            { scale: 1, x: windowCenter.x - teWidth / 2 },
            { duration: 0.5, ease: 'easeOut' }
        ),
        letterControls[1].start(
            { opacity: 1, x: windowCenter.x + widths[0] - teWidth / 2 },
            { duration: 0.4, delay: 0.1 }
        ),
      ]);

      // Акт 3 (K)
      const tekWidth = teWidth + widths[2];
      await Promise.all([
        letterControls[0].start(
            { x: windowCenter.x - tekWidth / 2 },
            { duration: 0.4, ease: 'easeOut' }
        ),
        letterControls[1].start(
            { x: windowCenter.x + widths[0] - tekWidth / 2 },
            { duration: 0.4, ease: 'easeOut' }
        ),
        letterControls[2].start(
            { opacity: 1, x: windowCenter.x + teWidth - tekWidth / 2 },
            { duration: 0.4, delay: 0.1 }
        ),
      ]);

      // Акт 4 (U)
      const tekuWidth = tekWidth + widths[3];
      await Promise.all([
        letterControls[0].start(
            { x: windowCenter.x - tekuWidth / 2 },
            { duration: 0.4, ease: 'easeOut' }
        ),
        letterControls[1].start(
            { x: windowCenter.x + widths[0] - tekuWidth / 2 },
            { duration: 0.4, ease: 'easeOut' }
        ),
        letterControls[2].start(
            { x: windowCenter.x + teWidth - tekuWidth / 2 },
            { duration: 0.4, ease: 'easeOut' }
        ),
        letterControls[3].start(
            { opacity: 1, x: windowCenter.x + tekWidth - tekuWidth / 2 },
            { duration: 0.4, delay: 0.1 }
        ),
      ]);

      // Пауза 1с
      await new Promise((r) => setTimeout(r, 1000));

      if (prefersReduced) {
        await Promise.all([
          bgControls.start({ opacity: 0 }, { duration: 0.4 }),
          ...letterControls.map((c) => c.start({ opacity: 0 }, { duration: 0.4 })),
        ]);
        setIsVisible(false);
        try { sessionStorage.setItem('introShown', 'true'); } catch {}
        onComplete();
        document.body.style.overflow = 'auto';
        return;
      }

      // ===== Акт 3 — перелёт к хедеру (GSAP, абсолютные x/y/scale) =====
      const headerEl = document.querySelector('header');
      const logoEl =
          headerEl ? (headerEl.querySelector('h1') || headerEl.querySelector('a > h1')) : document.querySelector('header h1');

      if (!headerEl || !logoEl) {
        // graceful fallback
        await Promise.all([
          bgControls.start({ opacity: 0 }, { duration: 0.5 }),
          ...letterControls.map((c) => c.start({ opacity: 0 }, { duration: 0.5 })),
        ]);
        setIsVisible(false);
        try { sessionStorage.setItem('introShown', 'true'); } catch {}
        onComplete();
        document.body.style.overflow = 'auto';
        return;
      }

      const headerRect = headerEl.getBoundingClientRect();
      const logoRect = logoEl.getBoundingClientRect();

      // rect’ы каждого глифа в реальном хедере
      const targetText = 'TEKU';
      let logoGlyphRects = getGlyphRectsByRange(logoEl, targetText);
      if (logoGlyphRects.length !== targetText.length) {
        // fallback: равномерно делим bbox логотипа на 4
        const fallback: DOMRect[] = [];
        for (let i = 0; i < targetText.length; i++) {
          const w = logoRect.width / targetText.length;
          const left = logoRect.left + i * w;
          fallback.push(new DOMRect(left, logoRect.top, w, logoRect.height));
        }
        logoGlyphRects = fallback;
      }

      // максимально приблизим стили оверлей-букв к хедеру (без font-size)
      const cs = getComputedStyle(logoEl as HTMLElement);
      letterRefs.forEach((ref) => {
        const el = ref.current;
        if (!el) return;
        el.style.fontFamily = cs.fontFamily;
        el.style.fontWeight = cs.fontWeight as string;
        el.style.fontStretch = cs.fontStretch as string;
        el.style.fontStyle = cs.fontStyle;
        el.style.letterSpacing = cs.letterSpacing;
      });

      // дать браузеру применить стили и снять старт-ректы
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      const startRects = letterRefs.map((r) => r.current?.getBoundingClientRect() || new DOMRect(0, 0, 0, 0));

      // Двигаем фон вверх до низа хедера
      const shiftUp = window.innerHeight - headerRect.bottom;

      // Скрываем реальный логотип до кросс-фейда (чтобы не мигал раньше)
      const logoElEl = logoEl as HTMLElement;
      const prevLogoOpacity = logoElEl.style.opacity;
      logoElEl.style.opacity = '0';

      // GSAP timeline: фон + перелёт букв
      const tl = gsap.timeline();

      // Фон (едет вверх)
      if (bgRef.current) {
        tl.to(bgRef.current, { y: -shiftUp, duration: 0.95, ease: 'power4.out' }, 0);
      }

      // Каждая буква: абсолютные x/y/scale, якорь left top, baseline-совпадение
      letterRefs.forEach((ref, i) => {
        const el = ref.current;
        const start = startRects[i];
        const target = logoGlyphRects[i];
        if (!el || !start || !target || start.width === 0 || start.height === 0) return;

        const scale = Math.max(0.01, target.height / (start.height || 1));
        const targetX = target.left; // по левому краю глифа
        const targetY = target.bottom - start.height * scale; // baseline-like

        tl.to(el, { x: targetX, y: targetY, scale, duration: 0.95, ease: 'power4.out', force3D: true }, 0);
      });

      // Небольшая стабилизация
      tl.to({}, { duration: 0.12 });

      // ===== Акт 4 — кросс-фейд =====
      // 1) фон исчезает
      if (bgRef.current) {
        tl.to(bgRef.current, { opacity: 0, duration: 0.6, ease: 'power1.inOut' }, '>-0.02');
      }
      // 2) наши буквы — становятся чёрными и исчезают
      letterRefs.forEach((ref) => {
        const el = ref.current;
        if (!el) return;
        tl.to(el, { color: '#000', duration: 0.6, ease: 'power1.inOut' }, '<');
        tl.to(el, { opacity: 0, duration: 0.6, ease: 'power1.inOut' }, '<');
      });
      // 3) реальный логотип — проявляется
      tl.to(logoElEl, { opacity: 1, duration: 0.6, ease: 'power1.inOut' }, '<');

      // Ждём завершения
      await new Promise<void>((resolve) => tl.eventCallback('onComplete', resolve));

      // Чистим inline-стили у логотипа
      logoElEl.style.opacity = prevLogoOpacity;

      // Финал
      setIsVisible(false);
      try { sessionStorage.setItem('introShown', 'true'); } catch {}
      onComplete();
      document.body.style.overflow = 'auto';
    };

    sequence();

    return () => {
      document.body.style.overflow = 'auto';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windowCenter.x, windowCenter.y, windowCenter.ready, onComplete]);

  return (
      <AnimatePresence>
        {isVisible && (
            <>
              {/* Фон (фальш-хедер) — отдельный фикс-слой */}
              <motion.div
                  ref={bgRef as any}
                  key="intro-bg"
                  className="fixed inset-0 bg-black z-40"
                  initial={{ opacity: 1, y: 0 }}
                  animate={bgControls} // используется в ранних актах и fallback'ах
              />
              {/* Буквы — отдельный фикс-слой, не зависят от transform фона */}
              <motion.div
                  key="intro-letters"
                  className="fixed inset-0 pointer-events-none z-50"
                  aria-hidden
              >
                {'TEKU'.split('').map((char, index) => (
                    <motion.span
                        ref={letterRefs[index]}
                        key={index}
                        className="fixed top-0 left-0 text-white font-black text-9xl leading-none"
                        style={{ transformOrigin: 'left top', WebkitTransformOrigin: 'left top' }}
                        initial={{ opacity: 0 }}
                        animate={letterControls[index]}
                    >
                      {char}
                    </motion.span>
                ))}
              </motion.div>
            </>
        )}
      </AnimatePresence>
  );
}
