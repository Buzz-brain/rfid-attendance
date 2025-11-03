// API utility for course endpoints
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function fetchCourses(token) {
  const res = await fetch(`${API_BASE}/courses`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

export async function fetchCourseById(id, token) {
  const res = await fetch(`${API_BASE}/courses/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

export async function createCourse(data, token) {
  const res = await fetch(`${API_BASE}/courses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateCourse(id, data, token) {
  const res = await fetch(`${API_BASE}/courses/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteCourse(id, token) {
  const res = await fetch(`${API_BASE}/courses/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}
