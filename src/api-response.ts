export async function readApiResponse(response: Response, fallback: string): Promise<any> {
  let data: any;
  try { data=await response.json(); } catch {
    throw Object.assign(Error(response.status === 413 ? 'The image is too large. Choose a JPG, PNG or WebP up to 5 MB.' : fallback),{status:response.status});
  }
  if (!response.ok) throw Object.assign(Error(typeof data?.message === 'string' ? data.message : fallback),{status:response.status});
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw Error(fallback);
  return data;
}
