import type { Role } from "@prisma/client";

export type SafeUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: Role;
  bio: string | null;
  phone: string | null;
  dateOfBirth: Date | null;
  createdAt: Date;
};

export type PostWithAuthor = {
  id: string;
  content: string;
  image: string | null;
  video: string | null;
  document: string | null;
  tags: string[];
  visibility: string;
  createdAt: Date;
  updatedAt: Date;
  author: SafeUser;
  comments: number;
  likes: number;
  isLiked: boolean;
};

export type ChatMessage = {
  id: string;
  content: string;
  image: string | null;
  file: string | null;
  createdAt: Date;
  sender: SafeUser;
};

export type FamilyTreeNode = {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
  dateOfBirth: Date | null;
  dateOfDeath: Date | null;
  photo: string | null;
  bio: string | null;
  birthplace: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  parentId: string | null;
  children: FamilyTreeNode[];
};

export type SidebarItem = {
  label: string;
  href: string;
  icon: string;
  badge?: number;
};
