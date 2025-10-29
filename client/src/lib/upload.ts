/**
 * Upload de arquivos para o servidor
 */

export async function uploadFile(file: Blob, filename: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file, filename);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Erro ao fazer upload do arquivo');
  }

  const data = await response.json();
  return data.url;
}

export async function uploadMultipleFiles(files: { blob: Blob; filename: string }[]): Promise<string[]> {
  const uploads = files.map(({ blob, filename }) => uploadFile(blob, filename));
  return Promise.all(uploads);
}

