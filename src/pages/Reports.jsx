import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Download, Filter, TrendingUp, Users, BookOpen, Edit, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import useStore from '../store/useStore';
import { toast } from 'sonner';
import { saveAs } from 'file-saver';

const Reports = () => {
  const attendance = useStore(state => state.attendance);
  const students = useStore(state => state.students);
  const courses = useStore(state => state.courses);
  const fetchAttendanceByCourse = useStore(state => state.fetchAttendanceByCourse);
  const fetchAttendanceByDate = useStore(state => state.fetchAttendanceByDate);
  const [loading, setLoading] = useState(false);
  const updateAttendance = useStore(state => state.updateAttendance);
  const deleteAttendance = useStore(state => state.deleteAttendance);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editAttendanceId, setEditAttendanceId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    timestamp: '',
    status: 'present'
  });
  const openEditModal = (session) => {
    setEditAttendanceId(session.id);
    setEditFormData({
      timestamp: new Date(session.startTime).toISOString().slice(0, 16),
      status: session.status || 'present'
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    await updateAttendance(editAttendanceId, editFormData);
    toast.success('Attendance session updated!');
    setIsEditModalOpen(false);
  };

  const handleDelete = async (id, courseId = null) => {
    if (window.confirm('Delete this attendance session?')) {
      await deleteAttendance(id);
      toast.success('Attendance session deleted');
      // Immediately refetch attendance according to active filters or course context
      try {
        if (filterCourse && filterCourse !== 'all') {
          await fetchAttendanceByCourse(filterCourse);
        } else if (filterDate) {
          await fetchAttendanceByDate(filterDate);
        } else if (courseId) {
          await fetchAttendanceByCourse(courseId);
        }
      } catch (err) {
        console.error('Failed to refetch attendance after delete', err);
      }
    }
  };
  
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (filterCourse !== 'all') {
        await fetchAttendanceByCourse(filterCourse);
      } else if (filterDate) {
        await fetchAttendanceByDate(filterDate);
      }
      setLoading(false);
    };
    load();
    // eslint-disable-next-line
  }, [filterCourse, filterDate]);
  
  const filteredAttendance = attendance;
  
  const totalSessions = filteredAttendance.length;
  const totalAttendance = filteredAttendance.reduce((sum, r) => sum + (r.status === 'Present' ? 1 : 0), 0);
  const avgAttendance = totalSessions > 0 ? Math.round(totalAttendance / totalSessions) : 0;
  const avgPercentage = students.length > 0 ? Math.round((avgAttendance / students.length) * 100) : 0;
  
  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/reports/export`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to export CSV');
      const blob = await res.blob();
      saveAs(blob, 'attendance_report.csv');
      toast.success('Report exported to CSV successfully!');
    } catch (err) {
      toast.error('CSV export failed');
    }
  };

  const handleExportPDF = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/reports/export-pdf`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to export PDF');
      const blob = await res.blob();
      saveAs(blob, 'attendance_report.pdf');
      toast.success('Report exported to PDF successfully!');
    } catch (err) {
      toast.error('PDF export failed');
    }
  };
  
  return (
    <div className="space-y-6 animate-in">
      {loading && (
        <div className="text-center py-12 text-muted-foreground">Loading attendance records...</div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
          <p className="text-muted-foreground">View and analyze attendance data</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>
      
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5" />
          <h3 className="text-lg font-bold">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Course</Label>
            <Select value={filterCourse} onValueChange={setFilterCourse}>
              <SelectTrigger>
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map(course => (
                  <SelectItem key={course._id || course.id} value={(course._id || course.id || '').toString()}>
                    {course.code} - {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex items-start justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Sessions</span>
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <p className="text-3xl font-bold">{totalSessions}</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex items-start justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Attendance</span>
            <Users className="w-5 h-5 text-accent" />
          </div>
          <p className="text-3xl font-bold">{totalAttendance}</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex items-start justify-between mb-2">
            <span className="text-sm text-muted-foreground">Avg. Per Session</span>
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
          <p className="text-3xl font-bold">{avgAttendance}</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex items-start justify-between mb-2">
            <span className="text-sm text-muted-foreground">Avg. Rate</span>
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <p className="text-3xl font-bold text-primary">{avgPercentage}%</p>
        </motion.div>
      </div>
      
      <div className="glass rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">Attendance History</h3>
        {filteredAttendance.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No attendance records found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAttendance.map((session, index) => {
              // defensive handling: session may be a single attendance doc or a session object
              const attendeesCount = Array.isArray(session.attendees)
                ? session.attendees.length
                : (typeof session.attendees === 'number' ? session.attendees : (session.student ? 1 : 0));
              const percentage = students.length > 0
                ? Math.round((attendeesCount / students.length) * 100)
                : 0;
              const key = session._id || session.id || `session-${index}`;
              const courseCode = session.course?.code || session.courseCode || session.courseTitle || '—';
              const courseTitle = session.course?.title || session.courseTitle || '';
              const start = session.startTime || session.date || session.createdAt;
              const startDisplay = start ? new Date(start).toLocaleDateString('en-US', {
                weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
              }) : '—';

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-bold">{courseCode}</h4>
                        <span className="text-sm text-muted-foreground">{courseTitle}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{startDisplay}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{attendeesCount}</p>
                      <p className="text-xs text-muted-foreground">students</p>
                      <p className={`text-sm font-medium mt-1 ${
                        percentage >= 75 ? 'text-success' : 
                        percentage >= 50 ? 'text-warning' : 
                        'text-destructive'
                      }`}>
                        {percentage}%
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditModal(session)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(session.id, session.course?._id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      {/* Edit Attendance Session Modal */}
      <div>
        <dialog open={isEditModalOpen} className="max-w-md rounded-xl shadow-xl p-8 bg-background">
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Edit Attendance Session</h2>
            <div className="space-y-2">
              <label htmlFor="edit-timestamp">Timestamp</label>
              <input
                id="edit-timestamp"
                type="datetime-local"
                value={editFormData.timestamp}
                onChange={e => setEditFormData({ ...editFormData, timestamp: e.target.value })}
                required
                className="w-full p-2 rounded border"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-status">Status</label>
              <select
                id="edit-status"
                value={editFormData.status}
                onChange={e => setEditFormData({ ...editFormData, status: e.target.value })}
                className="w-full p-2 rounded border"
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
              </select>
            </div>
            <div className="flex gap-3 justify-end mt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="gradient-primary">
                Save Changes
              </Button>
            </div>
          </form>
        </dialog>
      </div>
    </div>
  );
};

export default Reports;
