export type Blog = {
  id: string;
  content: string;
  title: string;
  author: string;
  position: Vec;
  updatedAt: number;
};

export type Vec = {
  x: number;
  y: number;
};

export type User = {
  id: string;
  name: string;
  color: string;
};
