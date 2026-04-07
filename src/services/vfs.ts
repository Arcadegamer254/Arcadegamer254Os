export interface FileInfo {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modified: string;
}

export const vfs = {
  async list(path: string): Promise<{ files: FileInfo[], path: string }> {
    const res = await fetch(`/api/system/files/list?path=${encodeURIComponent(path)}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
  },

  async read(path: string): Promise<string> {
    const res = await fetch(`/api/system/files/read?path=${encodeURIComponent(path)}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.content;
  },

  async action(action: string, path: string, newPath?: string, isDir?: boolean, content?: string): Promise<void> {
    const res = await fetch('/api/system/files/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, path, newPath, isDir, content })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
  },

  getServeUrl(path: string): string {
    return `/api/system/files/serve?path=${encodeURIComponent(path)}`;
  }
};
