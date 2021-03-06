// stitches.config.ts
import { createCss } from '@stitches/react';
import { formatRgb, hsv, interpolate, parse, rgb } from 'culori';

import { BASE_COLOR } from './lib';

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
    fontSizes: {
      xs: '.65rem',
      s: '.85rem',
      m: '1rem',
      l: '1.2rem',
    },
    fontWeights: {
      xs: '600',
      s: '500',
      m: '400',
      l: '600',
    },
    lineHeights: {
      xs: '1rem',
      s: '1rem',
      m: '1.4rem',
      l: '1.5rem',
    },
    colors: {
      blackA: 'rgba(0,0,0,.1)',
      blackAText: 'rgba(0,0,0,.66)',
      gray400: 'gainsboro',
      gray500: 'lightgray',
    },
    zIndices: {
      max: 2147483647,
      cursor: '$max',
    },
  },
  media: {
    phone: '(max-width: 400px)',
    tablet: '(max-width: 600px)',
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
    tintBgColor: () => (color?: string) => {
      if (!color) return {};
      const tint = interpolate([color, 'white']);
      return { backgroundColor: formatRgb(tint(0.8)) };
    },
    shadeColor: () => (color: string) => {
      const shade = interpolate([color, 'black']);
      return { color: formatRgb(shade(0.8)) };
    },
    typography: (config) => (scale: 'xs' | 's' | 'm' | 'l') => ({
      fontSize: config.theme.fontSizes[scale],
      fontWeight: config.theme.fontWeights[scale],
      lineHeight: config.theme.lineHeights[scale],
      letterSpacing: { xs: -0.3, s: 0, m: 0, l: -0.35 }[scale],
    }),
    shadowBorderColor: () => (color?: string) => {
      if (!color) return {};
      const colorWithAlpha = rgb(parse(color));
      colorWithAlpha.alpha = 0.3;
      return { boxShadow: `0 0 0 1px ${formatRgb(colorWithAlpha)}` };
    },
    tintToColor: () => (color?: string) => {
      if (!color) return {};
      console.log(color);
      // take the hue of our color
      const toColor = hsv(parse(color));
      // take the hue of the base color
      const baseColor = hsv(parse(BASE_COLOR));
      // take that difference and apply it to the hue rotation for this sepia-based tint filter
      const baseColorRotation = -110;
      const hueRotate = toColor.h - baseColor.h + baseColorRotation;
      return {
        filter: `sepia(1) saturate(35%) brightness(80%) hue-rotate(${hueRotate}deg)`,
      };
    },
  },
});
