import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  ClipboardCheck, 
  BarChart3, 
  Settings,
  Waves
} from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/students', icon: Users, label: 'Students' },
  { path: '/courses', icon: BookOpen, label: 'Courses' },
  { path: '/attendance', icon: ClipboardCheck, label: 'Attendance' },
  { path: '/reports', icon: BarChart3, label: 'Reports' },
  { path: '/settings', icon: Settings, label: 'Settings' }
];

export const Sidebar = () => {
  return (
    <motion.aside 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 border-r border-border bg-card flex flex-col"
    >
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Waves className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold">RFID Attendance</h1>
            <p className="text-xs text-muted-foreground">Management System</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            aria-label={item.label}
            className={({ isActive }) =>
              `group flex items-center gap-5 px-5 py-3 rounded-xl font-medium text-base transition-all duration-150 outline-none focus:ring-2 focus:ring-primary border border-transparent ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-lg border-primary/70'
                  : 'text-muted-foreground hover:bg-blue-50/80 hover:text-primary hover:shadow-md'
              }`
            }
            tabIndex={0}
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition">
              <item.icon className="w-5 h-5" aria-hidden="true" />
            </span>
            <span className="ml-1 tracking-wide">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-border">
        <div className="glass rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-2">System Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm font-medium">All Systems Operational</span>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};
