'use client';

import React, { useRef, useCallback } from 'react';

/**
 * Wraps the filter sidebar and product list in two independently scrollable
 * columns.  When the mouse is over one column, wheel events scroll that column.
 * Once the column hits its scroll boundary (top or bottom), continued scrolling
 * falls through to the other column.
 */
export default function ProductsGrid({ children }: { children: React.ReactNode }) {
  const filterRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);

  /** Returns true when the element cannot scroll further in `direction`. */
  const isAtBoundary = (el: HTMLElement, direction: 'down' | 'up'): boolean => {
    if (direction === 'down') {
      // scrollTop + clientHeight >= scrollHeight means we're at the bottom
      return Math.abs(el.scrollHeight - el.clientHeight - el.scrollTop) < 1;
    }
    return el.scrollTop <= 0;
  };

  const handleWheel = useCallback((
    e: React.WheelEvent<HTMLElement>,
    primary: React.RefObject<HTMLElement | null>,
    secondary: React.RefObject<HTMLElement | null>,
  ) => {
    const el = primary.current;
    const other = secondary.current;
    if (!el || !other) return;

    const direction = e.deltaY > 0 ? 'down' : 'up';

    // If the primary column's content doesn't overflow at all, let the
    // event pass naturally (don't interfere).
    if (el.scrollHeight <= el.clientHeight) return;

    if (isAtBoundary(el, direction)) {
      // Primary column is already at its boundary — push to secondary.
      other.scrollTop += e.deltaY;
      // Don't prevent default here so the page can also scroll normally
      // if the secondary is also at boundary.
    } else {
      // Primary can still scroll — consume the event locally.
      e.stopPropagation();
    }
  }, []);

  // Convert children to an array to split them into the two slots.
  const childArray = React.Children.toArray(children);
  const filterContent = childArray[0];
  const productContent = childArray[1];

  return (
    <div className="sticky top-[var(--header-total-height)] grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8 md:items-start">
      {/* ── Filter column ─────────────────────────────── */}
      <aside
        ref={filterRef}
        className="md:max-h-[calc(100vh-var(--header-total-height)-1rem)] md:overflow-y-auto md:overflow-x-hidden md:overscroll-contain scrollbar-hidden md:pr-2"
        onWheel={(e) => handleWheel(e, filterRef, productsRef)}
      >
        {filterContent}
      </aside>

      {/* ── Product column ────────────────────────────── */}
      <main
        ref={productsRef}
        className="md:max-h-[calc(100vh-var(--header-total-height)-1rem)] md:overflow-y-auto md:overflow-x-hidden md:overscroll-contain scrollbar-hidden"
        onWheel={(e) => handleWheel(e, productsRef, filterRef)}
      >
        {productContent}
      </main>
    </div>
  );
}
