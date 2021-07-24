export type UUID = string;

export type Ring = {
  id: UUID;
  name: string;
  color: string;
  blogs: UUID[];
};

export type Blog = {
  id: UUID;
  content: string;
  title: string;
  author: string;
  position: Vec;
  updatedAt: number;
  color: string;
};

export type Vec = {
  x: number;
  y: number;
};

export type User = {
  id: UUID;
  name: string;
  color: string;
  rings: UUID[];
};
