import { animated, SpringValue, useSpring } from '@react-spring/web';
import { atom } from 'jotai';
import { useUpdateAtom } from 'jotai/utils';
import React, { useEffect, useRef } from 'react';
import { useGesture } from 'react-use-gesture';

import { currentScrollOffsetAtom, currentWindowSizeAtom } from '../../atoms/current';
import { CursorPayload, useSendSocket } from '../../lib/ws';
import { styled } from '../../stitches.config';
import { Vec } from '../../types';
import { BLOGSIZE } from '../Blog';

// Allow other components to control the pan position
const panSpringAtom = atom<{ x: SpringValue<number>; y: SpringValue<number> } | null>(
  null,
);
export const panToAtom = atom(null, (get, set, blogPosition: Vec) => {
  const pan = get(panSpringAtom);
  if (pan !== null) {
    // Convert the top left of the blog to the top left of the window
    const screenSize = get(currentWindowSizeAtom);
    const position = {
      x: -blogPosition.x + screenSize.x / 2 - BLOGSIZE.x / 2,
      y: -blogPosition.y + screenSize.y / 2 - BLOGSIZE.y / 2,
    };

    pan.x.stop();
    pan.y.stop();
    pan.x.start(position.x);
    pan.y.start(position.y);

    set(currentScrollOffsetAtom, position);
  }
});

interface Props {
  fixedChildren: React.ReactNode;
}

export function World({ children, fixedChildren }: React.PropsWithChildren<Props>) {
  const setCurrentScroll = useUpdateAtom(currentScrollOffsetAtom);
  const pan = useSpring({ from: { x: 0, y: 0 } });
  const setPanAtom = useUpdateAtom(panSpringAtom);
  // Add reference to pan as an atom to control scroll from elsewhere
  useEffect(() => {
    setPanAtom(pan);
  }, []);

  const bind = useGesture({
    onWheel: ({ delta: [dx, dy] }) => {
      const x = pan.x.get() - dx;
      const y = pan.y.get() - dy;

      pan.x.set(x);
      pan.y.set(y);
      setCurrentScroll({ x: x, y: y });
    },
  });

  // Prevent swipe gesture back/forward
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function preventSwipe(e: WheelEvent) {
      e.preventDefault();
    }
    ref.current?.addEventListener('wheel', preventSwipe);
    return () => {
      ref.current?.removeEventListener('wheel', preventSwipe);
    };
  }, [ref]);

  const send = useSendSocket(true);

  // Basic cursor event
  useEffect(() => {
    const onPointerMove = (e: MouseEvent) => {
      send({
        event: 'cursor',
        position: { x: e.pageX - pan.x.get(), y: e.pageY - pan.y.get() },
      } as CursorPayload);
    };
    document.addEventListener('pointermove', onPointerMove);

    return () => {
      document.removeEventListener('pointermove', onPointerMove);
    };
  }, [send, pan]);

  return (
    <div ref={ref}>
      <StyledViewport {...bind()}>
        {fixedChildren}
        <StyledPanWrapper style={pan}>{children}</StyledPanWrapper>
      </StyledViewport>
    </div>
  );
}

const StyledViewport = styled(animated.div, {
  full: 'fixed',
  overflow: 'hidden',
  userSelect: 'none', // prevent text selection when dragging in canvas
});

const StyledPanWrapper = styled(animated.div, {});
