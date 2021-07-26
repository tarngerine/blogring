import { animated, useSpring } from '@react-spring/web';
import { useUpdateAtom } from 'jotai/utils';
import React, { useEffect, useRef } from 'react';
import { useGesture } from 'react-use-gesture';

import { currentScrollOffsetAtom } from '../../atoms/current';
import { CursorPayload, useSendSocket } from '../../lib/ws';
import { styled } from '../../stitches.config';
interface Props {
  color: string;
}
export function World({ children, color }: React.PropsWithChildren<Props>) {
  const setCurrentScroll = useUpdateAtom(currentScrollOffsetAtom);
  const pan = useSpring({ from: { x: 0, y: 0 } });
  const bind = useGesture({
    onWheel: ({ xy: [x, y] }) => {
      pan.x.set(-x);
      pan.y.set(-y);
      setCurrentScroll({ x: -x, y: -y });
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
        <StyledBackground css={{ background: color }} />
        <animated.div style={pan}>{children}</animated.div>
      </StyledViewport>
    </div>
  );
}

const StyledViewport = styled(animated.div, {
  full: 'fixed',
  overflow: 'hidden',
  userSelect: 'none', // prevent text selection when dragging in canvas
});

const StyledBackground = styled('div', {
  full: 'fixed',
  zIndex: '-1',
});
