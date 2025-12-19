import React, { useState, useEffect } from 'react';
import { User, Role } from '../types';
import { usersAPI } from '../logic/api';
import { toast } from 'react-toastify';
import { Search, Plus, Edit, Trash2, X, User as UserIcon, Mail, Lock, Briefcase } from 'lucide-react';

interface Props {
  initialUsers: User[];
  onDataChange: () => void; // Callback to refresh all app data
}

export const UserManagement: React.FC<Props> = ({ initialUsers, onDataChange }) => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const handleAdd = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await usersAPI.delete(userId);
        toast.success('User deleted successfully');
        onDataChange(); // Refresh data in App.tsx
      } catch (error: any) { 
        toast.error(error.message || 'Failed to delete user');
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.department || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search users..." 
            className="block w-full pl-9 pr-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all text-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={handleAdd} className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </button>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredUsers.map(u => (
            <tr key={u.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{u.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {u.role}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-500">{u.department || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">{u.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onClick={() => handleEdit(u)} className="text-indigo-600 hover:text-indigo-900 mr-4"><Edit className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <UserFormModal 
          user={editingUser}
          onClose={() => setIsModalOpen(false)}
          onSave={() => {
            setIsModalOpen(false);
            onDataChange();
          }}
        />
      )}
    </div>
  );
};

const UserFormModal = ({ user, onClose, onSave }: { user: User | null, onClose: () => void, onSave: () => void }) => {
  const [formData, setFormData] = useState({
    username: user?.email || '',
    password: '',
    real_name: user?.name || '',
    email: user?.email || '',
    role_code: (user?.role as string) || 'teacher',
    dept_id: (user as any)?.dept_id || '',
    title_id: (user as any)?.title_id || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (user) {
        // Update user
        await usersAPI.update(user.id, formData);
        toast.success('User updated successfully');
      } else {
        // Create user
        await usersAPI.create(formData);
        toast.success('User created successfully');
      }
      onSave();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save user');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">{user ? 'Edit User' : 'Add New User'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <InputField icon={UserIcon} label="Full Name" name="real_name" value={formData.real_name} onChange={setFormData} />
          <InputField icon={Mail} label="Email (Username)" name="username" value={formData.username} onChange={setFormData} disabled={!!user} />
          {!user && <InputField icon={Lock} label="Password" name="password" type="password" value={formData.password} onChange={setFormData} />}
          <div className="grid grid-cols-2 gap-4">
            <SelectField icon={Briefcase} label="Role" name="role_code" value={formData.role_code} onChange={setFormData} options={['teacher', 'research_admin', 'sys_admin']} />
            <InputField icon={Briefcase} label="Department ID" name="dept_id" value={formData.dept_id} onChange={setFormData} />
          </div>
          <div className="flex justify-end pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm mr-2">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InputField = ({ icon: Icon, label, name, value, onChange, type = 'text', disabled = false }: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Icon className="h-4 w-4 text-gray-400" /></div>
      <input
        type={type}
        name={name}
        required
        disabled={disabled}
        className="block w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 disabled:bg-gray-200"
        value={value}
        onChange={e => onChange((prev: any) => ({ ...prev, [name]: e.target.value }))}
      />
    </div>
  </div>
);

const SelectField = ({ icon: Icon, label, name, value, onChange, options }: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Icon className="h-4 w-4 text-gray-400" /></div>
      <select
        name={name}
        className="block w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900"
        value={value}
        onChange={e => onChange((prev: any) => ({ ...prev, [name]: e.target.value }))}
      >
        {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  </div>
);

