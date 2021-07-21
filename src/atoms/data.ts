import { atom } from 'jotai';
import { atomFamily, atomWithStorage } from 'jotai/utils';

import { Blog, User } from '../types';

const users = atomWithStorage<Record<string, User>>('users', {
  '1': {
    id: '1',
    name: 'julius',
    color: 'salmon',
  },
  '2': {
    id: '2',
    name: 'sabrina',
    color: 'mediumorchid',
  },
});

const userFamily = atomFamily((id: string | undefined) =>
  atom(
    (get) => {
      return id ? get(users)[id] : undefined;
    },
    (get, set, user: User) => {
      set(users, (prev) => ({
        ...prev,
        [user.id]: user,
      }));
    },
  ),
);

const blogIds = atomWithStorage<string[]>('blogIds', ['2', '1']);

const blogs = atomWithStorage<Record<string, Blog>>('blogs', {
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

const blogInfoByUser = atom<Record<string, Partial<Blog>[]>>((get) => {
  const allBlogs = get(blogs);
  const allUsers = get(users);
  const result = {} as Record<string, Partial<Blog>[]>;
  Object.keys(allUsers).forEach((id) => {
    result[id] = Object.values(allBlogs)
      .filter(({ author }) => author === id)
      .map(({ id, title, color, updatedAt }) => ({ id, title, color, updatedAt }));
  });
  return result;
});

const blogInfoByUserFamily = atomFamily((id: string | undefined) =>
  atom((get) => {
    return id ? get(blogInfoByUser)[id] : undefined;
  }),
);

(window as any).resetData = () => {
  window.localStorage.removeItem('blogsIds');
  window.localStorage.removeItem('blogs');
  window.localStorage.removeItem('panes');
};

const blogFamily = atomFamily((id: string | undefined) =>
  atom(
    (get) => {
      return id ? get(blogs)[id] : undefined;
    },
    (get, set, blog: Blog) => {
      set(blogs, (prev) => ({
        ...prev,
        [blog.id]: blog,
      }));
    },
  ),
);

const atoms = { blogIds, blogs, blogFamily, users, userFamily, blogInfoByUserFamily };

export default atoms;
