export async function initiateGoogleLogin() {
  // TODO: Implement Google OAuth login initiation
  const response = await fetch('/api/v1/auth/google', {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to initiate Google login');
  }

  return response.json();
}

export async function handleGoogleCallback(code: string, state: string) {
  // TODO: Implement Google OAuth callback handling
  const response = await fetch('/api/v1/auth/google/callback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code, state }),
  });

  if (!response.ok) {
    throw new Error('Failed to handle Google callback');
  }

  return response.json();
}
