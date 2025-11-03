import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Waves, Mail, Lock, LogIn } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import useStore from '../store/useStore';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const login = useStore(state => state.login);
  const user = useStore(state => state.user);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      toast.success('Login successful!');
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'Login failed');
    }
  };
  
  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="glass rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Waves className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">RFID Attendance</h1>
              <p className="text-sm text-muted-foreground">Management System</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@rfid.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full gradient-primary"
              disabled={loading}
            >
              {loading ? (
                'Logging in...'
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-secondary/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">Demo Credentials:</p>
            <div className="space-y-1 text-xs">
              <p><strong>Admin:</strong> admin@rfid.edu / admin123</p>
              <p><strong>Lecturer:</strong> lecturer@rfid.edu / lecturer123</p>
            </div>
          </div>
        </div>
        
        <p className="text-center text-sm text-white/70 mt-6">
          © 2024 RFID Attendance System. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
