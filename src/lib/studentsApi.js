// API utility for student endpoints
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

export async function fetchStudents(token) {
  const res = await fetch(`${API_BASE}/students`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return handleResponse(res);
}

export async function fetchStudentById(id, token) {
  const res = await fetch(`${API_BASE}/students/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return handleResponse(res);
}

export async function createStudent(data, token) {
  const res = await fetch(`${API_BASE}/students`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return handleResponse(res);
}

export async function updateStudent(id, data, token) {
  const res = await fetch(`${API_BASE}/students/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return handleResponse(res);
}

export async function deleteStudent(id, token) {
  const res = await fetch(`${API_BASE}/students/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return handleResponse(res);
}
