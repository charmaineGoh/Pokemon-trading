export const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$|\/$/g, '').replace(/\/+/g, '/');

export function apiUrl(path) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${cleanPath}`;
}
