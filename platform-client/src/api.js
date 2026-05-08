const BASE = '/api';

function getToken() { return localStorage.getItem('turn_token'); }
export function setToken(t) { localStorage.setItem('turn_token', t); }
export function clearToken() { localStorage.removeItem('turn_token'); }

async function req(method, path, body, isForm = false) {
  const headers = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isForm) headers['Content-Type'] = 'application/json';
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: isForm ? body : (body ? JSON.stringify(body) : undefined)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Gabim serveri');
  return data;
}

export const api = {
  auth: {
    register: (d) => req('POST', '/auth/register', d),
    login: (d) => req('POST', '/auth/login', d),
    me: () => req('GET', '/auth/me'),
  },
  orders: {
    create: (d) => req('POST', '/orders', d),
    mine: () => req('GET', '/orders/mine'),
    get: (id) => req('GET', `/orders/${id}`),
  },
  tournaments: {
    list: () => req('GET', '/tournaments'),
    create: (fd) => req('POST', '/tournaments', fd, true),
    get: (slug) => req('GET', `/tournaments/${slug}`),
    getPublic: (slug) => req('GET', `/tournaments/public/${slug}`),
    update: (slug, fd) => req('PUT', `/tournaments/${slug}`, fd, true),
    delete: (slug) => req('DELETE', `/tournaments/${slug}`),
  },
  teams: {
    list: (slug) => req('GET', `/tournaments/${slug}/teams`),
    create: (slug, d) => req('POST', `/tournaments/${slug}/teams`, d),
    update: (slug, id, d) => req('PUT', `/tournaments/${slug}/teams/${id}`, d),
    delete: (slug, id) => req('DELETE', `/tournaments/${slug}/teams/${id}`),
  },
  players: {
    list: (slug, params = '') => req('GET', `/tournaments/${slug}/players${params}`),
    create: (slug, d) => req('POST', `/tournaments/${slug}/players`, d),
    update: (slug, id, d) => req('PUT', `/tournaments/${slug}/players/${id}`, d),
    delete: (slug, id) => req('DELETE', `/tournaments/${slug}/players/${id}`),
  },
  rounds: {
    list: (slug) => req('GET', `/tournaments/${slug}/rounds`),
    drawPreview: (slug) => req('POST', `/tournaments/${slug}/rounds/draw-preview`, {}),
    drawConfirm: (slug, d) => req('POST', `/tournaments/${slug}/rounds/draw-confirm`, d),
    update: (slug, id, d) => req('PUT', `/tournaments/${slug}/rounds/${id}`, d),
    delete: (slug, id) => req('DELETE', `/tournaments/${slug}/rounds/${id}`),
  },
  matches: {
    list: (slug, params = '') => req('GET', `/tournaments/${slug}/matches${params}`),
    update: (slug, id, d) => req('PUT', `/tournaments/${slug}/matches/${id}`, d),
    events: {
      list: (slug, matchId) => req('GET', `/tournaments/${slug}/matches/${matchId}/events`),
      create: (slug, matchId, d) => req('POST', `/tournaments/${slug}/matches/${matchId}/events`, d),
      delete: (slug, matchId, evId) => req('DELETE', `/tournaments/${slug}/matches/${matchId}/events/${evId}`),
    }
  }
};
