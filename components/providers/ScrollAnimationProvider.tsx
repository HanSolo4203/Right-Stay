'use client';

import { useScrollAnimation } from '@/hooks/useScrollAnimation';

/** One IntersectionObserver per page instead of per section. */
export default function ScrollAnimationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useScrollAnimation();
  return <>{children}</>;
}
