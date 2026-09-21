export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
    timeout: 30000, // 30 seconds
  },
  auth: {
    tokenKey: 'auth_token',
    sessionKey: 'auth_session',
    tokenExpiryWarning: 5 * 60 * 1000, // 5 minutes in milliseconds
  },
  app: {
    name: 'Task Manager',
    version: '1.0.0',
    environment: import.meta.env.MODE || 'development',
  },
  features: {
    offlineMode: true,
    exportImport: true,
    googleAuth: true,
  },
  ui: {
    theme: {
      default: 'light',
      storageKey: 'theme',
    },
    notifications: {
      duration: 5000, // 5 seconds
    },
  },
} as const;

export function isDevelopment(): boolean {
  return config.app.environment === 'development';
}

export function isProduction(): boolean {
  return config.app.environment === 'production';
}
