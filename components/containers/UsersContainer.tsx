import React, { useState } from 'react';
import { 
  Search, Plus, Trash2, Edit2, Key, Lock, Unlock, 
  Shield, ShieldAlert, User as UserIcon, Mail, Building2, MoreHorizontal 
} from 'lucide-react';
import { usersAPI, departmentAPI } from '../../logic/api';
import { toast } from 'react-toastify';
import { Role, User } from '../../types';

// 辅助组件：生成用户头像缩写
const UserAvatar = ({ name, role }: { name: string; role: Role }) => {
  const initial = name ? name.charAt(0).toUpperCase() : 'U';
  const bgColors = {
    teacher: 'bg-blue-100 text-blue-600',
    research_admin: 'bg-purple-100 text-purple-600',
    sys_admin: 'bg-orange-100 text-orange-600'
  };
  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${bgColors[role] || 'bg-gray-100'}`}>
      {initial}
    </div>
  );
};

// 辅助组件：角色标签
const RoleBadge = ({ role }: { role: string }) => {
  const config = {
    teacher: { label: '教师', class: 'bg-blue-50 text-blue-700 border-blue-200' },
    research_admin: { label: '科研管理员', class: 'bg-purple-50 text-purple-700 border-purple-200' },
    sys_admin: { label: '系统管理员', class: 'bg-orange-50 text-orange-700 border-orange-200' },
    all: { label: '未知', class: 'bg-gray-50 text-gray-700' }
  };
  const cfg = config[role as keyof typeof config] || config.all;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.class}`}>
      {cfg.label}
    </span>
  );
};

