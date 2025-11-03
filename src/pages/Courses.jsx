import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, Edit, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { toast } from 'sonner';

const Courses = () => {
  const courses = useStore(state => state.courses);
  const user = useStore(state => state.user);
  const lecturers = useStore(state => state.lecturers);
  const fetchLecturers = useStore(state => state.fetchLecturers);
  const fetchCourses = useStore(state => state.fetchCourses);
  const startSession = useStore(state => state.startSession);
  const updateCourse = useStore(state => state.updateCourse);
  const deleteCourse = useStore(state => state.deleteCourse);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editCourseId, setEditCourseId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    courseCode: '',
    courseTitle: '',
    lecturer: '',
    department: 'Information Technology (IFT)',
    level: ''
  });
  const [addFormData, setAddFormData] = useState({
    courseCode: '',
    courseTitle: '',
    lecturer: '',
    department: 'Information Technology (IFT)',
    level: ''
  });
  const addCourse = useStore(state => state.addCourse);
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    await addCourse(addFormData);
    toast.success('Course added successfully!');
    setIsAddModalOpen(false);
    setAddFormData({ courseCode: '', courseTitle: '', lecturer: '', department: '', level: '' });
  };
  const openEditModal = (course) => {
    setEditCourseId(course._id);
    setEditFormData({
      courseCode: course.courseCode,
      courseTitle: course.courseTitle,
      lecturer: course.lecturer?._id || '',
      // department fixed to Information Technology (IFT) and shown read-only
      department: 'Information Technology (IFT)',
      level: course.level
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    await updateCourse(editCourseId, editFormData);
    toast.success('Course updated successfully!');
    setIsEditModalOpen(false);
  };

  const handleDelete = async (id, code) => {
    if (window.confirm(`Are you sure you want to delete course ${code}?`)) {
      await deleteCourse(id);
      toast.success('Course deleted successfully');
    }
  };
  const currentSession = useStore(state => state.currentSession);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchCourses();
      await fetchLecturers();
      setLoading(false);
    };
    load();
    // eslint-disable-next-line
  }, []);

  const handleStartSession = async (courseId) => {
    const result = await startSession(courseId);
    if (result.success) {
      toast.success('Session started successfully!');
      navigate('/attendance');
    } else {
      toast.error(result.error || 'Failed to start session');
    }
  };
  
  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Courses</h1>
          <p className="text-muted-foreground">Select a course to start an attendance session</p>
        </div>
        {user?.role !== 'lecturer' && (
          <Button className="gradient-primary" onClick={() => setIsAddModalOpen(true)}>
            Add Course
          </Button>
        )}
      </div>
      
      {currentSession && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-4 border-2 border-accent/50 bg-accent/5"
        >
          <p className="text-sm font-medium">
            <span className="text-accent">Active Session:</span>{' '}
            {currentSession.course && currentSession.course.courseCode && currentSession.course.courseTitle
              ? `${currentSession.course.courseCode} - ${currentSession.course.courseTitle}`
              : '-'}
          </p>
        </motion.div>
      )}
      
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading courses...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course, index) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass rounded-2xl p-0 shadow-md hover:shadow-xl transition-all border border-slate-100"
            >
              <div className="flex items-center justify-between px-6 pt-6 pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <BookOpen className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-primary tracking-wide">{course.courseCode}</div>
                    <div className="text-base text-slate-700 font-medium leading-tight">{course.courseTitle}</div>
                  </div>
                </div>
                {currentSession?.courseId === course._id && (
                  <span className="px-3 py-1 rounded-full bg-success/10 text-success text-xs font-semibold shadow">Active</span>
                )}
              </div>
              <div className="px-6 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground font-medium">{course.lecturer?.name || ''}</span>
                </div>
                <div className="flex gap-2 mb-2">
                  <span className="px-2 py-1 rounded bg-blue-50 text-xs text-blue-700 font-semibold border border-blue-100">{course.department}</span>
                  <span className="px-2 py-1 rounded bg-purple-50 text-xs text-purple-700 font-semibold border border-purple-100">{course.level}</span>
                </div>
                <div className="flex gap-2 mt-4">
                  {user?.role === 'lecturer' && (
                    <Button
                      onClick={() => handleStartSession(course._id)}
                      disabled={currentSession?.courseId === course._id}
                      className="w-full gradient-primary"
                    >
                      {currentSession?.courseId === course._id ? 'Session Active' : 'Start Session'}
                    </Button>
                  )}
                  {user?.role !== 'lecturer' && (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => openEditModal(course)}>
                        <Edit className="w-5 h-5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(course._id, course.courseCode)}>
                        <Trash2 className="w-5 h-5 text-destructive" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      {/* Add Course Modal */}
      <div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogContent className="max-w-2xl sm:max-w-3xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xl font-bold">C</div>
              <div>
                <DialogHeader>
                  <DialogTitle className="text-2xl">Add Course</DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">Provide course details and assign a lecturer — department is fixed to Information Technology (IFT).</DialogDescription>
                </DialogHeader>
              </div>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="add-courseCode" className="text-sm font-medium">Course Code *</label>
                  <input
                    id="add-courseCode"
                    value={addFormData.courseCode}
                    onChange={e => setAddFormData({ ...addFormData, courseCode: e.target.value })}
                    required
                    placeholder="e.g. IFT101"
                    className="w-full p-3 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="add-courseTitle" className="text-sm font-medium">Course Title *</label>
                  <input
                    id="add-courseTitle"
                    value={addFormData.courseTitle}
                    onChange={e => setAddFormData({ ...addFormData, courseTitle: e.target.value })}
                    required
                    placeholder="e.g. Introduction to Information Technology"
                    className="w-full p-3 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="add-lecturer" className="text-sm font-medium">Lecturer *</label>
                  <select
                    id="add-lecturer"
                    value={addFormData.lecturer}
                    onChange={e => setAddFormData({ ...addFormData, lecturer: e.target.value })}
                    required
                    className="w-full p-3 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="">Select Lecturer</option>
                    {lecturers.map(l => (
                      <option key={l._id} value={l._id}>{l.name} ({l.email})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="add-department" className="text-sm font-medium">Department</label>
                  <input
                    id="add-department"
                    value={addFormData.department}
                    readOnly
                    className="w-full p-3 rounded-lg border border-slate-100 bg-slate-50 text-muted-foreground cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="add-level" className="text-sm font-medium">Level *</label>
                  <input
                    id="add-level"
                    value={addFormData.level}
                    onChange={e => setAddFormData({ ...addFormData, level: e.target.value })}
                    required
                    placeholder="e.g. 100"
                    className="w-full p-3 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="gradient-primary">
                  Add Course
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {/* Edit Course Modal */}
      {/* Edit Course Modal */}
      <div>
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl sm:max-w-3xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xl font-bold">E</div>
                <div>
                  <DialogHeader>
                    <DialogTitle className="text-2xl">Edit Course</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">Update course details. Department is fixed to Information Technology (IFT).</DialogDescription>
                  </DialogHeader>
                </div>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="edit-courseCode" className="text-sm font-medium">Course Code *</label>
                    <input
                      id="edit-courseCode"
                      value={editFormData.courseCode}
                      onChange={e => setEditFormData({ ...editFormData, courseCode: e.target.value })}
                      required
                      className="w-full p-3 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="edit-courseTitle" className="text-sm font-medium">Course Title *</label>
                    <input
                      id="edit-courseTitle"
                      value={editFormData.courseTitle}
                      onChange={e => setEditFormData({ ...editFormData, courseTitle: e.target.value })}
                      required
                      className="w-full p-3 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="edit-lecturer" className="text-sm font-medium">Lecturer *</label>
                    <select
                      id="edit-lecturer"
                      value={editFormData.lecturer}
                      onChange={e => setEditFormData({ ...editFormData, lecturer: e.target.value })}
                      required
                      className="w-full p-3 rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="">Select Lecturer</option>
                      {lecturers.map(l => (
                        <option key={l._id} value={l._id}>{l.name} ({l.email})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="edit-department" className="text-sm font-medium">Department</label>
                    <input
                      id="edit-department"
                      value={editFormData.department}
                      readOnly
                      className="w-full p-3 rounded-lg border border-slate-100 bg-slate-50 text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="edit-level" className="text-sm font-medium">Level *</label>
                    <input
                      id="edit-level"
                      value={editFormData.level}
                      onChange={e => setEditFormData({ ...editFormData, level: e.target.value })}
                      required
                      className="w-full p-3 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
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
            </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Courses;
