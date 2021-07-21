import { useAtom } from 'jotai';
import React from 'react';

import data from '../../atoms/data';
import ui from '../../atoms/ui';
import { styled } from '../../stitches.config';
import { Pane, StyledPaneTitle } from '../Pane';

const PANE = 'buddyList';

export function BuddyList() {
  const [panePos, setPanePos] = useAtom(ui.panes);
  const [buddies, setBuddies] = useAtom(data.users);
  return (
    <Pane
      width={150}
      position={panePos[PANE]}
      onDrag={(nextPosition) =>
        setPanePos((prev) => ({ ...prev, [PANE]: nextPosition }))
      }>
      <StyledPaneTitle>🪐 Ring Buds</StyledPaneTitle>
      <StyledList>
        {Object.keys(buddies).map((id) => (
          <StyledItem key={id}>{buddies[id].name}</StyledItem>
        ))}
      </StyledList>
    </Pane>
  );
}

const StyledList = styled('ul', {});

const StyledItem = styled('li', {
  listStyle: 'none',
  padding: '$1 $2',
  borderRadius: '$2',
  '&:hover': {
    background: '$blackA',
  },
});
