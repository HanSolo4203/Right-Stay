"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";

type AnimateOnScrollProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  as?: ElementType;
};

function revealIfInViewport(el: HTMLElement | null) {
  if (!el || el.classList.contains("animate")) return;

  const rect = el.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  if (rect.top < viewportHeight * 0.95 && rect.bottom > 0) {
    el.classList.add("animate");
  }
}

/**
 * Scroll-triggered fade/slide — defers animation attrs until after mount to avoid hydration mismatches.
 */
export default function AnimateOnScroll({
  children,
  className = "",
  delay = 0,
  duration = 0.7,
  as: Tag = "div",
}: AnimateOnScrollProps) {
  const [ready, setReady] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    revealIfInViewport(elementRef.current);
  }, [ready]);

  const style: CSSProperties | undefined = ready
    ? { animation: `fadeSlideIn ${duration}s ease-out ${delay}s both` }
    : undefined;

  const combinedClassName = ready
    ? `animate-on-scroll ${className}`.trim()
    : className;

  return (
    <Tag
      ref={elementRef}
      className={combinedClassName || undefined}
      style={style}
    >
      {children}
    </Tag>
  );
}
