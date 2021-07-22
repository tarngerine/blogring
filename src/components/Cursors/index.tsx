import { animated } from '@react-spring/web';
import { atom } from 'jotai';
import { useAtomValue } from 'jotai/utils';
import React, { useEffect, useRef } from 'react';

import data from '../../atoms/data';
import { CursorPayload, socketStateAtom } from '../../lib/ws';
import { styled } from '../../stitches.config';
import { Vec } from '../../types';

const cursorsAtom = atom(
  (get) =>
    get(socketStateAtom)['cursor'] as Record<string, Omit<CursorPayload, 'event' | 'id'>>,
);

export function Cursors() {
  const cursors = useAtomValue(cursorsAtom);

  return (
    <>
      {cursors &&
        Object.entries(cursors).map(([id, { position }]) => (
          <Cursor key={id} id={id} position={position} />
        ))}
    </>
  );
}

function Cursor({ id, position: { x, y } }: { id: string; position: Vec }) {
  const user = useAtomValue(data.userFamily(id));
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current!.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }, [x, y]);
  return (
    <StyledCursor
      css={{
        filter: `sepia(100%) saturate(150%) darkness(150%) hue-rotate(180deg)`,
      }}
      ref={ref}></StyledCursor>
  );
}

const StyledCursor = styled(animated.div, {
  position: 'absolute',
  width: '100px',
  height: '100px',
  backgroundImage: 'url(./glove.svg)',
  backgroundRepeat: 'no-repeat',
  pointerEvents: 'none',
});
