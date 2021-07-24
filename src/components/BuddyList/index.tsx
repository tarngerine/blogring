import { useAtom } from 'jotai';
import { useAtomValue } from 'jotai/utils';
import React from 'react';

import data from '../../atoms/data';
import ui from '../../atoms/ui';
import { styled } from '../../stitches.config';
import { User, UUID } from '../../types';
import { Button, UnstyledLink } from '../Base';
import { Pane, StyledPaneTitle } from '../Pane';

const PANE = 'buddyList';

interface Props {
  blogs: UUID[];
}

export function BuddyList({ blogs }: Props) {
  const [panePos, setPanePos] = useAtom(ui.panes);
  return (
    <Pane
      width={150}
      position={panePos[PANE]}
      onDrag={({ position: nextPosition }) =>
        setPanePos((prev) => ({ ...prev, [PANE]: nextPosition }))
      }>
      <StyledPaneTitle>🪐 Ring buds</StyledPaneTitle>
      {/* <StyledSection>
        <Button>Join ring</Button>
      </StyledSection> */}
      <StyledList>
        {/* {Object.values(buddies).map((buddy) => (
          <Buddy key={buddy.id} user={buddy} />
        ))} */}
        {blogs.map((id) => (
          <Blog key={id} id={id} />
        ))}
      </StyledList>
    </Pane>
  );
}

function Blog({ id }: { id: UUID }) {
  const blog = useAtomValue(data.blogFamily(id));
  const author = useAtomValue(data.userFamily(blog?.author));
  if (!blog) return null;
  return (
    <>
      <StyledSection>
        <StyledItem>{author?.name}</StyledItem>
        <StyledItem
          key={blog.id}
          css={{ tintBgColor: blog.color, color: blog.color }}
          blog>
          <UnstyledLink href={`#blog-${blog.id}`}>{blog.title}</UnstyledLink>
        </StyledItem>
      </StyledSection>
    </>
  );
}

function Buddy({ user }: { user: User }) {
  const blogs = useAtomValue(data.blogInfoByUserFamily(user.id));
  return (
    <StyledSection>
      <StyledItem>{user.name}</StyledItem>
      {blogs &&
        blogs.map((blog) => (
          <StyledItem
            key={blog.id}
            css={{ tintBgColor: blog.color, color: blog.color }}
            blog>
            <UnstyledLink href={`#blog-${blog.id}`}>{blog.title}</UnstyledLink>
          </StyledItem>
        ))}
    </StyledSection>
  );
}

const StyledList = styled('ul', {});

const StyledItem = styled('li', {
  listStyle: 'none',
  padding: '$1',
  borderRadius: '$1',
  typography: 's',

  variants: {
    blog: {
      true: {
        padding: '$2',
        '&:hover': {
          filter: 'brightness(120%)',
          cursor: 'pointer',
        },
      },
    },
  },
});

const StyledSection = styled('div', {
  paddingTop: '$1',
  variants: {
    gap: {
      large: {
        paddingTop: '$2',
      },
    },
  },
});
