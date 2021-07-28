import { useUpdateAtom } from 'jotai/utils';
import React from 'react';

import { useUser } from '../../atoms/current';
import data from '../../atoms/data';
import { styled } from '../../stitches.config';
import { Ring } from '../../types';
import { Button } from '../Base';

interface Props {
  ring: Ring;
}

export function Banner({ ring: { color, id, name } }: Props) {
  const createBlog = useUpdateAtom(data.createBlog);
  const [user, setUser] = useUser();

  if (!user) return null;

  return (
    <>
      <StyledBanner css={{ boxShadow: `0 .5px 0 0 ${color}` }}>
        {/* <StyledLabel>{new Date().getFullYear()}</StyledLabel> */}
        <StyledText>
          {new Date().toDateString().split(' ').slice(0, 3).join(' ')}
        </StyledText>
        {/* <StyledLabel>{new Date().toDateString()}</StyledLabel> */}

        {/* <StyledLabel>Ring</StyledLabel> */}
        <StyledH1>{name}</StyledH1>
        {/* <StyledLabel>Write with {blogs.length} others</StyledLabel> */}
        <StyledAction>
          <Button
            size="s"
            css={{ background: '$blackA', color, focus: color }}
            onClick={() => {
              if (user.name === '') {
                const name = prompt(
                  'what do you want to be known as in this ring?',
                  'pseudonym',
                );
                if (!name) return console.error('No name provided');
                setUser({ ...user, name });
              }

              const title = prompt('name this new blog', 'my cool new blog');
              if (!title) return console.error('No title provided');
              createBlog({
                ringId: id,
                blogInfo: {
                  title,
                  author: user.id,
                },
              });
            }}>
            Create blog
          </Button>
        </StyledAction>
      </StyledBanner>
    </>
  );
}

const StyledH1 = styled('h1', {
  typography: 'm',
  fontWeight: '600',
  '@phone': {
    typography: 's',
  },
});

const StyledText = styled('div', {
  typography: 'm',
  '@phone': {
    typography: 's',
  },
});

const StyledBanner = styled('div', {
  position: 'fixed',
  top: '$2',
  left: '$4',
  right: '$4',
  padding: '0 0 $2',
  opacity: '0.8',
  color: 'lightblue',
  filter: 'saturate(300%) hue-rotate(30deg) brightness(45%)',
  display: 'grid',
  // gridTemplateRows: 'auto 1fr',
  gridTemplateColumns: '1fr 4fr 1fr',
  gridAutoFlow: 'column',
  alignItems: 'center',
  gridGap: '$4',

  '@tablet': {
    gridTemplateColumns: 'auto 1fr auto',
  },
  '@phone': {
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: 'auto auto',
    gridGap: '$1',
    alignItems: 'start',
    gridAutoFlow: 'row',
  },
});

const StyledAction = styled('div', {
  '@phone': {
    gridColumn: '1 / span 2',
  },
});

// const StyledLabel = styled('div', {
//   // position: 'absolute',
//   // top: '0',
//   padding: '$1 0 .125rem',
//   typography: 'xs',
//   textTransform: 'uppercase',
// });
