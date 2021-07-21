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
    <>
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
    </>
  );
}

const StyledList = styled('ul', {});

const StyledItem = styled('li', {
  listStyle: 'none',
  padding: '$1 $2',
  borderRadius: '$2',
  typography: 's',
  '&:hover': {
    filter: 'brightness(120%)',
    cursor: 'pointer',
  },

  variants: {
    blog: {
      true: {},
    },
  },
});
