// Current instances of data.ts

import { atom } from 'jotai';
import { atomWithStorage, useAtomValue, useUpdateAtom } from 'jotai/utils';
import { useEffect } from 'react';

import { UUID } from '../types';
import data from './data';

export const currentUserIdAtom = atomWithStorage<string | null>('currentUserId', null);
export const currentUserAtom = atom((get) => {
  const id = get(currentUserIdAtom);
  if (id === null) return null;
  return get(data.users)[id];
});
export function useUser() {
  return useAtomValue(currentUserAtom);
}

// export const currentRingIdAtom = atomWithStorage<UUID>('currentRingId', '1');
export const currentRingIdAtom = atom<UUID>('1');
export const currentRingAtom = atom((get) => {
  const id = get(currentRingIdAtom);
  const allRings = get(data.rings);
  console.log('dervied atom for current ring', JSON.stringify(allRings[id]));
  return allRings[id];
});
export function useRing() {
  return useAtomValue(currentRingAtom);
}

export const currentScrollOffsetAtom = atom({ x: 0, y: 0 });
export const currentWindowSizeAtom = atom({
  x: window.innerWidth,
  y: window.innerHeight,
});
// Keeps the currentWindowSize atom updated without needing to call window.innerW/H which thrashes layout
export function useWindowSizeObserver() {
  const set = useUpdateAtom(currentWindowSizeAtom);
  useEffect(() => {
    function updateCurrentWindowSize() {
      set({ x: window.innerWidth, y: window.innerHeight });
    }
    window.addEventListener('resize', updateCurrentWindowSize);
    return () => {
      window.removeEventListener('resize', updateCurrentWindowSize);
    };
  }, []);
}
