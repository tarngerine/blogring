import { animated } from '@react-spring/web';
import React from 'react';

import { styled } from '../../stitches.config';

export function World({ children }: React.PropsWithChildren<{}>) {
  return (
    <StyledViewport>
      <StyledBackground />
      {children}
    </StyledViewport>
  );
}

const StyledViewport = styled(animated.div, {
  full: 'fixed',
  overflow: 'scroll',
});

const StyledBackground = styled('div', {
  background: 'lightblue',
  full: 'fixed',
  zIndex: '-1',
});
