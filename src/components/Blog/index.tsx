import { atom, useAtom } from 'jotai';
import { atomFamily, useAtomValue, useUpdateAtom } from 'jotai/utils';
import React, { useEffect } from 'react';

import data from '../../atoms/data';
import {
  BlogPayload,
  RotationPayload,
  socketStateAtom,
  useSendSocket,
  useSetSocketHandler,
} from '../../lib/ws';
import { styled } from '../../stitches.config';
import { UUID, Vec } from '../../types';
import { Pane, StyledPaneTitle } from '../Pane';

export const BLOGSIZE: Vec = { x: 300, y: 480 };

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
      width={BLOGSIZE.x}
      height={BLOGSIZE.y}
      position={blog.position}
      rotation={rotation?.rotation}
      origin={rotation?.origin}
      onDrag={({ position: nextPosition, rotation, origin }) => {
        setBlog({ position: nextPosition });
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
      color={blog.color}
      style={{
        // sort panes by updated at
        // trim off the first 3 digits (which usually deal w year) to make it a valid zindex
        zIndex: blog.updatedAt % 10000000,
      }}>
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
