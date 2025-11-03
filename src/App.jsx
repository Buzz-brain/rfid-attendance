import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/toaster';
import { Toaster as Sonner } from './components/ui/sonner';
import { TooltipProvider } from './components/ui/tooltip';
import { ThemeProvider } from './components/ThemeProvider';
import { Layout } from './components/Layout';
import RequireAuth from './components/RequireAuth';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Courses from './pages/Courses';
import Attendance from './pages/Attendance';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

import { useEffect } from 'react';
import useStore from './store/useStore';

const App = () => {
  const getProfile = useStore(state => state.getProfile);

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Layout />}> 
                <Route index element={<RequireAuth><Navigate to="/dashboard" replace /></RequireAuth>} />
                <Route path="dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
                <Route path="students" element={<RequireAuth><Students /></RequireAuth>} />
                <Route path="courses" element={<RequireAuth><Courses /></RequireAuth>} />
                <Route path="attendance" element={<RequireAuth><Attendance /></RequireAuth>} />
                <Route path="reports" element={<RequireAuth><Reports /></RequireAuth>} />
                <Route path="settings" element={<RequireAuth><Settings /></RequireAuth>} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
