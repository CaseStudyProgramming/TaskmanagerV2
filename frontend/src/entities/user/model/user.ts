export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserCreateInput {
  email: string;
  name?: string;
  avatar?: string;
}

export interface UserUpdateInput {
  name?: string;
  avatar?: string;
}
