import { writable } from 'svelte/store';

interface ExportImportState {
  isExporting: boolean;
  isImporting: boolean;
  error: string | null;
  success: boolean;
}

const initialState: ExportImportState = {
  isExporting: false,
  isImporting: false,
  error: null,
  success: false
};

export const exportImportStore = writable<ExportImportState>(initialState);

export const exportImportActions = {
  setExporting: (isExporting: boolean) => {
    exportImportStore.update(state => ({ ...state, isExporting }));
  },
  setImporting: (isImporting: boolean) => {
    exportImportStore.update(state => ({ ...state, isImporting }));
  },
  setError: (error: string | null) => {
    exportImportStore.update(state => ({ ...state, error }));
  },
  setSuccess: (success: boolean) => {
    exportImportStore.update(state => ({ ...state, success }));
  },
  reset: () => {
    exportImportStore.set(initialState);
  }
};
