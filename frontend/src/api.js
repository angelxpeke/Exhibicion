const API_BASE = (import.meta?.env?.VITE_API_URL) ?? '/api';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function request(path, options = {}, attempt = 0) {
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? 8000;
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: getAuthHeaders(),
      signal: controller.signal,
      ...options,
    });
    clearTimeout(id);
    if (!res.ok) {
      let details = '';
      try { details = await res.text(); } catch (_) {}
      throw new Error(`Error ${res.status}: ${res.statusText} - ${details}`);
    }
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) return res.json();
    return res.text();
  } catch (err) {
    clearTimeout(id);
    const msg = String(err?.message || '');
    const isAbort = err?.name === 'AbortError' || msg.includes('aborted') || msg.includes('ERR_ABORTED');
    const isNetwork = msg.includes('Failed to fetch') || msg.includes('NetworkError');
    if ((isAbort || isNetwork) && attempt < 1) {
      await delay(250);
      return request(path, options, attempt + 1);
    }
    throw new Error(isAbort ? 'Conexión interrumpida. Intenta nuevamente.' : msg);
  }
}

// Auth
export const register = (username, password) =>
  request('/auth/register', { method: 'POST', body: JSON.stringify({ username, password }) });

export const login = (username, password) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });

// Juegos
export const getJuegos = () => request('/juegos');
export const getJuego = (id) => request(`/juegos/${id}`);
export const createJuego = (data) => request('/juegos', { method: 'POST', body: JSON.stringify(data) });
export const updateJuego = (id, data) => request(`/juegos/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteJuego = (id) => request(`/juegos/${id}`, { method: 'DELETE' });

// Reseñas
export const getResenas = (juegoId) => {
  const q = juegoId ? `?juegoId=${encodeURIComponent(juegoId)}` : '';
  return request(`/resenas${q}`);
};
export const getResena = (id) => request(`/resenas/${id}`);
export const createResena = (data) => request('/resenas', { method: 'POST', body: JSON.stringify(data) });
export const updateResena = (id, data) => request(`/resenas/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteResena = (id) => request(`/resenas/${id}`, { method: 'DELETE' });

export default {
  register,
  login,
  getJuegos,
  getJuego,
  createJuego,
  updateJuego,
  deleteJuego,
  getResenas,
  getResena,
  createResena,
  updateResena,
  deleteResena,
};