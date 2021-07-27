import { useUpdateAtom } from 'jotai/utils';
import React from 'react';

import { useRing } from '../../atoms/current';
import data from '../../atoms/data';
import { RingPayload, useSetSocketHandler } from '../../lib/ws';
import { styled } from '../../stitches.config';
import { Banner } from '../Banner';
import { Blogs } from '../Blog';
import { BuddyList } from '../BuddyList';
import { Cursors } from '../Cursors';
import { World } from '../World';

export function Ring() {
  const ring = useRing();
  const setRings = useUpdateAtom(data.rings);

  // Handle ring changes
  useSetSocketHandler('ring', (payload) => {
    const { ring } = payload as RingPayload;
    setRings((prev) => ({
      ...prev,
      [ring.id]: {
        ...prev[ring.id],
        ...ring,
      },
    }));
  });

  return (
    <>
      <StyledBackground css={{ background: ring.color }} />
      <Banner ring={ring} />
      <World>
        <Blogs ids={ring.blogs} />
        <Cursors />
      </World>
      <BuddyList blogIds={ring.blogs} />
    </>
  );
}
const StyledBackground = styled('div', {
  full: 'fixed',
  zIndex: '-1',
});
