import { useMemo } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Card } from './ui/card';
import useStore from '../store/useStore';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const DashboardAnalytics = () => {
  const students = useStore(state => state.students) || [];
  const courses = useStore(state => state.courses) || [];
  const attendance = useStore(state => state.attendance) || [];

  // Attendance rate per course (robust for both mock and real data)
  const attendanceByCourse = useMemo(() => {
    const map = {};
    (courses || []).forEach(course => {
      const code = course.courseCode || course.code;
      map[code] = 0;
    });
    (attendance || []).forEach(record => {
      // Defensive: handle both session objects and flat attendance records
      let code = null;
      if (record.course) {
        code = record.course.courseCode || record.course.code;
      } else if (record.courseCode) {
        code = record.courseCode;
      }
      if (code && map[code] !== undefined) {
        // If record has attendees array (mock session), count them
        if (Array.isArray(record.attendees)) {
          map[code] += record.attendees.length;
        } else {
          // Otherwise, count each attendance record as 1
          map[code] += 1;
        }
      }
    });
    return map;
  }, [courses, attendance]);

  // Pie chart: student distribution by department
  const departmentCounts = useMemo(() => {
    const map = {};
    (students || []).forEach(s => {
      if (s && s.department) {
        map[s.department] = (map[s.department] || 0) + 1;
      }
    });
    return map;
  }, [students]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      <Card className="p-6">
        <h4 className="font-bold mb-4">Attendance by Course</h4>
        {Object.keys(attendanceByCourse).length === 0 ? (
          <div className="text-muted-foreground text-sm">No attendance data available.</div>
        ) : (
          <Bar
            data={{
              labels: Object.keys(attendanceByCourse),
              datasets: [{
                label: 'Attendance',
                data: Object.values(attendanceByCourse),
                backgroundColor: 'rgba(59,130,246,0.7)'
              }]
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false } }
            }}
          />
        )}
      </Card>
      <Card className="p-6">
        <h4 className="font-bold mb-4">Students by Department</h4>
        {Object.keys(departmentCounts).length === 0 ? (
          <div className="text-muted-foreground text-sm">No student data available.</div>
        ) : (
          <Pie
            data={{
              labels: Object.keys(departmentCounts),
              datasets: [{
                data: Object.values(departmentCounts),
                backgroundColor: [
                  '#3b82f6', '#10b981', '#f59e42', '#ef4444', '#6366f1', '#f472b6'
                ]
              }]
            }}
            options={{
              responsive: true,
              plugins: { legend: { position: 'bottom' } }
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default DashboardAnalytics;
