import { useAtom } from 'jotai';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import React, { useMemo } from 'react';

import data from '../../atoms/data';
import ui from '../../atoms/ui';
import { styled } from '../../stitches.config';
import { Blog, UUID } from '../../types';
import { UnstyledLink } from '../Base';
import { Pane, StyledPaneTitle } from '../Pane';
import { panToAtom } from '../World';

const PANE = 'buddyList';

interface Props {
  blogIds: UUID[];
}

export function BuddyList({ blogIds }: Props) {
  const [panePos, setPanePos] = useAtom(ui.panes);
  const blogs: Blog[] = useAtomValue(data.blogsFamily(blogIds));

  // Group blogs by user to display in list
  // FIXME: this will rerender a lot due to updatedAt in blogs above
  // ideally push getting Blog[] into Buddy, sort locally
  // all we need here is actually each blog's author, no other data
  // ring.blogIds > blogs > blogs.author > sort into author Ids

  // try useAtomCallback? or just make a writable atom?
  const blogsByUser = useMemo(() => {
    const byUser: Record<UUID, Blog[]> = {};
    blogs.forEach((blog) => {
      const author = blog.author;
      if (!byUser[author]) {
        byUser[author] = [];
      }
      byUser[author].push(blog);
    });
    return byUser;
  }, [blogs]);

  return (
    <Pane
      width={150}
      position={panePos[PANE]}
      onDrag={({ position: nextPosition }) => {
        if (nextPosition === undefined) return;
        setPanePos((prev) => ({ ...prev, [PANE]: nextPosition }));
      }}>
      <StyledPaneTitle>🪐 Ring buds</StyledPaneTitle>
      {/* <StyledSection>
        <Button>Join ring</Button>
      </StyledSection> */}
      <StyledList>
        {Object.entries(blogsByUser).map(([user, blogs]) => (
          <Buddy key={user} userId={user} blogs={blogs} />
        ))}
        {/* {blogs.map((id) => (
          <Blog key={id} id={id} />
        ))} */}
      </StyledList>
    </Pane>
  );
}

// function Blog({ id }: { id: UUID }) {
//   const blog = useAtomValue(data.blogFamily(id));
//   const author = useAtomValue(data.userFamily(blog?.author));
//   if (!blog) return null;
//   return (
//     <>
//       <StyledSection>
//         <StyledItem>{author?.name}</StyledItem>
//         <StyledItem
//           key={blog.id}
//           css={{ tintBgColor: blog.color, color: blog.color }}
//           blog>
//           <UnstyledLink href={`#blog-${blog.id}`}>{blog.title}</UnstyledLink>
//         </StyledItem>
//       </StyledSection>
//     </>
//   );
// }

function Buddy({ userId, blogs }: { userId: UUID; blogs: Blog[] }) {
  const user = useAtomValue(data.userFamily(userId));
  const panTo = useUpdateAtom(panToAtom);
  if (!user) return null;

  return (
    <>
      <StyledItem>{user.name}</StyledItem>
      <StyledList>
        {blogs &&
          blogs
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .map((blog) => (
              <li key={blog.id}>
                <StyledBlogLink
                  href={`#blog-${blog.id}`}
                  css={{ tintBgColor: blog.color, color: blog.color }}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    panTo(blog.position);
                  }}>
                  {blog.title}
                </StyledBlogLink>
              </li>
            ))}
      </StyledList>
    </>
  );
}

const StyledList = styled('ul', {
  display: 'grid',
  gap: '$1',
});

const StyledItem = styled('li', {
  listStyle: 'none',
  borderRadius: '$1',
  padding: '$1',
  typography: 's',
});

const StyledBlogLink = styled(UnstyledLink, {
  borderRadius: '$1',
  typography: 's',
  display: 'block',
  padding: '$2',
  cursor: 'pointer',

  '&:hover': {
    filter: 'brightness(102%)',
  },
  '&:active': {
    filter: 'brightness(98%)',
  },
});
