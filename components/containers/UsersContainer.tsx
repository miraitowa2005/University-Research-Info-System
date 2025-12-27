import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { usersAPI, departmentAPI } from '../../logic/api';
import { toast } from 'react-toastify';
import { Role, User } from '../../types';

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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索用户..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="block w-full h-10 pl-9 pr-4 rounded-lg bg-white border border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all text-sm"
          />
        </div>
        {currentUser?.role === 'sys_admin' && (
          <>
            <div className="ml-2 flex items-center">
              <span className="text-xs text-gray-500 mr-2">删除保护</span>
              <button
                onClick={() => setDeleteUserArmed((v) => !v)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  deleteUserArmed ? 'bg-red-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    deleteUserArmed ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <button
              onClick={async () => {
                try {
                  const email = `user${Date.now()}@demo.com`;
                  await usersAPI.create({ email, password: '123456', full_name: `新用户${Date.now()}`, role: 'teacher' });
                  const usersList = await usersAPI.getAll();
                  onUsersRefresh(usersList);
                  toast.success('已添加用户');
                } catch (e: any) {
                  toast.error(e.message || '添加失败');
                }
              }}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
            >
              添加用户
            </button>
          </>
        )}
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">姓名</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">角色</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">部门/学院</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">邮箱</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users
            .filter((u) => !q || u.name?.includes(q) || u.email?.includes(q))
            .map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{u.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {u.role === 'teacher' ? '教师' : u.role === 'research_admin' ? '科研管理员' : '系统管理员'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{u.department || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">{u.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {currentUser?.role === 'sys_admin' ? (
                    <>
                      <button
                        onClick={() => {
                          setEditUserId(String(u.id));
                          setEditUserName(u.name || '');
                          setEditUserEmail(u.email || '');
                          setEditUserDept(u.department || '');
                          setEditUserRole(u.role as Role);
                          setEditUserOpen(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        编辑
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            if (!deleteUserArmed) {
                              toast.error('请先开启删除保护开关');
                              return;
                            }
                            await usersAPI.delete(String(u.id));
                            const usersList = await usersAPI.getAll();
                            onUsersRefresh(usersList);
                            setDeleteUserArmed(false);
                            toast.success('已删除用户');
                          } catch (e: any) {
                            toast.error(e.message || '删除失败');
                          }
                        }}
                        className="text-red-600 hover:text-red-900 ml-3"
                      >
                        删除
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-gray-400">仅系统管理员可操作</span>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {editUserOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-lg">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h4 className="text-sm font-semibold text-gray-900">编辑用户</h4>
              <button onClick={() => setEditUserOpen(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">姓名</label>
                <input value={editUserName} onChange={(e) => setEditUserName(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">邮箱</label>
                <input type="email" value={editUserEmail} onChange={(e) => setEditUserEmail(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">学院/部门</label>
                <input value={editUserDept} onChange={(e) => setEditUserDept(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="例如：计算机学院" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">角色身份</label>
                <select value={editUserRole} onChange={(e) => setEditUserRole(e.target.value as Role)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                  <option value="teacher">教师</option>
                  <option value="research_admin">科研管理员</option>
                  <option value="sys_admin">系统管理员</option>
                </select>
              </div>
            </div>
            <div className="p-4 flex justify-end gap-2 border-t border-gray-200">
              <button onClick={() => setEditUserOpen(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm">取消</button>
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
                    toast.success('已更新用户信息');
                  } catch (e: any) {
                    toast.error(e.message || '更新失败');
                  }
                }}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

