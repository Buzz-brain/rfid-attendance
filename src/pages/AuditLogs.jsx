import { useEffect, useState } from 'react';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/audit-logs`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setLogs(data.data);
        else toast.error('Failed to fetch audit logs');
      } catch {
        toast.error('Failed to fetch audit logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6 animate-in">
      <h1 className="text-3xl font-bold mb-4">Audit Logs</h1>
      <Card className="p-6">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No audit logs found</div>
        ) : (
          <div className="space-y-2">
            {logs.map(log => (
              <div key={log._id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50">
                <div className="flex-1">
                  <p className="font-medium">{log.action}</p>
                  <p className="text-xs text-muted-foreground">{log.details}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{log.user?.name} ({log.user?.email})</p>
                  <p className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AuditLogs;
