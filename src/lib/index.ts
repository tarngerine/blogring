import { filterHueRotate, formatRgb, parse } from 'culori';
import { useEffect, useRef, useState } from 'react';

import { Vec } from '../types';

// lerp function between two ranges
export function lerp(value: number, r1: [number, number], r2: [number, number]): number {
  return ((value - r1[0]) * (r2[1] - r2[0])) / (r1[1] - r1[0]) + r2[0];
}

// Stores the size of an element
export function useSize() {
  const ref = useRef<HTMLDivElement>(null);

  const [size, setSize] = useState<Vec>({ x: 0, y: 0 });
  const [observer] = useState(
    new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry.contentRect) {
        setSize({ x: entry.contentRect.width, y: entry.contentRect.height });
      }
    }),
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    observer.observe(el);
  }, [observer]);

  return { size, ref } as const;
}

// Generate a random color in our palette
export const BASE_COLOR = 'salmon'; // sets the SV for our colors
export function randomColor() {
  const hueRotate = filterHueRotate(Math.random() * 360);
  return formatRgb(hueRotate(parse(BASE_COLOR)));
}

export { SocketProvider } from './ws';
