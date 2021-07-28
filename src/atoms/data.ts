import { atom } from 'jotai';
import { atomFamily, atomWithStorage } from 'jotai/utils';
import { v4 as uuid } from 'uuid';

import { BLOGSIZE, shouldAnimateEntryAtom } from '../components/Blog';
import { randomColor } from '../lib';
import { BlogPayload, RingPayload, sendSocketAtom, UserPayload } from '../lib/ws';
import { Blog, Ring, User, UUID } from '../types';
import { currentScrollOffsetAtom, currentWindowSizeAtom } from './current';

const rings = atomWithStorage<Record<UUID, Ring>>('rings', {
  '1': {
    id: '1',
    name: 'cuties vibin',
    color: 'lightblue',
    blogs: ['1'],
  },
});

const ringFamily = atomFamily((id: UUID) =>
  atom((get) => {
    const ring = get(rings)[id];
    return ring;
  }),
);

const users = atomWithStorage<Record<UUID, User>>('users', {
  '1': {
    id: '1',
    name: 'julius',
    color: 'salmon',
    rings: ['1'],
  },
});

const userFamily = atomFamily((id: UUID | null) =>
  atom(
    (get) => {
      return id ? get(users)[id] : null;
    },
    (_, set, user: User) => {
      set(users, (prev) => ({
        ...prev,
        [user.id]: user,
      }));
      set(sendSocketAtom, { event: 'user', user } as UserPayload);
    },
  ),
);

// const blogIds = atomWithStorage<UUID[]>('blogIds', ['2', '1']);
const blogs = atomWithStorage<Record<UUID, Blog>>('blogs', {
  '1': {
    id: '1',
    author: '1',
    title: 'welcome~',
    content: `welcome to blogring

it's a place for u to share ur thoughts and feelings with friends from cyberspace. i made this because i missed the synchronous vibes and pseudonymity of using aim with irl and net friends

this is a shared ring, you can create a blog in here and only others in this ring can see it

try creating one! everything's live!
    `,
    position: { x: 200, y: 200 },
    updatedAt: Date.now() + 100,
    color: 'salmon',
    createdAt: Date.now() + 100,
  },
});

// Adds a blog to a ring
const createBlog = atom(
  null,
  (get, set, { blogInfo, ringId }: { blogInfo: Partial<Blog>; ringId: UUID }) => {
    // center the new blog post
    const scrollOffset = get(currentScrollOffsetAtom);
    const screenSize = get(currentWindowSizeAtom);
    const blog = newBlog({
      ...blogInfo,
      position: {
        x: -scrollOffset.x + screenSize.x / 2 - BLOGSIZE.x / 2,
        y: -scrollOffset.y + screenSize.y / 2 - BLOGSIZE.y / 2,
      },
    });

    // Add to shouldAnimateEntry to animate newly created blog
    set(shouldAnimateEntryAtom, (prev) => [...prev, blog.id]);

    // Update the blogs, then reference the id in the specified ring
    set(blogs, (prev) => ({ ...prev, [blog.id]: blog }));
    const ring = get(ringFamily(ringId));
    const updatedRing = {
      ...ring,
      blogs: [...ring.blogs, blog.id],
    };
    set(rings, (prev) => ({
      ...prev,
      [ringId]: updatedRing,
    }));

    // Send new blog
    set(sendSocketAtom, {
      event: 'blog',
      blog,
    } as BlogPayload);

    // Send updated ring
    set(sendSocketAtom, {
      event: 'ring',
      ring: {
        id: ringId,
        blogs: updatedRing.blogs,
      },
    } as RingPayload);
  },
);

// Creates a new Blog given partial information
function newBlog(blog: Partial<Blog>) {
  return {
    id: blog.id || uuid(),
    title: blog.title || 'New blog',
    author: blog.author || 'no author provided',
    content: blog.content || '',
    color: blog.color || randomColor(),
    updatedAt: Date.now(),
    createdAt: Date.now(),
    position: blog.position || { x: 0, y: 0 },
  } as Blog;
}

const blogInfoByUser = atom<Record<UUID, Partial<Blog>[]>>((get) => {
  const allBlogs = get(blogs);
  const allUsers = get(users);
  const result = {} as Record<UUID, Partial<Blog>[]>;
  Object.keys(allUsers).forEach((id) => {
    result[id] = Object.values(allBlogs)
      .filter(({ author }) => author === id)
      .map(({ id, title, color, updatedAt }) => ({ id, title, color, updatedAt }));
  });
  return result;
});

const blogInfoByUserFamily = atomFamily((id: UUID | undefined) =>
  atom((get) => {
    return id ? get(blogInfoByUser)[id] : undefined;
  }),
);

(window as any).resetData = () => {
  window.localStorage.removeItem('blogsIds');
  window.localStorage.removeItem('blogs');
  window.localStorage.removeItem('panes');
  window.localStorage.removeItem('users');
  window.localStorage.removeItem('currentUserId');
  window.localStorage.removeItem('currentRingId');
  window.localStorage.removeItem('rings');
};

// UUID : Blog
const blogFamily = atomFamily((id: UUID) =>
  atom(
    (get) => get(blogs)[id],
    (_, set, setter: (blog: Blog) => Blog) => {
      set(blogs, (prev) => {
        // Update timestamp so the setter has access
        const prevWithNextTime = {
          ...prev[id],
          updatedAt: Date.now(),
        };
        const next = setter(prevWithNextTime);
        return {
          ...prev,
          [id]: {
            ...prev[id],
            ...next,
          },
        };
      });
    },
  ),
);

// UUID[] : Blog[]
const blogsFamily = atomFamily((ids: UUID[]) =>
  atom((get) => {
    const allBlogs = get(blogs);
    return ids.map((id) => allBlogs[id]);
  }),
);

const atoms = {
  // blogIds,
  blogs,
  createBlog,
  blogFamily,
  blogsFamily,
  users,
  userFamily,
  blogInfoByUserFamily,
  rings,
  ringFamily,
};

export default atoms;
