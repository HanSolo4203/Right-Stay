"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type ParsedStat = {
  prefix: string;
  numeric: number;
  suffix: string;
  decimals: number;
  animate: boolean;
};

export function parseStatValue(value: string): ParsedStat {
  const trimmed = value.trim();

  if (/24\/7/i.test(trimmed)) {
    return { prefix: "", numeric: 0, suffix: trimmed, decimals: 0, animate: false };
  }

  const match = trimmed.match(/^([^0-9]*)([\d,.]+)(.*)$/);
  if (!match) {
    return { prefix: "", numeric: 0, suffix: trimmed, decimals: 0, animate: false };
  }

  const [, prefix, numStr, suffix] = match;
  const numeric = parseFloat(numStr.replace(/,/g, ""));
  const decimals = numStr.includes(".") ? (numStr.split(".")[1]?.length ?? 0) : 0;

  return {
    prefix: prefix ?? "",
    numeric: Number.isFinite(numeric) ? numeric : 0,
    suffix: suffix ?? "",
    decimals,
    animate: Number.isFinite(numeric) && numeric > 0,
  };
}

function runCountUp(
  parsed: ParsedStat,
  duration: number,
  onUpdate: (text: string) => void
) {
  const start = performance.now();
  const to = parsed.numeric;

  const tick = (now: number) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = to * eased;
    const formatted =
      parsed.decimals > 0 ? current.toFixed(parsed.decimals) : Math.round(current).toString();
    onUpdate(`${parsed.prefix}${formatted}${parsed.suffix}`);

    if (progress < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

export function useAnimatedCounter(value: string, duration = 1800): {
  display: string;
  ref: (node: HTMLSpanElement | null) => void;
} {
  const parsed = useMemo(() => parseStatValue(value), [value]);
  const hasAnimated = useRef(false);
  const [display, setDisplay] = useState(
    parsed.animate ? `${parsed.prefix}0${parsed.suffix}` : value
  );

  useEffect(() => {
    if (!parsed.animate) {
      setDisplay(value);
      hasAnimated.current = false;
    }
  }, [value, parsed.animate, parsed.prefix, parsed.suffix]);

  const ref = useCallback(
    (node: HTMLSpanElement | null) => {
      if (!node || !parsed.animate || hasAnimated.current) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          hasAnimated.current = true;
          runCountUp(parsed, duration, setDisplay);
          observer.disconnect();
        },
        { threshold: 0.25 }
      );

      observer.observe(node);
    },
    [parsed, duration]
  );

  return { display: parsed.animate ? display : value, ref };
}
