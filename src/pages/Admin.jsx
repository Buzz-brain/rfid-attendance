import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import useStore from '../store/useStore';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const user = useStore(state => state.user);
  const navigate = useNavigate();
  const users = useStore(state => state.users);
  const fetchUsers = useStore(state => state.fetchUsers);
  const createUser = useStore(state => state.createUser);
  const updateUser = useStore(state => state.updateUser);
  const deleteUser = useStore(state => state.deleteUser);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    role: 'admin',
    password: ''
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      toast.error('Access denied: Admins only');
      navigate('/');
      return;
    }
    fetchUsers();
  }, [fetchUsers, user, navigate]);

  const openEditModal = (user) => {
    setEditUserId(user._id);
    setEditFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: ''
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    await updateUser(editUserId, editFormData);
    toast.success('User updated successfully!');
    setIsEditModalOpen(false);
  };

  const handleDelete = async (id, email) => {
    if (window.confirm(`Delete user ${email}?`)) {
      await deleteUser(id);
      toast.success('User deleted');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await createUser(editFormData);
    toast.success('User created!');
    setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in">
      <h1 className="text-3xl font-bold mb-4">Admin Management</h1>
      <Button onClick={() => { setEditUserId(null); setEditFormData({ name: '', email: '', role: 'admin', password: '' }); setIsEditModalOpen(true); }} className="gradient-primary mb-4">Add Admin/User</Button>
      <div className="glass rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">Users</h3>
        {users.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No users found</div>
        ) : (
          <div className="space-y-2">
            {users.map(user => (
              <div key={user._id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                <div className="flex-1">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground">{user.role}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => openEditModal(user)}>Edit</Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(user._id, user.email)} className="text-destructive">Delete</Button>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Edit/Create User Modal */}
      <div>
        <dialog open={isEditModalOpen} className="max-w-md rounded-xl shadow-xl p-8 bg-background">
          <form onSubmit={editUserId ? handleEditSubmit : handleCreate} className="space-y-4">
            <h2 className="text-xl font-bold mb-4">{editUserId ? 'Edit User' : 'Add User'}</h2>
            <div className="space-y-2">
              <label htmlFor="edit-name">Name</label>
              <input
                id="edit-name"
                value={editFormData.name}
                onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                required
                className="w-full p-2 rounded border"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-email">Email</label>
              <input
                id="edit-email"
                type="email"
                value={editFormData.email}
                onChange={e => setEditFormData({ ...editFormData, email: e.target.value })}
                required
                className="w-full p-2 rounded border"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-role">Role</label>
              <select
                id="edit-role"
                value={editFormData.role}
                onChange={e => setEditFormData({ ...editFormData, role: e.target.value })}
                className="w-full p-2 rounded border"
              >
                <option value="admin">Admin</option>
                <option value="lecturer">Lecturer</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-password">Password {editUserId ? '(leave blank to keep unchanged)' : ''}</label>
              <input
                id="edit-password"
                type="password"
                value={editFormData.password}
                onChange={e => setEditFormData({ ...editFormData, password: e.target.value })}
                className="w-full p-2 rounded border"
              />
            </div>
            <div className="flex gap-3 justify-end mt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="gradient-primary">
                {editUserId ? 'Save Changes' : 'Create User'}
              </Button>
            </div>
          </form>
        </dialog>
      </div>
    </div>
  );
};

export default Admin;
