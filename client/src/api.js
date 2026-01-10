const RAW_BASE = (import.meta.env.VITE_API_BASE_URL || '').trim();

function normalizeBase(base) {
  if (!base) return '';
  try {
    const url = new URL(base);
    const basePath = url.pathname.replace(/\/+$/g, '');
    return `${url.origin}${basePath}`;
  } catch {
    return base.replace(/\/+$/g, '');
  }
}

export const API_BASE = normalizeBase(RAW_BASE);

export function apiUrl(path) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (!API_BASE) return cleanPath;
  return `${API_BASE}${cleanPath}`;
}
