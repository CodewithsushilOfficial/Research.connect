import React, { useEffect, useRef, useState } from 'react';

/**
 * StickyBox
 * A drop-in replacement for CSS `position: sticky` that works reliably
 * even inside nested scroll containers (e.g. a <main overflow-y-auto>
 * instead of the window scrolling).
 *
 * How it works:
 *  - `boundsRef` wraps the *tall* column (should match the height of
 *    the taller sibling column, e.g. via items-stretch on the parent grid).
 *  - `innerRef` wraps the actual sidebar content.
 *  - On every scroll/resize we compute how far to translateY the inner
 *    content so it visually stays `offset` px from the top of the
 *    viewport, but never goes past the top or bottom of `boundsRef`.
 *  - Disabled below the `desktopBreakpoint` (default 1024px / lg) so
 *    mobile layout & scroll behavior are completely untouched.
 */
const StickyBox = ({ offset = 80, desktopBreakpoint = 1024, children, className = '' }) => {
  const boundsRef = useRef(null);
  const innerRef = useRef(null);
  const [translateY, setTranslateY] = useState(0);

  useEffect(() => {
    const boundsEl = boundsRef.current;
    const innerEl = innerRef.current;
    if (!boundsEl || !innerEl) return;

    // Find the nearest ancestor that actually scrolls (e.g. <main overflow-y-auto>)
    const getScrollParent = (el) => {
      let node = el.parentElement;
      while (node) {
        const style = window.getComputedStyle(node);
        if (/(auto|scroll)/.test(style.overflowY)) return node;
        node = node.parentElement;
      }
      return window;
    };

    const scrollParent = getScrollParent(boundsEl);
    const scrollTarget = scrollParent === window ? window : scrollParent;

    let ticking = false;

    const recalc = () => {
      ticking = false;

      // Fully skip on mobile/tablet — desktop-only behavior, mobile untouched
      if (window.innerWidth < desktopBreakpoint) {
        if (translateY !== 0) setTranslateY(0);
        return;
      }

      const boundsRect = boundsEl.getBoundingClientRect();
      const innerHeight = innerEl.offsetHeight;
      const maxTranslate = Math.max(0, boundsEl.offsetHeight - innerHeight);

      let next = offset - boundsRect.top;
      next = Math.max(0, Math.min(next, maxTranslate));

      setTranslateY((prev) => (Math.abs(prev - next) > 0.5 ? next : prev));
    };

    const onScrollOrResize = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(recalc);
    };

    recalc();
    scrollTarget.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);

    const ro = new ResizeObserver(onScrollOrResize);
    ro.observe(boundsEl);
    ro.observe(innerEl);

    return () => {
      scrollTarget.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset, desktopBreakpoint]);

  return (
    <div ref={boundsRef} className={className}>
      <div
        ref={innerRef}
        style={{
          transform: window.innerWidth >= desktopBreakpoint ? `translateY(${translateY}px)` : 'none',
          willChange: 'transform',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default StickyBox;