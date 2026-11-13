"use client";

import { useCallback, useState } from "react";

/**
 * Width of an element, kept current with ResizeObserver. Returns a callback ref and
 * the width (the fallback until the element is measured, e.g. during SSR), plus
 * whether it has been measured, so charts can mark themselves ready for screenshots.
 */
export function useElementWidth<T extends HTMLElement>(fallback: number) {
  const [width, setWidth] = useState<number | null>(null);

  const ref = useCallback((node: T | null) => {
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      const w = Math.round(entries[0]?.contentRect.width ?? 0);
      if (w > 0) setWidth(w);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, width: width ?? fallback, measured: width !== null };
}
