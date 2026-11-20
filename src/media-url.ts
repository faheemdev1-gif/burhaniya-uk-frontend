export function resolveMediaUrl(value: string, apiBase: string, pageOrigin: string): string {
  if (!value) return value;
  try {
    const id=new URL(value,pageOrigin).pathname.match(/^\/(?:api\/)?media\/([a-f0-9]{64}\.webp)$/)?.[1];
    return id ? new URL(apiBase.replace(/\/+$/,'')+'/media/'+id,pageOrigin).href : value;
  } catch { return value; }
}
