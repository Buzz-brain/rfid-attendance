import { create } from 'zustand';
import { mockStudents, mockCourses, mockUsers, getInitialAttendance } from '../data/mockData';
import * as api from '../lib/api';
import * as studentsApi from '../lib/studentsApi';
import * as coursesApi from '../lib/coursesApi';
import * as attendanceApi from '../lib/attendanceApi';

// Zustand store for global state management
// TODO: Replace with real API calls and backend integration

const useStore = create((set, get) => ({
      // Auth state
      user: null,
      token: null,
      
      // Data state
  students: [],
  courses: [],
  attendance: [],
  users: [],
      // Admin/User actions (real API)
      fetchUsers: async () => {
        const token = get().token || localStorage.getItem('token');
        if (!token) return;
        const result = await api.fetchUsers(token);
        if (result.success && Array.isArray(result.data)) {
          set({ users: result.data });
        }
      },

      // Lecturer actions
      lecturers: [],
      fetchLecturers: async () => {
        const token = get().token || localStorage.getItem('token');
        if (!token) return;
        const result = await api.fetchUsers(token);
        if (result.success && Array.isArray(result.data)) {
          const lecturers = result.data.filter(u => u.role === 'lecturer');
          set({ lecturers });
        }
      },

      createUser: async (user) => {
        const token = get().token || localStorage.getItem('token');
        if (!token) return { success: false, error: 'Not authenticated' };
        const result = await api.createUser(user, token);
        if (result.success && result.data) {
          set(state => ({ users: [...state.users, result.data] }));
          return { success: true, user: result.data };
        }
        return { success: false, error: result.message || 'Failed to add user' };
      },

      updateUser: async (id, updates) => {
        const token = get().token || localStorage.getItem('token');
        if (!token) return;
        const result = await api.updateUser(id, updates, token);
        if (result.success && result.data) {
          set(state => ({
            users: state.users.map(u => u._id === id ? result.data : u)
          }));
        }
      },

      deleteUser: async (id) => {
        const token = get().token || localStorage.getItem('token');
        if (!token) return;
        const result = await api.deleteUser(id, token);
        if (result.success) {
          set(state => ({
            users: state.users.filter(u => u._id !== id)
          }));
        }
      },
      
      // UI state
      theme: 'light',
      currentSession: null,
      
      // Auth actions

      // Auth actions (real API)
      login: async (email, password) => {
        try {
          const result = await api.login({ email, password });
          if (result.success && result.data?.token) {
            set({ user: result.data, token: result.data.token });
            localStorage.setItem('token', result.data.token);
            return { success: true, user: result.data };
          }
          return { success: false, error: result.message || 'Login failed' };
        } catch (err) {
          return { success: false, error: err.message };
        }
      },

      register: async (name, email, password, role) => {
        try {
          const result = await api.register({ name, email, password, role });
          if (result.success && result.data?.token) {
            set({ user: result.data, token: result.data.token });
            localStorage.setItem('token', result.data.token);
            return { success: true, user: result.data };
          }
          return { success: false, error: result.message || 'Registration failed' };
        } catch (err) {
          return { success: false, error: err.message };
        }
      },

      getProfile: async () => {
        const token = get().token || localStorage.getItem('token');
        if (!token) return null;
        const result = await api.getProfile(token);
        if (result.success && result.data) {
          set({ user: result.data });
          return result.data;
        }
        return null;
      },
      
      logout: () => {
        set({ user: null, token: null, currentSession: null });
        localStorage.removeItem('token');
      },
      
      // Student actions (real API)
      fetchStudents: async () => {
        const token = get().token || localStorage.getItem('token');
        if (!token) return;
        const result = await studentsApi.fetchStudents(token);
        if (result.success && Array.isArray(result.data)) {
          set({ students: result.data });
        }
      },

      addStudent: async (student) => {
        const token = get().token || localStorage.getItem('token');
        if (!token) return { success: false, error: 'Not authenticated' };
        const result = await studentsApi.createStudent(student, token);
        if (result.success && result.data) {
          set(state => ({ students: [...state.students, result.data] }));
          return { success: true, student: result.data };
        }
        return { success: false, error: result.message || 'Failed to add student' };
      },

      updateStudent: async (id, updates) => {
        const token = get().token || localStorage.getItem('token');
        if (!token) return;
        const result = await studentsApi.updateStudent(id, updates, token);
        if (result.success && result.data) {
          set(state => ({
            students: state.students.map(s => s._id === id ? result.data : s)
          }));
        }
      },

      deleteStudent: async (id) => {
        const token = get().token || localStorage.getItem('token');
        if (!token) return;
        const result = await studentsApi.deleteStudent(id, token);
        if (result.success) {
          set(state => ({
            students: state.students.filter(s => s._id !== id)
          }));
        }
      },
      

      // Course actions (real API)
      fetchCourses: async () => {
        const token = get().token || localStorage.getItem('token');
        if (!token) return;
        const result = await coursesApi.fetchCourses(token);
        if (result.success && Array.isArray(result.data)) {
          set({ courses: result.data });
        }
      },

      addCourse: async (course) => {
        const token = get().token || localStorage.getItem('token');
        if (!token) return { success: false, error: 'Not authenticated' };
        const result = await coursesApi.createCourse(course, token);
        if (result.success && result.data) {
          set(state => ({ courses: [...state.courses, result.data] }));
          return { success: true, course: result.data };
        }
        return { success: false, error: result.message || 'Failed to add course' };
      },

      updateCourse: async (id, updates) => {
        const token = get().token || localStorage.getItem('token');
        if (!token) return;
        const result = await coursesApi.updateCourse(id, updates, token);
        if (result.success && result.data) {
          set(state => ({
            courses: state.courses.map(c => c._id === id ? result.data : c)
          }));
        }
      },

      deleteCourse: async (id) => {
        const token = get().token || localStorage.getItem('token');
        if (!token) return;
        const result = await coursesApi.deleteCourse(id, token);
        if (result.success) {
          set(state => ({
            courses: state.courses.filter(c => c._id !== id)
          }));
        }
      },

      // Session management (backend)
      startSession: async (courseId) => {
        const token = get().token || localStorage.getItem('token');
        if (!token) return { success: false, error: 'Not authenticated' };
        const res = await api.startSession(courseId, token);
        if (res.success && res.data) {
          // Optionally fetch students for stats
          try {
            const students = get().students;
            if (!students || students.length === 0) {
              await get().fetchStudents();
            }
          } catch (err) {}
          // Optionally fetch attendance for this course (today)
          try {
            const attRes = await attendanceApi.fetchAttendanceByCourse(courseId, token);
            if (attRes.success && Array.isArray(attRes.data)) {
              set(state => ({ attendance: attRes.data }));
            }
          } catch (err) {}
          set({ currentSession: {
            _id: res.data._id,
            courseId,
            course: res.data.course,
            lecturer: res.data.lecturer,
            sessionDate: res.data.sessionDate,
            attendees: []
          }});
          return { success: true };
        }
        // If session already active, fetch it and set as currentSession
        if (res.message === 'Session already active for this course') {
          const activeRes = await api.getActiveSessions(token);
          if (activeRes.success && Array.isArray(activeRes.data)) {
            const session = activeRes.data.find(s => s.course._id === courseId);
            if (session) {
              // Optionally fetch attendance for this course (today)
              try {
                const attRes = await attendanceApi.fetchAttendanceByCourse(courseId, token);
                if (attRes.success && Array.isArray(attRes.data)) {
                  set(state => ({ attendance: attRes.data }));
                }
              } catch (err) {}
              set({ currentSession: {
                _id: session._id,
                courseId,
                course: session.course,
                lecturer: session.lecturer,
                sessionDate: session.sessionDate,
                attendees: []
              }});
              return { success: true, info: 'Session already active, loaded from backend' };
            }
          }
        }
        return { success: false, error: res.message || 'Failed to start session' };
      },

      endSession: async () => {
        const token = get().token || localStorage.getItem('token');
        const session = get().currentSession;
        if (!token || !session || !session._id) return { success: false, error: 'No active session' };
        const res = await api.endSession(session._id, token);
        if (res.success) {
          set({ currentSession: null });
          return { success: true };
        }
        return { success: false, error: res.message || 'Failed to end session' };
      },
      

      // Attendance actions (real API)
      fetchAttendanceByCourse: async (courseId) => {
        const token = get().token || localStorage.getItem('token');
        if (!token) return;
        const result = await attendanceApi.fetchAttendanceByCourse(courseId, token);
        if (result.success && Array.isArray(result.data)) {
          set({ attendance: result.data });
        }
      },

      fetchAttendanceByStudent: async (studentId) => {
        const token = get().token || localStorage.getItem('token');
        if (!token) return;
        const result = await attendanceApi.fetchAttendanceByStudent(studentId, token);
        if (result.success && Array.isArray(result.data)) {
          set({ attendance: result.data });
        }
      },

      fetchAttendanceByDate: async (date) => {
        const token = get().token || localStorage.getItem('token');
        if (!token) return;
        const result = await attendanceApi.fetchAttendanceByDate(date, token);
        if (result.success && Array.isArray(result.data)) {
          set({ attendance: result.data });
        }
      },

      markAttendance: async (rfidTag, courseId) => {
        const token = get().token || localStorage.getItem('token');
        const session = get().currentSession;
        if (!token) return { success: false, error: 'Not authenticated' };
        if (!session || !session._id) return { success: false, error: 'No active session' };
        const result = await attendanceApi.markAttendance({ rfidTag, courseId, sessionId: session._id }, token);
        // If the mark succeeded, update the in-memory currentSession and attendance list
        if (result.success && result.data) {
          try {
            set(state => {
              // Only update if session exists and matches the course
              if (session && (session.course?._id === courseId || session.courseId === courseId)) {
                // Avoid duplicate entries for same student in the session
                const studentId = result.data.student?._id || result.data.student?.id;
                const already = session.attendees.some(a => (a.student?._id || a.student?.id) === studentId);
                const newSession = { ...session };
                if (!already) {
                  newSession.attendees = [...session.attendees, result.data];
                }
                return { currentSession: newSession, attendance: [...state.attendance, result.data] };
              }
              // If no matching session, still append to attendance history
              return { attendance: [...state.attendance, result.data] };
            });
          } catch (err) {
            // swallow state update errors but still return API result
            console.error('Failed to update session after marking attendance', err);
          }
        }

        return result;
      },

      updateAttendance: async (id, updates) => {
        const token = get().token || localStorage.getItem('token');
        if (!token) return;
        const result = await attendanceApi.updateAttendance(id, updates, token);
        if (result.success && result.data) {
          set(state => ({
            attendance: state.attendance.map(a => a._id === id ? result.data : a)
          }));
        }
      },

      deleteAttendance: async (id) => {
        const token = get().token || localStorage.getItem('token');
        if (!token) return;
        const result = await attendanceApi.deleteAttendance(id, token);
        if (result.success) {
          set(state => {
            // remove from global attendance history
            const attendance = state.attendance.filter(a => a._id !== id);
            // also remove from current session attendees if present
            let currentSession = state.currentSession;
            if (currentSession && Array.isArray(currentSession.attendees)) {
              const attendees = currentSession.attendees.filter(a => a._id !== id && (a._id || a.student?._id) !== id);
              currentSession = { ...currentSession, attendees };
            }
            return { attendance, currentSession };
          });
        }
      },
      
      // Theme toggle
      toggleTheme: () => {
        set(state => ({ theme: state.theme === 'light' ? 'dark' : 'light' }));
      },
      
      // Get attendance stats
      getAttendanceStats: () => {
        const session = get().currentSession;
        if (!session) return { total: 0, present: 0, absent: 0, percentage: 0 };
        
        const total = get().students.length;
        const present = session.attendees.length;
        const absent = total - present;
        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
        
        return { total, present, absent, percentage };
      }
}));

export default useStore;
