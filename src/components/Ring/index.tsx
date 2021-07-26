import React from 'react';

import { useRing } from '../../atoms/current';
import { Banner } from '../Banner';
import { Blogs } from '../Blog';
import { BuddyList } from '../BuddyList';
import { Cursors } from '../Cursors';
import { World } from '../World';

export function Ring() {
  const ring = useRing();
  return (
    <>
      <World color={ring.color}>
        <Blogs ids={ring.blogs} />
        <Cursors />
      </World>
      <BuddyList blogIds={ring.blogs} />
      <Banner ring={ring} />
    </>
  );
}
