import { atomWithStorage } from 'jotai/utils';

import { Vec } from '../types';

const panes = atomWithStorage<Record<string, Vec>>('panes', {
  buddyList: { x: 600, y: 50 },
});

const atoms = { panes };

export default atoms;
