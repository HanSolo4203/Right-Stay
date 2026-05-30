"use client";

import {
  useEffect,
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

  useEffect(() => {
    setReady(true);
  }, []);

  const style: CSSProperties | undefined = ready
    ? { animation: `fadeSlideIn ${duration}s ease-out ${delay}s both` }
    : undefined;

  const combinedClassName = ready
    ? `animate-on-scroll ${className}`.trim()
    : className;

  return (
    <Tag className={combinedClassName || undefined} style={style}>
      {children}
    </Tag>
  );
}
