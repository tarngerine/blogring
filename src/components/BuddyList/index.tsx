import { useAtom } from 'jotai';
import { useAtomValue } from 'jotai/utils';
import React from 'react';

import data from '../../atoms/data';
import ui from '../../atoms/ui';
import { styled } from '../../stitches.config';
import { User } from '../../types';
import { Pane, StyledPaneTitle } from '../Pane';

const PANE = 'buddyList';

export function BuddyList() {
  const [panePos, setPanePos] = useAtom(ui.panes);
  const [buddies] = useAtom(data.users);
  return (
    <Pane
      width={150}
      position={panePos[PANE]}
      onDrag={(nextPosition) =>
        setPanePos((prev) => ({ ...prev, [PANE]: nextPosition }))
      }>
      <StyledPaneTitle>🪐 Ring Buds</StyledPaneTitle>
      <StyledList>
        {Object.values(buddies).map((buddy) => (
          <Buddy key={buddy.id} user={buddy} />
        ))}
      </StyledList>
    </Pane>
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
            {blog.title}
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
});
