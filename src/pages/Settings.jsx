import { motion } from 'framer-motion';
import { User, Bell, Shield, Database, Moon, Sun } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import useStore from '../store/useStore';

const Settings = () => {
  const user = useStore(state => state.user);
  const theme = useStore(state => state.theme);
  const toggleTheme = useStore(state => state.toggleTheme);
  
  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application preferences</p>
      </div>
      
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Profile Information</h3>
            <p className="text-sm text-muted-foreground">Update your personal information</p>
          </div>
        </div>
        
        <div className="space-y-4 max-w-2xl">
          <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-secondary/50">
            <div>
              <Label className="text-xs text-muted-foreground">Name</Label>
              <p className="font-medium">{user?.name}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Email</Label>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Role</Label>
              <p className="font-medium capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            {theme === 'light' ? (
              <Sun className="w-5 h-5 text-accent" />
            ) : (
              <Moon className="w-5 h-5 text-accent" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold">Appearance</h3>
            <p className="text-sm text-muted-foreground">Customize how the app looks</p>
          </div>
        </div>
        
        <div className="max-w-2xl">
          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
            <div>
              <Label className="font-medium">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">Toggle between light and dark theme</p>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={toggleTheme}
            />
          </div>
        </div>
      </div>
      
      <div className="p-4 rounded-lg bg-secondary/50 text-xs text-muted-foreground text-center">
        <p>RFID Attendance System v1.0.0</p>
        <p className="mt-1">© 2025 All Rights Reserved</p>
      </div>
    </div>
  );
};

export default Settings;
