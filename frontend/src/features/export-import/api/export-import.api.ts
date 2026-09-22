export async function exportTasks(format: 'json' | 'csv' = 'json') {
  // TODO: Implement API call to export tasks
  const response = await fetch(`/api/v1/tasks/export?format=${format}`);

  if (!response.ok) {
    throw new Error('Failed to export tasks');
  }

  return response.blob();
}

export async function importTasks(file: File) {
  // TODO: Implement API call to import tasks
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/v1/tasks/import', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to import tasks');
  }

  return response.json();
}
