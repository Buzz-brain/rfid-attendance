import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, CheckCircle, XCircle, Users, Clock, TrendingUp, StopCircle, Edit, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import SearchBar from '../components/SearchBar';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import useStore from '../store/useStore';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const Attendance = () => {
  // UI/UX state
  const [rfidInput, setRfidInput] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [lastScannedStudent, setLastScannedStudent] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [search, setSearch] = useState('');
  const inputRef = useRef(null);
  const students = useStore(state => state.students);
  const currentSession = useStore(state => state.currentSession);
  const markAttendance = useStore(state => state.markAttendance);
  const updateAttendance = useStore(state => state.updateAttendance);
  const deleteAttendance = useStore(state => state.deleteAttendance);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editAttendanceId, setEditAttendanceId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    timestamp: '',
    status: 'present'
  });
  const openEditModal = (record) => {
    setEditAttendanceId(record._id);
    setEditFormData({
      timestamp: new Date(record.timestamp).toISOString().slice(0, 16),
      status: record.status || 'present'
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    await updateAttendance(editAttendanceId, editFormData);
    toast.success('Attendance record updated!');
    setIsEditModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this attendance record?')) {
      await deleteAttendance(id);
      toast.success('Attendance record deleted');
    }
  };
  const endSession = useStore(state => state.endSession);
  const getAttendanceStats = useStore(state => state.getAttendanceStats);
  const navigate = useNavigate();
  
  const stats = getAttendanceStats();

  // Prefer explicit timeIn from backend; fall back to timestamp/date/createdAt
  const formatRecordTime = (record) => {
    if (!record) return '';
    // backend sometimes returns a timeIn string (HH:MM:SS) - trim seconds to HH:MM
    if (record.timeIn) return record.timeIn.slice(0, 5);
    // other potential fields
    const dt = record.timestamp || record.date || record.createdAt;
    if (dt) {
      try {
        return new Date(dt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      } catch (e) {
        return dt;
      }
    }
    return '';
  };

  const formatRecordDate = (record) => {
    if (!record) return '';
    const dt = record.date || record.timestamp || record.createdAt;
    if (dt) {
      try {
        return new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } catch (e) {
        return '';
      }
    }
    return '';
  };

  const formatSessionDate = () => {
    const dt = currentSession?.date || currentSession?.startedAt || currentSession?.createdAt || currentSession?.attendees?.[0]?.date;
    if (dt) {
      try {
        return new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      } catch (e) {
        return '';
      }
    }
    return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const findAttendanceRecord = (student) => {
    if (!student) return null;
    return (currentSession?.attendees || []).find(rec =>
      rec.student?._id === student?._id ||
      rec.student?.regNo === student?.regNo ||
      rec.rfidTag === student?.rfidTag
    ) || null;
  };
  
  useEffect(() => {
    // Auto-focus input while a session is active and keep it focused
    let interval;
    if (currentSession) {
      inputRef.current?.focus();
      interval = setInterval(() => {
        if (document.activeElement !== inputRef.current) {
          inputRef.current?.focus();
        }
      }, 1000);
    } else {
      // no active session: blur input to avoid accidental scans/submits
      inputRef.current?.blur();
    }

    return () => clearInterval(interval);
  }, [currentSession]);
  
  const handleScan = async (e) => {
    e.preventDefault();
    if (!currentSession) {
      toast.error('No active session. Please start a session first.');
      navigate('/courses');
      return;
    }
    if (!rfidInput.trim()) return;
    const result = await markAttendance(rfidInput.trim(), currentSession.course._id);
    // Resolve student info from multiple potential places
    const resolvedStudent = result?.data?.student || result?.student ||
      // try to find from today's attendees
      (currentSession.attendees || []).find(a => a.rfidTag === rfidInput || a.student?.regNo === rfidInput || a.student?._id === result?.student?._id)?.student ||
      // fallback to global students
      (students || []).find(s => s.rfidTag === rfidInput || s.regNo === rfidInput) || {};

    if (result.success) {
      setScanResult('success');
      setLastScannedStudent(resolvedStudent);
      setShowConfirmation(true);
      toast.success(`${resolvedStudent?.name || 'Student'} marked present!`);
      setTimeout(() => {
        setShowConfirmation(false);
      }, 4000);
    } else {
      // Already marked or other error — show modal with warning when possible
      setScanResult('error');
      if (Object.keys(resolvedStudent).length) {
        setLastScannedStudent(resolvedStudent);
        setShowConfirmation(true);
        // Use specific error text when provided
        const message = result?.error || result?.message || 'Already marked present';
        toast.error(message);
        setTimeout(() => {
          setShowConfirmation(false);
        }, 4000);
      } else {
        toast.error(result.message || 'Student not found');
      }
    }
    setRfidInput('');
    inputRef.current?.focus();
  };
  
  const handleEndSession = async () => {
    if (window.confirm('Are you sure you want to end this session?')) {
      const result = await endSession();
      if (result && result.success) {
        toast.success('Session ended successfully!');
        navigate('/dashboard');
      } else {
        toast.error(result?.error || 'Failed to end session');
      }
    }
  };
  
  if (!currentSession) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in">
        <div className="glass rounded-2xl p-12 text-center max-w-md shadow-2xl">
          <Scan className="w-16 h-16 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <h2 className="text-3xl font-bold mb-2 tracking-tight">No Active Session</h2>
          <p className="text-muted-foreground mb-6">Start a course session to begin taking attendance</p>
          <Button onClick={() => navigate('/courses')} className="gradient-primary shadow-lg">
            Go to Courses
          </Button>
        </div>
      </div>
    );
  }
  
  return ( 
  <div className="flex flex-col gap-10 animate-in w-full px-0">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg shadow-lg rounded-b-2xl mb-4">
  <div className="flex flex-col md:flex-row items-center justify-between px-6 py-4 gap-4 md:gap-0">
            <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src={currentSession.course.lecturer?.photo} alt={currentSession.course.lecturer?.name} />
              <AvatarFallback>{currentSession.course.lecturer?.name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{currentSession.course.title}</h1>
              <p className="text-muted-foreground text-sm">{currentSession.course.code} • {currentSession.course.department} • {currentSession.course.level}</p>
              <p className="text-xs text-muted-foreground">Lecturer: {currentSession.course.lecturer?.name} • <span className="font-medium">{formatSessionDate()}</span></p>
            </div>
          </div>
          <Button variant="outline" onClick={handleEndSession} className="text-destructive">
            <StopCircle className="w-4 h-4 mr-2" /> End Session
          </Button>
        </div>
      </header>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <motion.div whileHover={{ scale: 1.04 }} className="glass rounded-xl p-6 shadow-lg flex flex-col items-center justify-center">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Students</span>
            <Users className="w-5 h-5 text-muted-foreground" />
          </div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-bold">{stats.total}</motion.p>
        </motion.div>
  <motion.div whileHover={{ scale: 1.04 }} className="glass rounded-xl p-6 shadow-lg flex flex-col items-center justify-center">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Present</span>
            <CheckCircle className="w-5 h-5 text-success" />
          </div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-bold text-success">{stats.present}</motion.p>
        </motion.div>
  <motion.div whileHover={{ scale: 1.04 }} className="glass rounded-xl p-6 shadow-lg flex flex-col items-center justify-center">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Attendance Rate</span>
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-bold text-primary">{stats.percentage}%</motion.p>
        </motion.div>
      </div>
      {/* RFID Scanner */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-8 border-2 border-primary/30 scan-pulse shadow-xl">
  <div className="max-w-2xl mx-auto text-center flex flex-col items-center justify-center gap-4">
          <div className="w-20 h-20 rounded-2xl gradient-primary mx-auto mb-6 flex items-center justify-center animate-pulse">
            <Scan className="w-10 h-10 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2 tracking-tight">Scan RFID Card</h2>
          <p className="text-muted-foreground mb-6">Place the RFID reader focus on the field below and scan the card</p>
          <form onSubmit={handleScan} aria-label="RFID Scan Form">
            <Input
              ref={inputRef}
              type="text"
              value={rfidInput}
              onChange={(e) => setRfidInput(e.target.value)}
              placeholder={currentSession ? "RFID Tag will appear here..." : "No active session — start a session"}
              className={`text-center text-lg h-14 bg-background ${!currentSession ? 'opacity-60 cursor-not-allowed' : ''}`}
              disabled={!currentSession}
              readOnly={!currentSession}
              aria-label="RFID Input"
            />
            {/* Scan Progress Bar */}
            <div className="w-full h-2 bg-secondary/40 rounded-full mt-4">
              <motion.div
                className="h-2 rounded-full gradient-primary"
                initial={{ width: 0 }}
                animate={{ width: rfidInput ? `${Math.min(rfidInput.length * 10, 100)}%` : '0%' }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </form>
          <p className="text-xs text-muted-foreground mt-3">
            <Clock className="w-3 h-3 inline mr-1" />
            Keep this window active for automatic scanning
          </p>
        </div>
      </motion.div>
      {/* Search/Filter Students */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold">Present Students ({currentSession.attendees.length})</h3>
      </div>
      
      <AnimatePresence>
        {showConfirmation && lastScannedStudent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          >
            <div className={`glass rounded-2xl p-6 max-w-2xl w-full ${scanResult === 'success' ? 'ring-2 ring-success/40' : 'ring-2 ring-amber-400/30'}`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="md:col-span-2 flex items-center gap-4 min-w-0">
                  <Avatar className="w-28 h-28 shadow-lg">
                    <AvatarImage src={lastScannedStudent.photo} alt={lastScannedStudent.name} />
                    <AvatarFallback className="text-2xl">{(lastScannedStudent.name || '').split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h3 className="text-2xl font-bold truncate">{lastScannedStudent.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{lastScannedStudent.regNo}</p>
                    <p className="text-sm text-muted-foreground mt-1">{lastScannedStudent.department} • {lastScannedStudent.level}</p>
                    {(() => {
                      const existing = findAttendanceRecord(lastScannedStudent);
                      return existing ? (
                        <p className="text-xs text-muted-foreground mt-2">Time In: <span className="font-medium">{formatRecordDate(existing)} • {formatRecordTime(existing)}</span></p>
                      ) : null;
                    })()}
                  </div>
                </div>

                <div className="flex flex-col items-start md:items-end gap-3">
                  <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold ${scanResult === 'success' ? 'bg-success/90 text-white' : 'bg-amber-500 text-white'}`}>
                    {scanResult === 'success' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    <span>{scanResult === 'success' ? 'Present' : 'Already Marked'}</span>
                  </div>

                  <div className="text-xs text-muted-foreground">{scanResult === 'success' ? 'Attendance recorded successfully' : 'This student was already marked for today'}</div>

                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" onClick={() => { const rec = findAttendanceRecord(lastScannedStudent); if (rec) { openEditModal(rec); } else { setIsEditModalOpen(true); } setShowConfirmation(false); }}>
                      View
                    </Button>
                    <Button className="gradient-primary" onClick={() => setShowConfirmation(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="glass rounded-xl p-6">
        <div className="glass rounded-xl p-6 shadow-xl">
          {currentSession.attendees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No students scanned yet</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y">
              {currentSession.attendees
                .filter(record =>
                  (record.student?.name || '').toLowerCase().includes(search.toLowerCase()) ||
                  (record.student?.regNo || '').toLowerCase().includes(search.toLowerCase())
                )
                .map((record, index) => (
                  <motion.div
                    key={record._id || record.student?._id || record.studentId || index}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="flex items-center justify-between gap-4 py-4 px-3 hover:bg-secondary/40 transition-colors"
                    tabIndex={0}
                    aria-label={`Student ${record.student?.name || 'Unknown'}`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <Avatar className="w-16 h-16 shadow">
                        <AvatarImage src={record.student?.photo} alt={record.student?.name} />
                        <AvatarFallback>{(record.student?.name || '').split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold text-lg leading-tight truncate">{record.student?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{record.student?.regNo}</p>
                        <span className="text-xs text-muted-foreground">{record.student?.department} • {record.student?.level}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground">{formatRecordTime(record)}</span>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" aria-label="Edit Attendance" onClick={() => openEditModal(record)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" aria-label="Delete Attendance" onClick={() => handleDelete(record._id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          )}
        </div>
        {/* Edit Attendance Modal */}
        <div>
          <dialog open={isEditModalOpen} className="max-w-md rounded-xl shadow-xl p-8 bg-background">
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <h2 className="text-xl font-bold mb-4">Edit Attendance Record</h2>
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
    </div>
  );
};

export default Attendance;
