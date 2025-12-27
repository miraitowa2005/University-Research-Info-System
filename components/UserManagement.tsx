import React, { useState, useEffect, useMemo } from 'react';
import { User } from '../types';
import { usersAPI } from '../logic/api';
import { toast } from 'react-toastify';
import { 
  Search, Plus, Edit2, Trash2, X, User as UserIcon, Mail, 
  Lock, Briefcase, Shield, Filter, MoreHorizontal, CheckCircle2 
} from 'lucide-react';

interface Props {
  initialUsers: User[];
  onDataChange: () => void;
}

/**
 * 👥 UserDirectory - 人员档案指挥中心
 * 重构说明：引入卡片式布局、角色徽章系统和顶部统计仪表盘。
 */
export const UserManagement: React.FC<Props> = ({ initialUsers, onDataChange }) => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'teacher' | 'research_admin' | 'sys_admin'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => { setUsers(initialUsers); }, [initialUsers]);

  // --- 1. 数据处理 ---
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const stats = useMemo(() => ({
    total: users.length,
    admins: users.filter(u => u.role === 'sys_admin').length,
    teachers: users.filter(u => u.role === 'teacher').length,
    researchAdmins: users.filter(u => u.role === 'research_admin').length,
  }), [users]);

  // --- 2. 交互逻辑 ---
  const handleAdd = () => { setEditingUser(null); setIsModalOpen(true); };
  const handleEdit = (user: User) => { setEditingUser(user); setIsModalOpen(true); };
  
  const handleDelete = async (userId: string) => {
    if (confirm('⚠️ 高风险操作：确定要永久删除该用户账号吗？\n此操作将同时清除该用户的所有关联数据，且不可恢复。')) {
      try {
        await usersAPI.delete(userId);
        toast.success('用户账号已注销');
        onDataChange();
      } catch (error: any) { 
        toast.error(error.message || '删除失败');
      }
    }
  };

  // --- 3. 辅助组件：角色徽章 ---
  const RoleBadge = ({ role }: { role: string }) => {
    const config: Record<string, { label: string, style: string, icon: any }> = {
      sys_admin: { label: '系统管理员', style: 'bg-purple-100 text-purple-700 border-purple-200', icon: Shield },
      research_admin: { label: '科研管理员', style: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: Briefcase },
      teacher: { label: '教职工', style: 'bg-slate-100 text-slate-600 border-slate-200', icon: UserIcon },
    };
    const c = config[role] || config.teacher;
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${c.style}`}>
        <c.icon className="w-3 h-3 mr-1.5" />
        {c.label}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* === Header: 统计概览 === */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">总用户数</div>
          <div className="text-2xl font-black text-slate-800 mt-1">{stats.total}</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 shadow-sm">
          <div className="text-xs font-bold text-purple-600/70 uppercase tracking-wider">系统管理员</div>
          <div className="text-2xl font-black text-purple-700 mt-1">{stats.admins}</div>
        </div>
        <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 shadow-sm">
          <div className="text-xs font-bold text-indigo-600/70 uppercase tracking-wider">科研管理员</div>
          <div className="text-2xl font-black text-indigo-700 mt-1">{stats.researchAdmins}</div>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500/70 uppercase tracking-wider">普通教职工</div>
          <div className="text-2xl font-black text-slate-600 mt-1">{stats.teachers}</div>
        </div>
      </div>

      {/* === Toolbar: 搜索与操作 === */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full relative group">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text" 
            placeholder="搜索姓名、邮箱或工号..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-medium"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <div className="flex bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
            {[
              { id: 'all', label: '全部' },
              { id: 'sys_admin', label: '系统' },
              { id: 'research_admin', label: '科研' },
              { id: 'teacher', label: '教师' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setRoleFilter(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  roleFilter === tab.id 
                    ? 'bg-slate-800 text-white shadow-md' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          <button 
            onClick={handleAdd} 
            className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 mr-2" /> 新增用户
          </button>
        </div>
      </div>

      {/* === Main Grid: 人员名片墙 === */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map(user => (
          <div 
            key={user.id} 
            className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 overflow-hidden"
          >
            {/* 顶部背景装饰 */}
            <div className={`h-20 bg-gradient-to-r ${
              user.role === 'sys_admin' ? 'from-purple-600 to-indigo-600' :
              user.role === 'research_admin' ? 'from-indigo-500 to-blue-500' :
              'from-slate-400 to-slate-500'
            }`}></div>

            <div className="px-6 pb-6 relative">
              {/* 头像 */}
              <div className="absolute -top-10 left-6 w-20 h-20 rounded-2xl border-4 border-white bg-white shadow-md flex items-center justify-center text-3xl font-black text-slate-700 overflow-hidden">
                {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover"/> : user.name.charAt(0)}
              </div>

              {/* 快捷操作浮层 (Hover显示) */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                <button onClick={() => handleEdit(user)} className="p-2 bg-white rounded-lg shadow-sm border border-slate-100 text-slate-500 hover:text-indigo-600 hover:border-indigo-100 transition" title="编辑资料">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(user.id)} className="p-2 bg-white rounded-lg shadow-sm border border-slate-100 text-slate-500 hover:text-red-600 hover:border-red-100 transition" title="删除用户">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-12">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{user.name}</h3>
                    <p className="text-sm text-slate-500 font-mono mt-0.5">{user.email}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <RoleBadge role={user.role} />
                  {user.department && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-100">
                      <Briefcase className="w-3 h-3 mr-1.5 text-slate-400" />
                      {user.department}
                    </span>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center text-xs text-slate-400">
                  <div className="flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-500" /> 
                    状态正常
                  </div>
                  <div>ID: {user.id.slice(0,8)}...</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Search className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-slate-500 font-medium">没有找到符合条件的用户</h3>
          <p className="text-xs text-slate-400 mt-1">请尝试调整搜索关键词或角色筛选</p>
        </div>
      )}

      {/* Modal 保持原有逻辑，仅美化样式 */}
      {isModalOpen && (
        <UserFormModal 
          user={editingUser}
          onClose={() => setIsModalOpen(false)}
          onSave={() => { setIsModalOpen(false); onDataChange(); }}
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
        await usersAPI.update(user.id, formData);
        toast.success('用户资料已更新');
      } else {
        await usersAPI.create(formData);
        toast.success('新用户已创建');
      }
      onSave();
    } catch (error: any) {
      toast.error(error.message || '操作失败');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black text-slate-800">{user ? '编辑用户档案' : '录入新用户'}</h3>
            <p className="text-xs text-slate-500 mt-1">请确保填写信息的准确性，这将影响权限分配。</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200/50 text-slate-400 hover:text-slate-600 transition"><X className="w-5 h-5"/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <InputField icon={UserIcon} label="真实姓名" name="real_name" value={formData.real_name} onChange={setFormData} placeholder="如：张三" />
            <InputField icon={Mail} label="登录邮箱 (作为账号)" name="username" value={formData.username} onChange={setFormData} disabled={!!user} placeholder="name@university.edu.cn" />
            {!user && <InputField icon={Lock} label="初始密码" name="password" type="password" value={formData.password} onChange={setFormData} placeholder="••••••••" />}
            
            <div className="grid grid-cols-2 gap-4">
              <SelectField icon={Shield} label="系统角色" name="role_code" value={formData.role_code} onChange={setFormData} 
                options={[
                  {value:'teacher', label:'普通教职工'},
                  {value:'research_admin', label:'科研管理员'},
                  {value:'sys_admin', label:'系统管理员'}
                ]} 
              />
              <InputField icon={Briefcase} label="所属部门ID" name="dept_id" value={formData.dept_id} onChange={setFormData} placeholder="如：CS" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition">取消</button>
            <button type="submit" className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">
              确认保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InputField = ({ icon: Icon, label, name, value, onChange, type = 'text', disabled = false, placeholder }: any) => (
  <div className="group">
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
      </div>
      <input
        type={type}
        name={name}
        required
        disabled={disabled}
        placeholder={placeholder}
        className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        value={value}
        onChange={e => onChange((prev: any) => ({ ...prev, [name]: e.target.value }))}
      />
    </div>
  </div>
);

const SelectField = ({ icon: Icon, label, name, value, onChange, options }: any) => (
  <div className="group">
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
      </div>
      <select
        name={name}
        className="block w-full pl-10 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 appearance-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all cursor-pointer"
        value={value}
        onChange={e => onChange((prev: any) => ({ ...prev, [name]: e.target.value }))}
      >
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
    </div>
  </div>
);