export default function UsersContainer({
  users,
  currentUser,
  onUsersRefresh,
}: {
  users: User[];
  currentUser: User | null;
  onUsersRefresh: (list: User[]) => void;
}) {
  const [deleteUserArmed, setDeleteUserArmed] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<string>('');
  const [editUserName, setEditUserName] = useState<string>('');
  const [editUserEmail, setEditUserEmail] = useState<string>('');
  const [editUserDept, setEditUserDept] = useState<string>('');
  const [editUserRole, setEditUserRole] = useState<Role>('teacher');
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'teacher' | 'research_admin' | 'sys_admin'>('all');
  const [deptMap, setDeptMap] = useState<Record<number, string>>({});

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await departmentAPI.list();
        const map: Record<number, string> = {};
        for (const d of list || []) {
          const id = Number((d as any)?.id);
          const name = String((d as any)?.name || '');
          if (!Number.isNaN(id) && name) map[id] = name;
        }
        if (!cancelled) setDeptMap(map);
      } catch {
        if (!cancelled) setDeptMap({});
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // 过滤逻辑
  const filteredUsers = users.filter((u) => {
    const byText = !q || u.name?.includes(q) || u.email?.includes(q) || u.department?.includes(q);
    const byRole = roleFilter === 'all' || u.role === roleFilter;
    return byText && byRole;
  });

  const handleEditOpen = (u: User) => {
    setEditUserId(String(u.id));
    setEditUserName(u.name || '');
    setEditUserEmail(u.email || '');
    setEditUserDept(u.department || '');
    setEditUserRole(u.role as Role);
    setEditUserOpen(true);
  };

  const handleAddUser = async () => {
    try {
      const timestamp = Date.now();
      const email = `user${timestamp}@demo.com`;
      await usersAPI.create({ 
        email, 
        password: '123456', 
        full_name: `新用户${timestamp.toString().slice(-4)}`, 
        role: 'teacher' 
      });
      const usersList = await usersAPI.getAll();
      onUsersRefresh(usersList);
      toast.success('已添加新用户 (默认密码: 123456)');
    } catch (e: any) {
      toast.error(e.message || '添加失败');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* 顶部控制栏 */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">用户管理</h2>
          <p className="text-sm text-gray-500 mt-1">管理系统内所有教职工及管理员账号</p>
        </div>
        
        {currentUser?.role === 'sys_admin' && (
          <div className="flex items-center gap-3">
            {/* 安全开关 */}
            <div 
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-pointer select-none ${
                deleteUserArmed 
                  ? 'bg-red-50 border-red-200 text-red-700' 
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setDeleteUserArmed(!deleteUserArmed)}
            >
              {deleteUserArmed ? <ShieldAlert className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
              <span className="text-xs font-bold">{deleteUserArmed ? '删除模式已开启' : '安全保护中'}</span>
              <div className={`w-8 h-4 rounded-full relative transition-colors ${deleteUserArmed ? 'bg-red-500' : 'bg-gray-300'}`}>
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${deleteUserArmed ? 'left-4.5' : 'left-0.5'}`} style={{ left: deleteUserArmed ? '18px' : '2px' }} />
              </div>
            </div>

            <button
              onClick={handleAddUser}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              添加用户
            </button>
          </div>
        )}
      </div>

      {/* 筛选与搜索卡片 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* 角色 Tab */}
        <div className="bg-gray-100/80 p-1 rounded-xl flex gap-1 w-full md:w-auto overflow-x-auto">
          {[
            { id: 'all', label: '全部用户' },
            { id: 'teacher', label: '教师' },
            { id: 'research_admin', label: '科研管理员' },
            { id: 'sys_admin', label: '系统管理员' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id as any)}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${
                roleFilter === tab.id 
                  ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 搜索框 */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索姓名、邮箱或学院..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="block w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm outline-none"
          />
        </div>
      </div>

      {/* 数据列表 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">用户详情</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">所属部门</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">联系方式</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredUsers.length > 0 ? filteredUsers.map((u) => (
                <tr key={u.id} className="group hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <UserAvatar name={u.name} role={u.role as Role} />
                      <div className="ml-4">
                        <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                          {u.name}
                        </div>
                        <div className="mt-1">
                          <RoleBadge role={u.role} />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-600">
                      <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="font-bold text-gray-800 mr-2">{u.name}</span>
                      <span className="text-gray-500">·</span>
                      <span className="ml-2">
                        {(u as any)?.dept_id != null 
                          ? (deptMap[(u as any).dept_id] || <span className="text-gray-400 italic">未分配</span>) 
                          : <span className="text-gray-400 italic">未分配</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      {u.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {currentUser?.role === 'sys_admin' ? (
                      <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditOpen(u)}
                          className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="编辑信息"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={async () => {
                            const np = window.prompt(`重置 [${u.name}] 的密码\n请输入新密码:`, '');
                            if (!np) return;
                            try {
                              await usersAPI.changePassword(String(u.id), np);
                              toast.success('密码已重置');
                            } catch (e:any) {
                              toast.error(e.message || '操作失败');
                            }
                          }}
                          className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition"
                          title="重置密码"
                        >
                          <Key className="w-4 h-4" />
                        </button>

                        <button
                          onClick={async () => {
                            try {
                              await usersAPI.update(String(u.id), { is_active: !(u as any).is_active });
                              const usersList = await usersAPI.getAll();
                              onUsersRefresh(usersList);
                              toast.success((u as any).is_active ? '用户已锁定' : '用户已激活');
                            } catch (e:any) { toast.error('操作失败'); }
                          }}
                          className={`p-2 rounded-lg transition ${
                            (u as any).is_active 
                              ? 'text-gray-500 hover:text-amber-600 hover:bg-amber-50' 
                              : 'text-amber-600 bg-amber-50'
                          }`}
                          title={(u as any).is_active ? '锁定账号' : '解锁账号'}
                        >
                          {(u as any).is_active ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        </button>

                        <div className="w-px h-4 bg-gray-200 mx-1"></div>

                        <button
                          onClick={async () => {
                            if (!deleteUserArmed) return toast.error('请先开启右上角的安全删除模式');
                            if (!window.confirm(`确认永久删除用户 [${u.name}] 吗？`)) return;
                            try {
                              await usersAPI.delete(String(u.id));
                              const usersList = await usersAPI.getAll();
                              onUsersRefresh(usersList);
                              toast.success('用户已删除');
                            } catch (e: any) { toast.error(e.message || '删除失败'); }
                          }}
                          disabled={!deleteUserArmed}
                          className={`p-2 rounded-lg transition ${
                            deleteUserArmed 
                              ? 'text-red-500 hover:bg-red-50 cursor-pointer' 
                              : 'text-gray-300 cursor-not-allowed'
                          }`}
                          title="删除用户"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">无操作权限</span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                        <Search className="w-8 h-8 text-gray-300" />
                      </div>
                      <p>未找到匹配的用户</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 编辑模态框 */}
      {editUserOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden transform transition-all scale-100">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <div className="bg-indigo-100 p-1.5 rounded-lg text-indigo-600">
                   <Edit2 className="w-4 h-4" />
                </div>
                编辑资料
              </h4>
              <button onClick={() => setEditUserOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition">
                 <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">姓名</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input 
                    value={editUserName} 
                    onChange={(e) => setEditUserName(e.target.value)} 
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm font-medium" 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">电子邮箱</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input 
                    type="email" 
                    value={editUserEmail} 
                    onChange={(e) => setEditUserEmail(e.target.value)} 
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm font-medium" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">所属部门</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input 
                    value={editUserDept} 
                    onChange={(e) => setEditUserDept(e.target.value)} 
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm font-medium" 
                    placeholder="例如：计算机学院" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">系统角色</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 'teacher', label: '教师' },
                    { val: 'research_admin', label: '科研管理' },
                    { val: 'sys_admin', label: '系统管理' }
                  ].map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => setEditUserRole(opt.val as Role)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                        editUserRole === opt.val
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 pt-2 flex justify-end gap-3">
              <button 
                onClick={() => setEditUserOpen(false)} 
                className="px-5 py-2.5 rounded-xl text-gray-600 font-bold text-sm hover:bg-gray-100 transition"
              >
                取消
              </button>
              <button
                onClick={async () => {
                  try {
                    const deptCode = editUserDept ? await departmentAPI.normalize(editUserDept) : null;
                    await usersAPI.update(editUserId, {
                      full_name: editUserName,
                      email: editUserEmail,
                      role: editUserRole,
                      department: editUserDept || undefined,
                      department_code: deptCode || undefined,
                    } as any);
                    const usersList = await usersAPI.getAll();
                    onUsersRefresh(usersList);
                    setEditUserOpen(false);
                    toast.success('用户信息已更新');
                  } catch (e: any) {
                    toast.error(e.message || '更新失败');
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition active:scale-95"
              >
                保存更改
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
