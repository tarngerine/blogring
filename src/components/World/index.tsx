import { animated, useSpring } from '@react-spring/web';
import React from 'react';
import { useGesture } from 'react-use-gesture';

import { styled } from '../../stitches.config';

export function World({ children }: React.PropsWithChildren<{}>) {
  const pan = useSpring({ from: { x: 0, y: 0 } });
  const bind = useGesture({
    onPinch: ({ event }) => {
      console.log(event);
    },
    onWheel: ({ xy: [x, y] }) => {
      pan.x.set(-x);
      pan.y.set(-y);
    },
  });
  // useEffect(() => {
  //   // disable default mousewheel behavior
  //   function disableWheel(event: MouseEvent) {
  //     console.log('HI', event);
  //     event.preventDefault();
  //     event.stopPropagation();
  //   }
  //   document.body.addEventListener('mousewheel', disableWheel);
  //   document.body.style.touchAction = 'none';
  //   return () => {
  //     document.body.removeEventListener('mousewheel', disableWheel);
  //   };
  // }, []);
  return (
    <StyledViewport {...bind()}>
      <StyledBackground />
      <animated.div style={{ ...pan }}>{children}</animated.div>
    </StyledViewport>
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
