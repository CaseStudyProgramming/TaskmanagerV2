import type { User } from '../model/user';

export function getUserInitials(user: User): string {
  if (user.name) {
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  return user.email[0].toUpperCase();
}

export function getUserDisplayName(user: User): string {
  return user.name || user.email;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
