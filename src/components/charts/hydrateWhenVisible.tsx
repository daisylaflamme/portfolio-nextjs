"use client";

import { lazy, Suspense, useCallback, type ComponentType, type ReactNode } from "react";

type Loader<P> = () => Promise<{ default: ComponentType<P> }>;

interface Gate {
  promise: Promise<void>;
  open: () => void;
}

const gates = new Set<Gate>();

function createGate(): Gate {
  // On the server every gate is open, so the full chart is rendered into the HTML.
  if (typeof window === "undefined") return { promise: Promise.resolve(), open: () => {} };
  let open = () => {};
  const promise = new Promise<void>((resolve) => {
    open = resolve;
  });
  const gate = { promise, open };
  gates.add(gate);
  return gate;
}

/** Hydrates every gated chart now, e.g. when a filter changes the data they show. */
export function openAllGates() {
  for (const gate of gates) gate.open();
  gates.clear();
}

/**
 * Wraps a below-the-fold chart so its server-rendered HTML shows right away, but its
 * JavaScript loads and hydrates only when needed: when it comes within 300px of the
 * viewport, when the pointer or keyboard focus enters it, or when the dashboard state
 * changes. Until then React leaves the server HTML in place (a dehydrated Suspense
 * boundary waiting on React.lazy), so the page's start-up work stays small.
 */
export function hydrateWhenVisible<P extends object>(
  loader: Loader<P>,
  options: { fallback?: ReactNode; wrapperClassName?: string } = {},
) {
  const gate = createGate();
  const Lazy = lazy(() => gate.promise.then(loader));

  function Gated(props: P) {
    const ref = useCallback((node: HTMLDivElement | null) => {
      if (!node) return;
      const wake = () => {
        gate.open();
        gates.delete(gate);
      };
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            wake();
            observer.disconnect();
          }
        },
        { rootMargin: "300px 0px" },
      );
      observer.observe(node);
      node.addEventListener("focusin", wake);
      node.addEventListener("pointerover", wake);
      return () => {
        observer.disconnect();
        node.removeEventListener("focusin", wake);
        node.removeEventListener("pointerover", wake);
      };
    }, []);

    return (
      <div ref={ref} className={options.wrapperClassName}>
        <Suspense fallback={options.fallback ?? null}>
          <Lazy {...props} />
        </Suspense>
      </div>
    );
  }
  return Gated;
}
