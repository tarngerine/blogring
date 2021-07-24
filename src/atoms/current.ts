// Current instances of data.ts

import { atom } from 'jotai';
import { atomWithStorage, useAtomValue } from 'jotai/utils';

import { UUID } from '../types';
import data from './data';

export const currentUserIdAtom = atomWithStorage<string>('currentUserId', '1');
export const currentUserAtom = atom((get) => get(data.users)[get(currentUserIdAtom)]);
export function useUser() {
  return useAtomValue(currentUserAtom);
}

export const currentRingIdAtom = atomWithStorage<UUID>('currentRingId', '1');
export const currentRingAtom = atom((get) => get(data.rings)[get(currentRingIdAtom)]);
export function useRing() {
  return useAtomValue(currentRingAtom);
}
