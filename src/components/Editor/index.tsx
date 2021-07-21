import { useAtom } from 'jotai';
import React from 'react';

import data from '../../atoms/data';
import { styled } from '../../stitches.config';
import { Vec } from '../../types';
import { Pane, StyledPaneTitle } from '../Pane';

interface Props {
  id: string;
}

export function Editor(props: Props) {
  const [blog, setBlog] = useAtom(data.blogFamily(props.id));
  const [author] = useAtom(data.userFamily(blog?.author));

  if (!blog) return null;

  return (
    <Pane
      width={300}
      height={480}
      position={blog.position}
      onDrag={(nextPosition: Vec) => setBlog({ ...blog, position: nextPosition })}
      color={author?.color}>
      <StyledPaneTitle style={{ color: author?.color }}>
        {blog.title} © {author?.name}
      </StyledPaneTitle>
      <StyledEditor
        onPointerDown={(event) => event.stopPropagation()} // prevent pane onDrag stealing
        spellCheck={false}
        value={blog.content}
        onChange={(e) => setBlog({ ...blog, content: e.target.value })}
      />
    </Pane>
  );
}

const StyledEditor = styled('textarea', {
  resize: 'none',
  border: 'none',
  width: '100%',
  height: '100%',
  padding: '0 $2',
  background: 'transparent',
  noFocus: '',
  typography: 'm',
});
