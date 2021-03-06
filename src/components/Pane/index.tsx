import { animated, useSpring } from '@react-spring/web';
import React, { useEffect, useState } from 'react';
import { useGesture } from 'react-use-gesture';

import { lerp, useSize } from '../../lib';
import { styled } from '../../stitches.config';
import { Vec } from '../../types';

interface Props {
  width: number | string;
  height?: number | string;
  position: Vec;
  onDrag?: ({
    position,
    rotation,
    origin,
  }: {
    position?: Vec;
    rotation?: number;
    origin?: string;
  }) => void;
  style?: React.CSSProperties;
  color?: string;
  rotation?: number;
  origin?: string;
  id?: string;
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
  id,
}: React.PropsWithChildren<Props>) {
  const { size, ref } = useSize();
  const { transformOrigin } = useSpring({
    from: {
      transformOrigin: 'center center',
    },
  });
  const { rotate } = useSpring({
    from: { rotate: 0 },
  });
  const spring = useSpring({
    x: position.x,
    y: position.y,
  });
  const [isDragging, setIsDragging] = useState(false);

  // Drag animations
  const bind = useGesture({
    onDrag: ({ event, buttons, first, delta: [dx, dy], velocities: [vx], last }) => {
      const e = event as React.PointerEvent<HTMLDivElement>;

      // reset when gesture finishes
      if (last) {
        rotate.start(0);
        setIsDragging(false);
        if (onDrag) onDrag({ rotation: 0, origin: transformOrigin.get() });
        return;
      }

      // left click only
      if (buttons !== 1) {
        return;
      }
      // prevent text selection
      e.preventDefault();
      if (first) {
        // We are preventing default so need to manually blur focused textarea
        // Because animation framerate drops when textarea is focused
        const el = document.activeElement;
        if (el?.tagName === 'TEXTAREA') {
          (el as HTMLTextAreaElement).blur();
        }
      }

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

  // Respond to remote rotation and origin
  useEffect(() => {
    if (rotation !== undefined) {
      rotate.start(rotation);
    }
  }, [rotation]);

  useEffect(() => {
    if (origin !== undefined) {
      transformOrigin.start(origin);
    }
  }, [origin]);

  return (
    <StyledPane
      id={id}
      css={{ focus: color, tintBgColor: color }}
      style={{ ...style, width, height, ...spring, transformOrigin, rotate }}
      ref={ref}
      isDragging={isDragging}
      {...bind()}>
      {children}
    </StyledPane>
  );
}

const StyledPane = styled(animated.div, {
  position: 'absolute',
  boxShadow: '0 0 0 1px $colors$blackA',
  background: 'white',
  padding: '$2',
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
    fixed: {
      true: {
        position: 'fixed',
      },
    },
  },
});

export const StyledPaneTitle = styled('div', {
  typography: 's',
  marginTop: '-.125rem',
  padding: '0 $1 $1 $1',
  display: 'grid',
  placeItems: 'center',
});
