<script lang="ts">
  import Header from '../ui/Header.svelte';
  import Footer from '../ui/Footer.svelte';
</script>

<div class="main-layout">
  <Header />
  <main class="main-content">
    <slot />
  </main>
  <Footer />
</div>

<style>
  .main-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .main-content {
    flex: 1;
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }
</style>
