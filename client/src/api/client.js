// In dev, Vite proxies /api/* to http://localhost:8080.
// In production on Vercel, VITE_API_URL should be set to your Render backend (e.g. https://community-resource-finder-api.onrender.com).
let rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();
if (rawApiUrl.endsWith('/')) {
  rawApiUrl = rawApiUrl.slice(0, -1);
}
const API_URL = rawApiUrl;

// ─── Session ID ───────────────────────────────────────────────────────────────
function getSessionId() {
  let id = localStorage.getItem('pf_session_id');
  if (!id) {
    try { id = crypto.randomUUID(); }
    catch { id = 'sess-' + Math.random().toString(36).slice(2) + Date.now(); }
    localStorage.setItem('pf_session_id', id);
  }
  return id;
}

// ─── Auth token helpers ───────────────────────────────────────────────────────
export function getStoredUser() {
  try { return JSON.parse(localStorage.getItem('pf_user') || 'null'); }
  catch { return null; }
}

export function setStoredUser(user) {
  if (user) localStorage.setItem('pf_user', JSON.stringify(user));
  else localStorage.removeItem('pf_user');
}

// ─── Base request ─────────────────────────────────────────────────────────────
async function request(path, options = {}) {
  const targetUrl = `${API_URL}${path}`;
  try {
    const response = await fetch(targetUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': getSessionId(),
        ...(options.headers || {})
      }
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error || payload.message || `Server returned HTTP status ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    if (err.message.includes('Failed to fetch')) {
      throw new Error(
        `Unable to reach backend API at ${targetUrl || 'local server'}. Please verify backend server status or VITE_API_URL environment variable.`
      );
    }
    throw err;
  }
}

// ─── Auth endpoints ───────────────────────────────────────────────────────────
export async function loginUser({ email, password }) {
  const data = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  setStoredUser(data.user);
  return data;
}

export async function registerUser({ name, email, password }) {
  const data = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password })
  });
  setStoredUser(data.user);
  return data;
}

// ─── Location endpoints ───────────────────────────────────────────────────────
export function fetchStates() {
  return request('/api/locations/states');
}

export function fetchDistricts(state) {
  if (!state || state === 'All') return Promise.resolve({ districts: [] });
  return request(`/api/locations/districts?state=${encodeURIComponent(state)}`);
}

export function fetchPincodeInfo(pincode) {
  return request(`/api/locations/pincode/${encodeURIComponent(pincode)}`);
}

// ─── App & Resource endpoints ─────────────────────────────────────────────────
export function sendChat(message, locationParams = {}, locationCoords = null) {
  return request('/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      message,
      state: locationParams.state || 'All',
      district: locationParams.district || 'All',
      city: locationParams.city || 'All',
      pincode: locationParams.pincode || '',
      location: locationCoords
    })
  });
}

export function fetchResources(filters = {}) {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null && value !== '' && value !== 'All')
  );
  const params = new URLSearchParams(cleanFilters);
  const query = params.toString();
  return request(`/api/resources${query ? '?' + query : ''}`);
}

export function fetchHistory() {
  return request('/api/history');
}

// ─── Admin Resource Management CRUD ───────────────────────────────────────────
export function createResource(data) {
  return request('/api/resources', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export function updateResource(id, data) {
  return request(`/api/resources/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export function deleteResource(id) {
  return request(`/api/resources/${id}`, {
    method: 'DELETE'
  });
}

export function verifyResource(id, status = 'Verified') {
  return request(`/api/resources/${id}/verify`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
}
