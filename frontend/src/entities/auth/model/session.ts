export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface SessionCreateInput {
  userId: string;
  token: string;
  expiresIn: number; // in seconds
}

export function createSession(input: SessionCreateInput): Session {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + input.expiresIn * 1000);

  return {
    id: crypto.randomUUID(),
    userId: input.userId,
    token: input.token,
    expiresAt: expiresAt.toISOString(),
    createdAt: now.toISOString()
  };
}

export function isSessionValid(session: Session): boolean {
  return new Date(session.expiresAt) > new Date();
}
