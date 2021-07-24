import React from 'react';

import { styled } from '../../stitches.config';
import { Button } from '../Base';

interface Props {
  name: string;
  color: string;
}

export function Banner({ name, color }: Props) {
  return (
    <>
      <StyledBanner css={{ boxShadow: `0 .5px 0 0 ${color}` }}>
        <StyledLabel>Ring</StyledLabel>
        <StyledH1>{name}</StyledH1>

        <StyledLabel>Today</StyledLabel>
        <StyledText>{new Date().toDateString()}</StyledText>
        <StyledLabel>Join ring</StyledLabel>
        <div>
          <Button size="s" css={{ background: '$blackA', color, focus: color }}>
            Create blog
          </Button>
        </div>
      </StyledBanner>
    </>
  );
}

const StyledH1 = styled('h1', {
  // typography: 'l',
  typography: 'l',
});

const StyledText = styled('div', {
  // typography: 's',
  typography: 's',
  // typography: 'l',
});

const StyledBanner = styled('div', {
  position: 'fixed',
  top: '$2',
  left: '$4',
  right: '$4',
  padding: '0 0 $2',
  opacity: '0.8',
  color: 'lightblue',
  filter: 'saturate(300%) hue-rotate(30deg) brightness(50%)',
  display: 'grid',
  gridTemplateRows: 'auto 1fr',
  gridTemplateColumns: '4fr 1fr 1fr',
  gridAutoFlow: 'column',
  alignItems: 'center',
});

const StyledLabel = styled('div', {
  // position: 'absolute',
  // top: '0',
  padding: '$1 0 .125rem',
  typography: 'xs',
  textTransform: 'uppercase',
});
