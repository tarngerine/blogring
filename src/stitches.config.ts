// stitches.config.ts
import { createCss } from '@stitches/react';

export const { styled, css, global, keyframes, getCssString, theme } = createCss({
  theme: {
    space: {
      1: '.25rem',
      2: '.5rem',
      3: '.75rem',
      4: '1rem',
    },
    radii: {
      1: '.25rem',
      2: '.5rem',
      3: '.75rem',
      4: '1rem',
    },
    colors: {
      blackA: 'rgba(0,0,0,.1)',
      gray400: 'gainsboro',
      gray500: 'lightgray',
    },
  },
  media: {
    bp1: '(min-width: 480px)',
  },
  utils: {
    full: () => (position: '' | 'fixed' | 'absolute') => ({
      position: position !== '' ? position : 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    }),
    focus: () => (color: string) => ({
      '&:focus-within': {
        boxShadow: `0 0 0 2px ${color ? color : `rgba(0, 0, 255, 0.3)`}`,
      },
    }),
    noFocus: () => () => ({ '&:focus': { outline: 'none' } }),
    // marginX: (config) => (value) => ({ marginLeft: value, marginRight: value }),
  },
});
