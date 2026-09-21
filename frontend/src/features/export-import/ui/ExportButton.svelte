<script lang="ts">
  import { exportImportStore, exportImportActions } from '../model/export-import.store';
  import { exportTasks } from '../api/export-import.api';

  export let format: 'json' | 'csv' = 'json';

  async function handleExport() {
    try {
      exportImportActions.setExporting(true);
      const blob = await exportTasks(format);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tasks-export.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      exportImportActions.setSuccess(true);
    } catch (error) {
      exportImportActions.setError('Failed to export tasks');
    } finally {
      exportImportActions.setExporting(false);
    }
  }
</script>

<button
  class="export-button"
  on:click={handleExport}
  disabled={$exportImportStore.isExporting}
>
  {$exportImportStore.isExporting ? 'Exporting...' : `Export as ${format.toUpperCase()}`}
</button>

<style>
  .export-button {
    padding: 0.5rem 1rem;
    background-color: var(--color-primary);
    color: white;
    border-radius: var(--radius-md);
    font-weight: 500;
    transition: background-color 0.2s;
  }

  .export-button:hover:not(:disabled) {
    background-color: var(--color-primary-dark);
  }

  .export-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
