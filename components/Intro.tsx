// components/Intro.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { gsap } from 'gsap';
import { useWindowCenter } from '@/hooks/useWindowCenter';
import { useIntro } from '@/context/IntroContext';

export default function Intro() {
  const [isVisible, setIsVisible] = useState(true);

  // Акты 1–2
  const bgControls = useAnimationControls();
  const letterControls = [
    useAnimationControls(),
    useAnimationControls(),
    useAnimationControls(),
    useAnimationControls(),
  ];

  const letterRefs = [
    useRef<HTMLSpanElement | null>(null),
    useRef<HTMLSpanElement | null>(null),
    useRef<HTMLSpanElement | null>(null),
    useRef<HTMLSpanElement | null>(null),
  ];
  const bgRef = useRef<HTMLDivElement | null>(null);

  const windowCenter = useWindowCenter();
  const hasAnimated = useRef(false);

  const { setIsIntroFinished } = useIntro();

  // Range API helpers
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
      const nodes = collectTextNodes(root);
      if (!nodes.length) return [];
      const rects: DOMRect[] = [];
      const range = document.createRange();
      let idx = 0;
      for (const tn of nodes) {
        for (let i = 0; i < tn.data.length && idx < text.length; i++, idx++) {
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

  useEffect(() => {
    if (hasAnimated.current || windowCenter.x === 0 || !windowCenter.ready) return;
    hasAnimated.current = true;

    const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.body.style.overflow = 'hidden';

    const sequence = async () => {
      // ждём рендер + шрифты
      await new Promise(r => setTimeout(r, 50));
      if ('fonts' in document) {
        try { await (document as any).fonts.ready; } catch {}
      }

      // ===== Акты 0..4 — твоя логика появления =====
      const widths = letterRefs.map(r => r.current?.getBoundingClientRect().width || 0);
      const heights = letterRefs.map(r => r.current?.getBoundingClientRect().height || 0);

      const initial = [
        { x: windowCenter.x - widths[0] / 2, y: windowCenter.y - heights[0] / 2 },
        { x: windowCenter.x, y: windowCenter.y - heights[1] / 2 },
        { x: windowCenter.x, y: windowCenter.y - heights[2] / 2 },
        { x: windowCenter.x, y: windowCenter.y - heights[3] / 2 },
      ];

      letterControls.forEach((ctrl, i) => {
        ctrl.set({ x: initial[i].x, y: initial[i].y, color: '#fff' });
        const el = letterRefs[i].current;
        if (el) {
          el.style.transformOrigin = 'left top';
          (el.style as any).WebkitTransformOrigin = 'left top';
          el.style.willChange = 'transform, opacity, color';
        }
      });

      // Акт 1
      await letterControls[0].start({ opacity: 1, scale: 1.2 }, { duration: 1, ease: 'easeOut', delay: 0.2 });
      await new Promise(r => setTimeout(r, 200));

      // Акт 2 (E) + центрирование
      const teWidth = widths[0] + widths[1];
      await Promise.all([
        letterControls[0].start({ scale: 1, x: windowCenter.x - teWidth / 2 }, { duration: 0.5, ease: 'easeOut' }),
        letterControls[1].start({ opacity: 1, x: windowCenter.x + widths[0] - teWidth / 2 }, { duration: 0.4, delay: 0.1 }),
      ]);

      // Акт 3 (K)
      const tekWidth = teWidth + widths[2];
      await Promise.all([
        letterControls[0].start({ x: windowCenter.x - tekWidth / 2 }, { duration: 0.4, ease: 'easeOut' }),
        letterControls[1].start({ x: windowCenter.x + widths[0] - tekWidth / 2 }, { duration: 0.4, ease: 'easeOut' }),
        letterControls[2].start({ opacity: 1, x: windowCenter.x + teWidth - tekWidth / 2 }, { duration: 0.4, delay: 0.1 }),
      ]);

      // Акт 4 (U)
      const tekuWidth = tekWidth + widths[3];
      await Promise.all([
        letterControls[0].start({ x: windowCenter.x - tekuWidth / 2 }, { duration: 0.4, ease: 'easeOut' }),
        letterControls[1].start({ x: windowCenter.x + widths[0] - tekuWidth / 2 }, { duration: 0.4, ease: 'easeOut' }),
        letterControls[2].start({ x: windowCenter.x + teWidth - tekuWidth / 2 }, { duration: 0.4, ease: 'easeOut' }),
        letterControls[3].start({ opacity: 1, x: windowCenter.x + tekWidth - tekuWidth / 2 }, { duration: 0.4, delay: 0.1 }),
      ]);

      // Пауза 1с
      await new Promise(r => setTimeout(r, 1000));

      // ссылка на реальный логотип (с 2.25rem и 0.1em)
      const siteLogo = document.getElementById('siteLogo') as HTMLElement | null;

      if (prefersReduced || !siteLogo) {
        if (siteLogo) siteLogo.style.opacity = '1';
        await Promise.all([
          bgControls.start({ opacity: 0 }, { duration: 0.4 }),
          ...letterControls.map(c => c.start({ opacity: 0 }, { duration: 0.4 })),
        ]);
        setIsVisible(false);
        try { sessionStorage.setItem('introShown', 'true'); } catch {}
        setIsIntroFinished(true);
        document.body.style.overflow = 'auto';
        return;
      }

      // ===== Акт 3 — перелёт в глифы <h1 id="siteLogo"> =====
      const headerEl = document.querySelector('header');
      const headerRect = headerEl?.getBoundingClientRect();
      const logoRect = siteLogo.getBoundingClientRect();

      // гарантируем нужные метрики (если tailwind переопределён — перестрахуемся)
      siteLogo.style.fontSize = '2.25rem';
      siteLogo.style.letterSpacing = '0.1em';

      // цели для каждой буквы с учётом tracking 0.1em
      let glyphRects = getGlyphRectsByRange(siteLogo, 'TEKU');
      if (glyphRects.length !== 4) {
        const seg = logoRect.width / 4;
        glyphRects = Array.from({ length: 4 }, (_, i) => new DOMRect(logoRect.left + i * seg, logoRect.top, seg, logoRect.height));
      }

      // подхватываем шрифтовые свойства, чтобы визуально совпасть при полёте
      const cs = getComputedStyle(siteLogo);
      letterRefs.forEach(ref => {
        const el = ref.current;
        if (!el) return;
        el.style.fontFamily = cs.fontFamily;
        el.style.fontWeight = cs.fontWeight as string;
        el.style.fontStretch = cs.fontStretch as string;
        el.style.fontStyle = cs.fontStyle;
        // letter-spacing на одиночной букве не влияет, но выставим для консистентности
        el.style.letterSpacing = cs.letterSpacing;
      });

      await new Promise(r => requestAnimationFrame(() => r(null)));
      const startRects = letterRefs.map(r => r.current?.getBoundingClientRect() || new DOMRect(0,0,0,0));

      const shiftUp = headerRect ? (window.innerHeight - headerRect.bottom) : 0;

      const tl = gsap.timeline();

      // фон поднимаем до низа хедера
      if (bgRef.current) {
        tl.to(bgRef.current, { y: -shiftUp, duration: 0.95, ease: 'power4.out' }, 0);
      }

      // буквы летят в прямоугольники глифов (baseline-совмещение)
      letterRefs.forEach((ref, i) => {
        const el = ref.current;
        const s = startRects[i];
        const t = glyphRects[i];
        if (!el || !s || !t || s.height === 0) return;
        const scale = Math.max(0.01, t.height / s.height);
        const targetX = t.left;
        const targetY = t.bottom - s.height * scale;
        tl.to(el, { x: targetX, y: targetY, scale, duration: 0.95, ease: 'power4.out', force3D: true }, 0);
      });

      await tl.then?.(() => {}) || new Promise(r => setTimeout(r, 10));

      // ===== Акт 4 — кросс-фейд (логотип 0→1, буквы и фон 1→0) =====
      siteLogo.style.opacity = siteLogo.style.opacity || '0';
      await Promise.all([
        gsap.to(siteLogo, { opacity: 1, duration: 0.5, ease: 'power1.inOut' }),
        ...letterRefs.map(ref => ref.current ? gsap.to(ref.current, { opacity: 0, duration: 0.5, ease: 'power1.inOut' }) : Promise.resolve()),
        bgRef.current ? gsap.to(bgRef.current, { opacity: 0, duration: 0.5, ease: 'power1.inOut' }) : Promise.resolve(),
      ]);

      // финал
      setIsVisible(false);
      try { sessionStorage.setItem('introShown', 'true'); } catch {}
      setIsIntroFinished(true);
      siteLogo.style.opacity = '1';
      document.body.style.overflow = 'auto';
    };

    sequence();

    return () => {
      document.body.style.overflow = 'auto';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windowCenter.x, windowCenter.y, windowCenter.ready]);

  return (
      <AnimatePresence>
        {isVisible && (
            <>
              {/* Чёрный фон */}
              <motion.div
                  ref={bgRef as any}
                  key="intro-bg"
                  className="fixed inset-0 bg-black z-40"
                  initial={{ opacity: 1, y: 0 }}
                  animate={bgControls}
              />
              {/* Буквы интро */}
              <motion.div
                  key="intro-letters"
                  className="fixed inset-0 pointer-events-none z-50"
                  aria-hidden
              >
                {'TEKU'.split('').map((char, index) => (
                    <motion.span
                        ref={letterRefs[index]}
                        key={index}
                        className="fixed top-0 left-0 text-white font-black text-9xl"
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
