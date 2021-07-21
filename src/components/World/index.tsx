import React from 'react';

import { styled } from '../../stitches.config';

export function World() {
  return (
    <>
      <StyledBackground />
    </>
  );
}

const StyledBackground = styled('div', {
  background: 'lightblue',
  full: '',
  zIndex: '-1',
});
