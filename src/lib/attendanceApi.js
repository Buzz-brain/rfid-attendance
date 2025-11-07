export async function fetchAllAttendance(token) {
  const res = await fetch(`${API_BASE}/attendance`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return handleResponse(res);
}
// API utility for attendance endpoints
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

export async function markAttendance({ rfidTag, courseId, sessionId }, token) {
  const res = await fetch(`${API_BASE}/attendance/mark`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ rfidTag, courseId, sessionId })
  });
  return handleResponse(res);
}

export async function fetchAttendanceByCourse(courseId, token) {
  const res = await fetch(`${API_BASE}/attendance/course/${courseId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return handleResponse(res);
}

export async function fetchAttendanceByStudent(studentId, token) {
  const res = await fetch(`${API_BASE}/attendance/student/${studentId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return handleResponse(res);
}

export async function fetchAttendanceByDate(date, token) {
  const res = await fetch(`${API_BASE}/attendance/date/${date}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return handleResponse(res);
}

export async function updateAttendance(id, data, token) {
  const res = await fetch(`${API_BASE}/attendance/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return handleResponse(res);
}

export async function deleteAttendance(id, token) {
  const res = await fetch(`${API_BASE}/attendance/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return handleResponse(res);
}
