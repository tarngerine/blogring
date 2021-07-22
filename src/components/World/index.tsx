import { animated, useSpring } from '@react-spring/web';
import React, { useEffect, useRef } from 'react';
import { useGesture } from 'react-use-gesture';

import { styled } from '../../stitches.config';

export function World({ children }: React.PropsWithChildren<{}>) {
  const pan = useSpring({ from: { x: 0, y: 0 } });
  const bind = useGesture({
    onWheel: ({ xy: [x, y] }) => {
      pan.x.set(-x);
      pan.y.set(-y);
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

  return (
    <div ref={ref}>
      <StyledViewport {...bind()}>
        <StyledBackground />
        <animated.div style={pan}>{children}</animated.div>
      </StyledViewport>
    </div>
  );
}

const StyledViewport = styled(animated.div, {
  full: 'fixed',
  overflow: 'hidden',
});

const StyledBackground = styled('div', {
  background: 'lightblue',
  full: 'fixed',
  zIndex: '-1',
});
