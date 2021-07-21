import { animated, to, useSpring } from '@react-spring/web';
import React, { useState } from 'react';
import { useGesture } from 'react-use-gesture';

import { lerp, useSize } from '../../lib';
import { styled } from '../../stitches.config';
import { Vec } from '../../types';

interface Props {
  width: number;
  height?: number;
  position: Vec;
  onDrag?: (position: Vec) => void;
  style?: React.CSSProperties;
  color?: string;
}

export function Pane({
  children,
  width,
  height,
  position,
  onDrag,
  style,
  color,
}: React.PropsWithChildren<Props>) {
  const { size, ref } = useSize();
  const { transformOrigin } = useSpring({
    from: {
      transformOrigin: 'center center',
    },
  });
  const { rotate } = useSpring({ from: { rotate: 0 } });
  const spring = useSpring({
    x: position.x,
    y: position.y,
  });
  const [isDragging, setIsDragging] = useState(false);
  const bind = useGesture({
    onDrag: ({
      event,
      buttons,
      first,
      xy: [x, y],
      delta: [dx, dy],
      velocities: [vx],
      last,
    }) => {
      // reset when gesture finishes
      if (last) {
        rotate.start(0);
        setIsDragging(false);
      }

      // left click only
      if (buttons !== 1) {
        return;
      }
      // prevent text selection
      event.preventDefault();

      // move pane
      const newX = position.x + dx;
      const newY = position.y + dy;
      spring.x.set(newX);
      spring.y.set(newY);

      // onDrag callback
      if (onDrag) onDrag({ x: newX, y: newY });

      // rotate physics
      const offset = { x: x - position.x, y: y - position.y }; // offset inside Pane
      if (first) {
        // save offset as the transform origin for physics animations
        transformOrigin.set(`${offset.x}px  ${offset.y}px`);
        setIsDragging(true);
      }
      // physics flips depending on how high up cursor is
      const flip = lerp(offset.y, [0, size.y], [1, -1]);
      rotate.start(vx * 20 * flip);
    },
  });
  return (
    <StyledPane
      css={{ focus: color }}
      style={{ width, height, ...spring, transformOrigin, rotate }}
      ref={ref}
      isDragging={isDragging}
      {...bind()}>
      <StyledPaneStyler style={style} />
      {children}
    </StyledPane>
  );
}

const StyledPane = styled(animated.div, {
  position: 'absolute',
  boxShadow: '0 0 0 1px $colors$blackA',
  background: 'white',
  padding: '$1',
  borderRadius: '$2',
  overflow: 'hidden',
  transition: 'box-shadow .25s linear',
  focus: '',
  variants: {
    isDragging: {
      true: {
        cursor: 'grab',
        boxShadow: '0 0 0 1px $colors$blackA, 0 20px 40px 0 $colors$blackA',
      },
    },
  },
});

const StyledPaneStyler = styled('div', {
  full: '',
  borderRadius: '$2',
  zIndex: '-1',
});

export const StyledPaneTitle = styled('div', {
  fontSize: '.85rem',
  fontWeight: '500',
  opacity: '.5',
  padding: '.125rem $1 0 $1',
  display: 'grid',
  placeItems: 'center',
});
