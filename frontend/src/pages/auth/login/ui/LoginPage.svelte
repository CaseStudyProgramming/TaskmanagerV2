<script lang="ts">
  import { appStore } from '$app/store/app-store';

  function handleGoogleLogin() {
    // TODO: Implement Google OAuth login
    appStore.setNotification({
      message: 'Google login will be implemented',
      type: 'info'
    });
  }
</script>

<div class="login-page">
  <div class="login-container">
    <h1>Login</h1>
    <p>Sign in to manage your tasks</p>
    <button class="google-login-btn" on:click={handleGoogleLogin}>
      Sign in with Google
    </button>
  </div>
</div>

<style>
  .login-page {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: var(--color-background-secondary);
  }

  .login-container {
    background: var(--color-background);
    padding: 2rem;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    text-align: center;
    max-width: 400px;
    width: 100%;
  }

  h1 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  p {
    color: var(--color-text-secondary);
    margin-bottom: 2rem;
  }

  .google-login-btn {
    width: 100%;
    padding: 0.75rem 1rem;
    background-color: var(--color-primary);
    color: white;
    border-radius: var(--radius-md);
    font-weight: 500;
    transition: background-color 0.2s;
  }

  .google-login-btn:hover {
    background-color: var(--color-primary-dark);
  }
</style>
