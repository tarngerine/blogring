// Current instances of data.ts

import { atom } from 'jotai';
import { atomWithStorage, useAtomValue } from 'jotai/utils';

import data from './data';

export const currentUserIdAtom = atomWithStorage<string>('currentUserId', '1');
export const currentUserAtom = atom((get) => get(data.users)[get(currentUserIdAtom)]);
export function useUser() {
  return useAtomValue(currentUserAtom);
}
