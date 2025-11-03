import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Users, BookOpen, TrendingUp, Clock, Calendar, Play } from 'lucide-react';
import { StatsCard } from '../components/StatsCard';
import { Button } from '../components/ui/button';
import useStore from '../store/useStore';
import DashboardAnalytics from '../components/DashboardAnalytics';
import { fetchDashboardOverview } from '../lib/api';

const Dashboard = () => {
  const students = useStore(state => state.students);
  const courses = useStore(state => state.courses);
  const attendance = useStore(state => state.attendance);
  const currentSession = useStore(state => state.currentSession);
  const token = useStore(state => state.token);

  const [overview, setOverview] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [overviewError, setOverviewError] = useState(null);

  // prefer server-provided recentSessions, fallback to attendance history
  const recentSessions = overview?.recentSessions ?? attendance.slice(-5).reverse();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const t = token || localStorage.getItem('token');
      if (!t) return;
      setLoadingOverview(true);
      setOverviewError(null);
      try {
        const res = await fetchDashboardOverview(t);
        if (res.success && res.data) {
          if (mounted) setOverview(res.data);
        } else {
          if (mounted) setOverviewError(res.message || 'Failed to load overview');
        }
      } catch (err) {
        if (mounted) setOverviewError(err.message || 'Failed to fetch overview');
      } finally {
        if (mounted) setLoadingOverview(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [token]);
  
  return (
  <div className="space-y-8 animate-in w-full px-0">
      {/* Top header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1">A quick snapshot of attendance activity and sessions.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Styled date pill (hidden on small screens) */}
          <div className="hidden md:flex items-center gap-3">
            <div className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-secondary/10 ring-1 ring-secondary/20">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div className="leading-tight">
                <div className="text-sm font-medium text-foreground">{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                <div className="text-xs text-muted-foreground">{new Date().toLocaleDateString(undefined, { year: 'numeric' })}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Redesigned Stats Section: unified StatsCard usage */}
      {/* Stats: show all at once with responsive grid (no horizontal scroll) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pb-2">
        <StatsCard
          icon={Users}
          label="Total Students"
          value={overview?.totalStudents ?? students.length}
          subtitle="+12% since last month"
          variant="blue"
          className="w-full"
        />
        <StatsCard
          icon={BookOpen}
          label="Active Courses"
          value={overview?.totalCourses ?? courses.length}
          subtitle="+2 new"
          variant="purple"
          className="w-full"
        />
        <StatsCard
          icon={TrendingUp}
          label="Avg. Attendance"
          value={overview?.avgAttendance != null ? `${overview.avgAttendance}%` : (attendance.length ? `${Math.round((attendance.filter(a=>a.status==='present').length / Math.max(attendance.length,1)) * 100)}%` : '—')}
          subtitle="+5% vs last week"
          variant="green"
          className="w-full"
        />
        <StatsCard
          icon={Clock}
          label="Sessions Today"
          value={overview?.sessionsToday ?? (currentSession ? 1 : 0)}
          subtitle={overview ? (overview.sessionsToday ? 'Sessions today' : 'No session') : (currentSession ? 'Active session running' : 'No session')}
          variant="orange"
          className="w-full"
        />
      </div>

      {/* Main grid: analytics + recent sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Attendance Analytics</h3>
          <div className="min-h-[260px]">
            <DashboardAnalytics />
          </div>
        </div>

        <div className="glass rounded-xl p-6 shadow-lg flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Active Session</h3>
            <div className="text-xs text-muted-foreground">Live</div>
          </div>
          {currentSession ? (
            <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{currentSession?.course?.title ?? overview?.currentActiveSessions?.[0]?.course?.courseTitle ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">{currentSession?.course?.code ?? overview?.currentActiveSessions?.[0]?.course?.courseCode ?? ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{students.length}</p>
                      <p className="text-xs text-muted-foreground">Total Students</p>
                      <p className="text-2xl font-bold mt-2">{currentSession ? currentSession.attendees.length : (overview?.currentActiveSessions?.[0]?.attendeesCount ?? 0)}</p>
                      <p className="text-xs text-muted-foreground">Present</p>
                    </div>
                  </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-secondary/10 rounded">
                  <p className="text-xs text-muted-foreground">Started</p>
                  <p className="font-medium">{currentSession?.startTime ? new Date(currentSession.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : (overview?.currentActiveSessions?.[0]?.sessionDate ? new Date(overview.currentActiveSessions[0].sessionDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '—')}</p>
                </div>
                <div className="p-3 bg-secondary/10 rounded">
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="font-medium">{currentSession?.startTime ? `${Math.floor((Date.now() - new Date(currentSession.startTime).getTime()) / 60000)}m` : (overview?.currentActiveSessions?.[0]?.sessionDate ? `${Math.floor((Date.now() - new Date(overview.currentActiveSessions[0].sessionDate).getTime()) / 60000)}m` : '—')}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" onClick={() => navigate('/attendance')}>View Session</Button>
                <Button className="text-destructive" onClick={async () => {
                  const result = await endSession();
                  if (result.success) {
                    toast.success('Session ended');
                  } else {
                    toast.error(result.error || 'Failed to end session');
                  }
                }}>End</Button>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-6">
              <Clock className="w-10 h-10 mx-auto mb-2 opacity-60" />
              <p>No active session</p>
            </div>
          )}

          <div>
            <h4 className="text-sm font-semibold mt-2">Recent Sessions</h4>
            <div className="mt-2 space-y-2 max-h-44 overflow-auto">
              {recentSessions.length === 0 ? (
                <div className="text-xs text-muted-foreground">No recent sessions</div>
              ) : (
                recentSessions.map((s, idx) => {
                  // defensive: attendance history may contain single attendance docs or session objects
                  const key = s._id || s.id || `recent-${idx}`;
                  // recentSessions may come from server (course:{courseCode,courseTitle}, sessionDate, attendeesCount)
                  const courseCode = s.course?.courseCode || s.course?.code || s.courseCode || s.courseTitle || '—';
                  const start = s.sessionDate || s.startTime || s.date || s.createdAt;
                  const startDisplay = start ? new Date(start).toLocaleDateString() : '—';
                  const attendeesCount = Array.isArray(s.attendees)
                    ? s.attendees.length
                    : (typeof s.attendees === 'number' ? s.attendees : (typeof s.attendeesCount === 'number' ? s.attendeesCount : (s.student ? 1 : 0)));

                  return (
                    <div key={key} className="flex items-center justify-between p-2 rounded hover:bg-secondary/40">
                      <div className="text-sm">
                        <div className="font-medium">{courseCode}</div>
                        <div className="text-xs text-muted-foreground">{startDisplay}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{attendeesCount}</div>
                        <div className="text-xs text-muted-foreground">students</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
