import { animated, useSpring } from '@react-spring/web';
import React, { useState } from 'react';
import { useGesture } from 'react-use-gesture';

import { lerp, useSize } from '../../lib';
import { styled } from '../../stitches.config';
import { Vec } from '../../types';

interface Props {
  width: number;
  height?: number;
  position: Vec;
  onDrag?: ({
    position,
    rotation,
    origin,
  }: {
    position: Vec;
    rotation: number;
    origin: string;
  }) => void;
  style?: React.CSSProperties;
  color?: string;
  rotation?: number;
  origin?: string;
}

export function Pane({
  children,
  width,
  height,
  position,
  onDrag,
  style,
  color,
  rotation,
  origin,
}: React.PropsWithChildren<Props>) {
  const { size, ref } = useSize();
  const { transformOrigin } = useSpring({
    from: {
      transformOrigin: 'center center',
    },
    to: origin
      ? {
          transformOrigin: origin,
        }
      : {}, // repond to remote origin
  });
  const { rotate } = useSpring({
    from: { rotate: 0 },
    to: rotation ? { rotate: rotation } : {}, // repond to remote rotation
  });
  const spring = useSpring({
    x: position.x,
    y: position.y,
  });
  const [isDragging, setIsDragging] = useState(false);

  const bind = useGesture({
    onDrag: ({ event, buttons, first, delta: [dx, dy], velocities: [vx], last }) => {
      const e = event as React.PointerEvent<HTMLDivElement>;
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
      e.preventDefault();

      // move pane
      const newX = position.x + dx;
      const newY = position.y + dy;
      spring.x.set(newX);
      spring.y.set(newY);

      // rotate physics
      const offset = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }; // offset inside Pane
      const origin = `${offset.x}px  ${offset.y}px`;
      if (first) {
        // save offset as the transform origin for physics animations
        transformOrigin.set(origin);
        setIsDragging(true);
      }
      // physics flips depending on how high up cursor is
      const flip = lerp(offset.y, [0, size.y], [1, -1]);
      const rotation = vx * 20 * flip;
      rotate.start(rotation);

      // onDrag callback
      if (onDrag) onDrag({ position: { x: newX, y: newY }, rotation, origin });
    },
  });
  return (
    <StyledPane
      css={{ focus: color }}
      style={{ width, height, ...spring, transformOrigin, rotate }}
      ref={ref}
      isDragging={isDragging}
      {...bind()}>
      <StyledPaneStyler css={{ tintBgColor: color }} style={style} />
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
  cursor: 'grab',
  variants: {
    isDragging: {
      true: {
        cursor: 'grabbing',
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
  typography: 's',
  padding: '.125rem $1 $1 $1',
  display: 'grid',
  placeItems: 'center',
});
