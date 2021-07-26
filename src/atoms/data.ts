import { filterHueRotate, formatRgb, parse, rgb } from 'culori';
import { atom } from 'jotai';
import { atomFamily, atomWithStorage } from 'jotai/utils';
import { v4 as uuid } from 'uuid';

import { Blog, Ring, User, UUID } from '../types';

const rings = atomWithStorage<Record<UUID, Ring>>('rings', {
  '1': {
    id: '1',
    name: '∂allas cr∑w',
    color: 'lightblue',
    blogs: ['1', '2'],
  },
});

const users = atomWithStorage<Record<UUID, User>>('users', {
  '1': {
    id: '1',
    name: 'julius',
    color: 'salmon',
    rings: ['1'],
  },
  '2': {
    id: '2',
    name: 'sabrina',
    color: 'mediumorchid',
    rings: ['1'],
  },
});

const userFamily = atomFamily((id: UUID | undefined) =>
  atom(
    (get) => {
      return id ? get(users)[id] : undefined;
    },
    (_, set, user: User) => {
      set(users, (prev) => ({
        ...prev,
        [user.id]: user,
      }));
    },
  ),
);

const blogIds = atomWithStorage<UUID[]>('blogIds', ['2', '1']);

const blogs = atomWithStorage<Record<UUID, Blog>>('blogs', {
  '1': {
    id: '1',
    author: '1',
    title: 'Vibe log',
    content: 'vibin and jigglin\n\nfinally below 90 in dallas this wk',
    position: { x: 300, y: 300 },
    updatedAt: Date.now(),
    color: 'salmon',
  },
  '2': {
    id: '2',
    author: '2',
    title: 'army takes',
    content: '🧈',
    position: { x: 100, y: 100 },
    updatedAt: Date.now(),
    color: 'mediumorchid',
  },
});

// Adds a blog to a ring
const createBlog = atom(
  null,
  (_, set, { blogInfo, ringId }: { blogInfo: Partial<Blog>; ringId: UUID }) => {
    const blog = newBlog(blogInfo);
    set(blogs, (prev) => ({ ...prev, [blog.id]: blog }));
    set(rings, (prev) => ({
      ...prev,
      [ringId]: { ...prev[ringId], blogs: [...prev[ringId].blogs, blog.id] },
    }));
  },
);

// Creates a new Blog given partial information
function newBlog(blog: Partial<Blog>) {
  const hueRotate = filterHueRotate(Math.random() * 360);
  return {
    id: blog.id || uuid(),
    title: blog.title || 'New blog',
    author: blog.author || 'no author provided',
    content: blog.content || '',
    color: blog.color || formatRgb(hueRotate(parse('salmon'))), // Base color to generate from
    updatedAt: Date.now(),
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
  window.localStorage.removeItem('users');
  window.localStorage.removeItem('panes');
  window.localStorage.removeItem('currentUserId');
  window.localStorage.removeItem('rings');
};

// UUID : Blog
const blogFamily = atomFamily((id: UUID | undefined) =>
  atom(
    (get) => {
      return id ? get(blogs)[id] : undefined;
    },
    (_, set, blog: Blog) => {
      set(blogs, (prev) => ({
        ...prev,
        [blog.id]: blog,
      }));
    },
  ),
);

// UUID[] : Blog[]
const blogsFamily = atomFamily((ids: UUID[]) =>
  atom((get) => {
    const allBlogs = get(blogs);
    console.log(ids, allBlogs);
    return ids.map((id) => allBlogs[id]);
  }),
);

const atoms = {
  blogIds,
  blogs,
  createBlog,
  blogFamily,
  blogsFamily,
  users,
  userFamily,
  blogInfoByUserFamily,
  rings,
};

export default atoms;
