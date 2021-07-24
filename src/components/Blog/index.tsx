import { atom, useAtom } from 'jotai';
import { atomFamily, useAtomValue, useUpdateAtom } from 'jotai/utils';
import React from 'react';

import data from '../../atoms/data';
import {
  BlogPayload,
  RotationPayload,
  socketStateAtom,
  useSendSocket,
  useSetSocketHandler,
} from '../../lib/ws';
import { styled } from '../../stitches.config';
import { UUID } from '../../types';
import { Pane, StyledPaneTitle } from '../Pane';

interface Props {
  id: string;
}

export function Blogs({ ids }: { ids: UUID[] }) {
  // const blogIds = useAtomValue(blogIds);
  const setBlogs = useUpdateAtom(data.blogs);

  useSetSocketHandler('blog', (payload) => {
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
      {ids.map((id) => (
        <BlogPane key={id} id={id} />
      ))}
    </>
  );
}

const blogPaneRotationFamily = atomFamily((id: string) =>
  atom((get) => {
    const rotations = get(socketStateAtom)['rotation'] as Record<
      string,
      Omit<RotationPayload, 'event' | 'id'>
    >;

    return rotations && rotations[id];
  }),
);

export function BlogPane(props: Props) {
  const [blog, setBlog] = useAtom(data.blogFamily(props.id));
  const [author] = useAtom(data.userFamily(blog?.author));
  const send = useSendSocket(false);
  const rotation = useAtomValue(blogPaneRotationFamily(props.id));

  if (!blog) return null;

  return (
    <Pane
      id={`blog-${blog.id}`}
      width={300}
      height={480}
      position={blog.position}
      rotation={rotation?.rotation}
      origin={rotation?.origin}
      onDrag={({ position: nextPosition, rotation, origin }) => {
        setBlog({ ...blog, position: nextPosition });
        send({
          event: 'blog',
          id: blog.id,
          blog: { id: blog.id, position: nextPosition },
        } as BlogPayload);
        send({
          event: 'rotation',
          id: blog.id,
          rotation,
          origin,
        });
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
        onChange={(e) => {
          setBlog({ ...blog, content: e.target.value });
          send({
            event: 'blog',
            id: blog.id,
            blog: { id: blog.id, content: e.target.value },
          } as BlogPayload);
        }}
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
