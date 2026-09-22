<script lang="ts">
  import { exportImportStore, exportImportActions } from '../model/export-import.store';
  import { importTasks } from '../api/export-import.api';

  let fileInput: HTMLInputElement;

  async function handleImport() {
    const file = fileInput.files?.[0];
    if (!file) return;

    try {
      exportImportActions.setImporting(true);
      await importTasks(file);
      exportImportActions.setSuccess(true);
      // TODO: Emit event or callback to refresh task list
    } catch (error) {
      exportImportActions.setError('Failed to import tasks');
    } finally {
      exportImportActions.setImporting(false);
      fileInput.value = '';
    }
  }
</script>

<div class="import-button">
  <input
    type="file"
    bind:this={fileInput}
    accept=".json,.csv"
    on:change={handleImport}
    disabled={$exportImportStore.isImporting}
  />
  <button
    class="upload-btn"
    on:click={() => fileInput.click()}
    disabled={$exportImportStore.isImporting}
  >
    {$exportImportStore.isImporting ? 'Importing...' : 'Import Tasks'}
  </button>
</div>

<style>
  .import-button {
    display: inline-block;
  }

  input[type="file"] {
    display: none;
  }

  .upload-btn {
    padding: 0.5rem 1rem;
    background-color: var(--color-success);
    color: white;
    border-radius: var(--radius-md);
    font-weight: 500;
    transition: background-color 0.2s;
  }

  .upload-btn:hover:not(:disabled) {
    background-color: #16a34a;
  }

  .upload-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
