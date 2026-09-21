import type { User, UserCreateInput } from './user';

export function createUser(input: UserCreateInput): User {
  return {
    id: crypto.randomUUID(),
    email: input.email,
    name: input.name,
    avatar: input.avatar,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function updateUser(user: User, updates: Partial<UserUpdateInput>): User {
  return {
    ...user,
    ...updates,
    updatedAt: new Date().toISOString()
  };
}
