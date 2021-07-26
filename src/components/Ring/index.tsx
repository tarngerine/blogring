import React, { useEffect } from 'react';

import { useRing } from '../../atoms/current';
import { styled } from '../../stitches.config';
import { Banner } from '../Banner';
import { Blogs } from '../Blog';
import { BuddyList } from '../BuddyList';
import { Cursors } from '../Cursors';
import { World } from '../World';

export function Ring() {
  const ring = useRing();
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
