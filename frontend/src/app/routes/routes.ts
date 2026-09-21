export const routes = {
  '/': 'home',
  '/auth/login': 'auth/login',
  '/auth/callback': 'auth/callback',
  '/tasks': 'tasks/list',
  '/tasks/:id': 'tasks/detail'
} as const;

export type RoutePath = keyof typeof routes;
