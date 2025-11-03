// Centralized API utility for auth endpoints
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function register({ name, email, password, role }) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role })
  });
  return handleResponse(res);
}

export async function login({ email, password }) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return handleResponse(res);
}

export async function getProfile(token) {
  const res = await fetch(`${API_BASE}/auth/profile`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return handleResponse(res);
}

// Fetch dashboard overview (admin)
export async function fetchDashboardOverview(token) {
  const res = await fetch(`${API_BASE}/admin/dashboard/overview`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return handleResponse(res);
}

// Session management endpoints
export async function startSession(courseId, token) {
  const res = await fetch(`${API_BASE}/sessions/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ courseId })
  });
  return handleResponse(res);
}

export async function endSession(sessionId, token) {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/end`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return handleResponse(res);
}

export async function getActiveSessions(token) {
  const res = await fetch(`${API_BASE}/sessions/active`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return handleResponse(res);
}

export async function getRecentSessions(token) {
  const res = await fetch(`${API_BASE}/sessions/recent`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return handleResponse(res);
}
// Admin/User CRUD
async function handleResponse(res) {
  const text = await res.text();
  try {
    const data = text ? JSON.parse(text) : null;
    if (res.ok) return data || { success: true, data: null };
    return { success: false, status: res.status, message: data?.message || data?.error || res.statusText };
  } catch (e) {
    return { success: false, status: res.status, message: text || res.statusText };
  }
}

export async function fetchUsers(token) {
  const res = await fetch(`${API_BASE}/admin/users`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return handleResponse(res);
}

export async function createUser(user, token) {
  const res = await fetch(`${API_BASE}/admin/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(user)
  });
  return handleResponse(res);
}

export async function updateUser(id, updates, token) {
  const res = await fetch(`${API_BASE}/admin/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(updates)
  });
  return handleResponse(res);
}

export async function deleteUser(id, token) {
  const res = await fetch(`${API_BASE}/admin/users/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return handleResponse(res);
}