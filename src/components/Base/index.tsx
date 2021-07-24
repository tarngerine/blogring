import { styled } from '../../stitches.config';

export const UnstyledLink = styled('a', {
  textDecoration: 'none',
  color: 'inherit',
});

// DO NOT EDIT MANUALLY
// THIS IS COPIED FROM BUTTON BELOW
export const ButtonLink = styled('a', {
  padding: '$2',
  borderRadius: '$1',
  typography: 's',
  display: 'block',
  width: '100%',
  background: 'whitesmoke',
  color: '$blackAText',

  '&:hover': {
    filter: 'brightness(102%)',
    cursor: 'pointer',
  },
  '&:active': {
    filter: 'brightness(98%)',
  },
});

export const Button = styled('button', {
  padding: '$2',
  borderRadius: '$1',
  typography: 's',
  display: 'block',
  width: '100%',
  background: 'whitesmoke',
  color: '$blackAText',
  transition: 'transform .15s ease-in-out',

  '&:hover': {
    filter: 'brightness(102%)',
    cursor: 'pointer',
    transform: `rotate(-.5deg) scale(1.03)`,
    transition: 'transform .1s ease-in',
  },
  '&:active': {
    filter: 'brightness(98%)',
    transform: `rotate(3deg) scale(.98)`,
    transition: 'transform .1s ease-out',
  },

  variants: {
    size: {
      s: {
        padding: '$1 $2',
      },
    },
  },
});
