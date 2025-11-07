import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Download, Filter, TrendingUp, Users, BookOpen, Edit, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '../components/ui/dialog';
import useStore from '../store/useStore';
import { toast } from 'sonner';
import { saveAs } from 'file-saver';

const Reports = () => {
  const attendance = useStore(state => state.attendance);
  const students = useStore(state => state.students);
  let courses = useStore(state => state.courses);
  // If courses array is empty, extract unique courses from attendance records
  if (!courses || courses.length === 0) {
    const courseMap = {};
    attendance.forEach(rec => {
      if (rec.course && rec.course._id) {
        courseMap[rec.course._id] = rec.course;
      }
    });
    courses = Object.values(courseMap);
  }
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
  const [editOriginalRecord, setEditOriginalRecord] = useState(null);
  const openEditModal = (session) => {
    setEditAttendanceId(session._id || session.id);
    setEditOriginalRecord(session); // keep full original record
    // Use a valid date field for editing
    let dateValue = session.startTime || session.date || session.createdAt;
    let timestamp = '';
    if (dateValue) {
      const d = new Date(dateValue);
      if (!isNaN(d.getTime())) {
        timestamp = d.toISOString().slice(0, 16);
      }
    }
    setEditFormData({
      timestamp,
      status: session.status || 'present'
    });
    setIsEditModalOpen(true);
  };

  // Attendance details modal
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const openDetailsModal = (attendance) => {
    setSelectedAttendance(attendance);
    setDetailsModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    // Merge edited fields with original record, preserving all other fields
    const merged = {
      ...editOriginalRecord,
      status: editFormData.status,
      // Convert timestamp back to date/time fields
      date: editFormData.timestamp ? new Date(editFormData.timestamp) : editOriginalRecord.date,
      timeIn: editFormData.timestamp ? editFormData.timestamp.split('T')[1] || editOriginalRecord.timeIn : editOriginalRecord.timeIn,
    };
    await updateAttendance(editAttendanceId, merged);
    toast.success('Attendance session updated!');
    setIsEditModalOpen(false);
  };

  const handleDelete = async (id, courseId = null) => {
    if (window.confirm('Delete this attendance session?')) {
      // Defensive: use _id if present
      const attendanceId = id?._id || id;
      await deleteAttendance(attendanceId);
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
      } else {
        await useStore.getState().fetchAllAttendance();
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
      // Build query params for filters
      const params = new URLSearchParams();
      if (filterCourse && filterCourse !== 'all') params.append('courseId', filterCourse);
      if (filterDate) params.append('date', filterDate);
      const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/reports/export?${params.toString()}`;
      const res = await fetch(url, {
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
      // Build query params for filters
      const params = new URLSearchParams();
      if (filterCourse && filterCourse !== 'all') params.append('courseId', filterCourse);
      if (filterDate) params.append('date', filterDate);
      const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/reports/export-pdf?${params.toString()}`;
      const res = await fetch(url, {
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
                {[...courses]
                  .sort((a, b) => {
                    const codeA = a.code || a.courseCode || '';
                    const codeB = b.code || b.courseCode || '';
                    return codeA.localeCompare(codeB);
                  })
                  .map(course => (
                    <SelectItem key={course._id || course.id} value={(course._id || course.id || '').toString()}>
                      {(course.code || course.courseCode || '') + ' - ' + (course.title || course.courseTitle || '')}
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
              // Defensive handling and UI/UX redesign for attendance card
              const attendeesCount = Array.isArray(session.attendees)
                ? session.attendees.length
                : (typeof session.attendees === 'number' ? session.attendees : (session.student ? 1 : 0));
              const percentage = students.length > 0
                ? Math.round((attendeesCount / students.length) * 100)
                : 0;
              const key = session._id || session.id || `session-${index}`;
              const courseCode =
                session.course?.courseCode ||
                session.courseCode ||
                session.courseTitle ||
                "—";
              const courseTitle =
                session.course?.courseTitle || session.courseTitle || "";
              const start = session.startTime || session.date || session.createdAt;
              const startDisplay = start ? new Date(start).toLocaleDateString('en-US', {
                weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
              }) : '—';
              // Avatar logic
              const avatarUrl = session.student?.photo || null;
              // Status badge color
              const status = session.status || (percentage >= 75 ? 'Present' : percentage >= 50 ? 'Partial' : 'Absent');
              const statusColor = status === 'Present' ? 'bg-success/80 text-white' : status === 'Partial' ? 'bg-warning/80 text-white' : 'bg-destructive/80 text-white';

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative p-4 rounded-xl shadow-md bg-white/80 dark:bg-secondary/70 hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => openDetailsModal(session)}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Student" className="w-12 h-12 rounded-full object-cover border-2 border-primary" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center border-2 border-muted-foreground">
                          <Users className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-lg truncate">{courseCode}</span>
                        <span className="text-xs text-muted-foreground truncate">{courseTitle}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{startDisplay}</span>
                      </div>
                      {session.student && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-semibold">{session.student.name}</span>
                          <span className="text-xs text-muted-foreground">({session.student.regNo})</span>
                        </div>
                      )}
                      {session.rfidTag && (
                        <div className="text-xs text-muted-foreground">RFID: {session.rfidTag}</div>
                      )}
                    </div>
                    {/* Status & Actions */}
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor}`}>{status}</span>
                      <span className="text-xl font-bold text-primary">{attendeesCount}</span>
                      <span className="text-xs text-muted-foreground">students</span>
                      <span className={`text-xs font-medium mt-1 ${
                        percentage >= 75 ? 'text-success' : 
                        percentage >= 50 ? 'text-warning' : 
                        'text-destructive'
                      }`}>
                        {percentage}%
                      </span>
                      <div className="flex gap-2 mt-2">
                        <Button variant="ghost" size="icon" onClick={e => { e.stopPropagation(); openEditModal(session); }} title="Edit Attendance" className="opacity-70 group-hover:opacity-100">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={e => { e.stopPropagation(); handleDelete(session._id || session.id, session.course?._id); }} title="Delete Attendance" className="opacity-70 group-hover:opacity-100">
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
      {/* Attendance Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Attendance Details</DialogTitle>
            <DialogDescription>Full details for this attendance record</DialogDescription>
          </DialogHeader>
          {selectedAttendance && (
            <div className="space-y-2">
              <div><strong>Date:</strong> {selectedAttendance.date ? new Date(selectedAttendance.date).toLocaleString() : '—'}</div>
              <div><strong>Time In:</strong> {selectedAttendance.timeIn || '—'}</div>
              <div><strong>Status:</strong> {selectedAttendance.status || '—'}</div>
              <div><strong>RFID Tag:</strong> {selectedAttendance.rfidTag || '—'}</div>
              <div><strong>Course:</strong> {selectedAttendance.course ? `${selectedAttendance.course.courseCode || ''} - ${selectedAttendance.course.courseTitle || ''}` : '—'}</div>
              <div><strong>Student:</strong> {selectedAttendance.student ? `${selectedAttendance.student.name} (${selectedAttendance.student.regNo})` : '—'}</div>
              {selectedAttendance.student && selectedAttendance.student.photo && (
                <div>
                  <img src={selectedAttendance.student.photo} alt="Student" className="w-24 h-24 rounded-full object-cover" />
                </div>
              )}
              <div><strong>Created At:</strong> {selectedAttendance.createdAt ? new Date(selectedAttendance.createdAt).toLocaleString() : '—'}</div>
              <div><strong>Updated At:</strong> {selectedAttendance.updatedAt ? new Date(selectedAttendance.updatedAt).toLocaleString() : '—'}</div>
              <div><strong>ID:</strong> {selectedAttendance._id || selectedAttendance.id || '—'}</div>
            </div>
          )}
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>

      {/* Edit Attendance Session Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Attendance Session</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
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
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" className="gradient-primary">
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reports;
