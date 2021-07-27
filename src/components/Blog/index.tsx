import { animated, useSpring } from '@react-spring/web';
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
    <div
      style={{
        // sort panes by updated at
        // trim off the first 2 and last 2 digits (which usually deal w year, ms) to make it a valid zindex
        // 1627360547700 -> 2736054770, still has .1s accuracy
        zIndex: Math.round((blog.updatedAt % 100000000000) / 100),
        position: 'absolute',
      }}>
      <AnimateEntryOnce createdAt={blog.createdAt}>
        <Pane
          id={`blog-${blog.id}`}
          width={BLOGSIZE.x}
          height={BLOGSIZE.y}
          position={blog.position}
          rotation={rotation?.rotation}
          origin={rotation?.origin}
          onDrag={({ position: nextPosition, rotation, origin }) => {
            if (nextPosition !== undefined) {
              setBlog((prev) => {
                const next = {
                  ...prev,
                  position: nextPosition,
                };

                // Send partial payload
                send({
                  event: 'blog',
                  blog: {
                    id: next.id,
                    position: next.position,
                    updatedAt: next.updatedAt,
                  },
                } as BlogPayload);

                return next;
              });
            }

            if (rotation !== undefined && origin !== undefined) {
              send({
                event: 'rotation',
                id: blog.id,
                rotation,
                origin,
              });
            }
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
              setBlog((prev) => {
                const next = { ...prev, content: e.target.value };

                // Send partial payload
                send({
                  event: 'blog',
                  blog: {
                    id: next.id,
                    content: next.content,
                    updatedAt: next.updatedAt,
                  },
                } as BlogPayload);

                return next;
              });
            }}
          />
        </Pane>
      </AnimateEntryOnce>
    </div>
  );
}

export const shouldAnimateEntryAtom = atom<UUID[]>([]);

function AnimateEntryOnce({
  children,
  createdAt,
}: React.PropsWithChildren<{ createdAt: number }>) {
  const { y, opacity } = useSpring({
    from: { y: 0, opacity: 0 },
  });

  // If should animate reset to 0 offset
  useEffect(() => {
    const should = Date.now() - createdAt < 1000;
    if (should) {
      y.set(2000);
      y.start(0);
    }
    opacity.set(1); // prevent flickering before animation code runs
  }, [createdAt]);

  return (
    <animated.div style={{ y, opacity, willChange: 'transform' }}>
      {children}
    </animated.div>
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
