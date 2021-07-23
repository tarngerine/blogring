import { useAtom } from 'jotai';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import React from 'react';

import data from '../../atoms/data';
import { BlogPayload, useSendSocket, useSetSocketHandler } from '../../lib/ws';
import { styled } from '../../stitches.config';
import { Vec } from '../../types';
import { Pane, StyledPaneTitle } from '../Pane';

interface Props {
  id: string;
}

export function Blogs() {
  const blogIds = useAtomValue(data.blogIds);
  const setBlogs = useUpdateAtom(data.blogs);

  useSetSocketHandler('blog', (payload) => {
    console.log('BLOG HANDLER', payload);
    const { blog } = payload as BlogPayload;
    setBlogs((prev) => ({
      ...prev,
      [blog.id]: {
        ...prev[blog.id],
        ...blog,
      },
    }));
  });
  return (
    <>
      {blogIds.map((id) => (
        <BlogPane key={id} id={id} />
      ))}
    </>
  );
}

export function BlogPane(props: Props) {
  const [blog, setBlog] = useAtom(data.blogFamily(props.id));
  const [author] = useAtom(data.userFamily(blog?.author));
  const send = useSendSocket();

  if (!blog) return null;

  return (
    <Pane
      width={300}
      height={480}
      position={blog.position}
      onDrag={(nextPosition: Vec) => {
        setBlog({ ...blog, position: nextPosition });
        send({
          event: 'blog',
          blog: { id: blog.id, position: nextPosition },
        } as BlogPayload);
      }}
      color={blog.color}>
      <StyledPaneTitle style={{ color: blog.color }}>
        {blog.title} © {author?.name}
      </StyledPaneTitle>
      <StyledEditor
        css={{ shadeColor: blog.color }}
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
