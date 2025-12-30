import React, { useState, useEffect, useMemo } from 'react';
import { SysRole, Permission } from '../../types';
import { INITIAL_ROLES, INITIAL_PERMISSIONS } from '../../logic/compiler';
import { toast } from 'react-toastify';
import { Fingerprint, Settings, Database, Lock, Unlock, Key, Save, Trash2, Shield } from 'lucide-react';

export const RolePermissionManager = () => {
  const [roles, setRoles] = useState<SysRole[]>(INITIAL_ROLES);
  const [selectedRole, setSelectedRole] = useState<SysRole>(INITIAL_ROLES[0]);
  const [permissions, setPermissions] = useState<Permission[]>(INITIAL_PERMISSIONS);
  const [selectedPerms, setSelectedPerms] = useState<string[]>(INITIAL_ROLES[0].permissions);
  const [deleteArmed, setDeleteArmed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createDesc, setCreateDesc] = useState('');
  const [createPerms, setCreatePerms] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const api = await import('../../logic/api');
        const [ps, rs] = await Promise.all([api.rbacAPI.getPermissions(), api.rbacAPI.listRoles()]);
        setPermissions(ps as any);
        setRoles(rs as any);
        if ((rs as any[]).length > 0) {
          const current = (rs as any[]).find(r => r.id === selectedRole.id) || (rs as any[])[0];
          setSelectedRole(current);
          setSelectedPerms(current.permissions || []);
        }
      } catch {}
    })();
  }, []);

  const handleCreateRole = () => {
    setCreateName('');
    setCreateDesc('');
    setCreatePerms([]);
    setCreateOpen(true);
  };
  const confirmCreateRole = async () => {
    if (!createName.trim()) {
      toast.error('请输入角色名称');
      return;
    }
    try {
      const api = await import('../../logic/api');
      const created = await api.rbacAPI.createRole(createName.trim(), createDesc.trim() || undefined);
      if (createPerms.length > 0) {
        await api.rbacAPI.savePermissions(created.id, createPerms);
      }
      const rs = await api.rbacAPI.listRoles();
      setRoles(rs as any);
      const cur = (rs as any[]).find(r => r.id === created.id) || (rs as any[])[0];
      setSelectedRole(cur);
      setSelectedPerms(cur.permissions || []);
      setCreateOpen(false);
      toast.success('角色与权限已创建');
    } catch (e: any) {
      toast.error(e.message || '创建失败');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const api = await import('../../logic/api');
      await api.rbacAPI.savePermissions(selectedRole.id, selectedPerms);
      const newRoles = roles.map(r => (r.id === selectedRole.id ? { ...r, permissions: selectedPerms } : r));
      setRoles(newRoles);
      toast.success(`[${selectedRole.name}] 权限配置已同步`);
    } catch {
      toast.error('保存失败');
    } finally {
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  const handleDeleteRole = async () => {
    if (!deleteArmed) {
      toast.warning('请先解锁删除保护开关');
      return;
    }
    if (!confirm(`⚠️ 高风险操作\n\n确定要销毁角色【${selectedRole.name}】吗？\n该角色下的所有用户将失去对应权限。`)) return;
    try {
      const api = await import('../../logic/api');
      await api.rbacAPI.deleteRole(selectedRole.id);
      const rs = await api.rbacAPI.listRoles();
      setRoles(rs as any);
      if (rs.length > 0) {
        setSelectedRole(rs[0] as any);
        setSelectedPerms((rs[0] as any).permissions);
      }
      setDeleteArmed(false);
      toast.success('角色已销毁');
    } catch {
      toast.error('删除失败');
    }
  };

  const groupedPermissions = useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    permissions.forEach(p => {
      const mod = p.module || 'Other';
      if (!groups[mod]) groups[mod] = [];
      groups[mod].push(p);
    });
    return groups;
  }, [permissions]);

  const coveragePercent = Math.round((selectedPerms.length / (permissions.length || 1)) * 100);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] min-h-[700px] animate-in fade-in duration-500">
      <div className="w-full lg:w-80 flex flex-col gap-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center">
            <Fingerprint className="w-4 h-4 mr-2" /> 角色身份库
          </h3>
          <button onClick={handleCreateRole} className="p-2 bg-white border border-slate-200 text-indigo-600 rounded-lg hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-sm" title="创建新角色">
            +
          </button>
        </div>
        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
          {roles.map(role => {
            const isActive = selectedRole.id === role.id;
            return (
              <div
                key={role.id}
                onClick={() => {
                  if (isActive) return;
                  setSelectedRole(role);
                  setSelectedPerms(role.permissions || []);
                  setDeleteArmed(false);
                }}
                className={`relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer group overflow-hidden ${
                  isActive ? 'bg-gradient-to-br from-indigo-600 to-blue-700 border-transparent shadow-lg shadow-indigo-500/30 translate-x-1' : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md'
                }`}
              >
                {isActive && <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>}
                <div className="relative flex justify-between items-start">
                  <div>
                    <div className={`text-lg font-bold mb-1 ${isActive ? 'text-white' : 'text-slate-800'}`}>{role.name}</div>
                    <div className={`text-xs flex items-center ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {role.isSystem ? <span className="flex items-center"><Lock className="w-3 h-3 mr-1" /> 系统预置</span> : <span className="flex items-center"><Unlock className="w-3 h-3 mr-1" /> 自定义</span>}
                      <span className="mx-2 opacity-50">|</span>
                      <span>{(role.permissions || []).length} 项权限</span>
                    </div>
                  </div>
                  {isActive && (
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <Key className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-slate-900">{selectedRole.name}</h2>
              {selectedRole.isSystem && <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-bold uppercase rounded tracking-wider">System Locked</span>}
            </div>
            <p className="text-sm text-slate-500 mt-1 max-w-lg truncate">{selectedRole.description || '该角色拥有以下模块的访问与操作权限。'}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-2xl font-black text-indigo-600">{coveragePercent}%</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">权限覆盖率</div>
            </div>
            <div className="w-12 h-12 relative flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-200" />
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-indigo-500 transition-all duration-1000 ease-out" strokeDasharray={125.6} strokeDashoffset={125.6 - (125.6 * coveragePercent) / 100} />
              </svg>
              <Shield className="w-5 h-5 text-indigo-600 absolute" />
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {Object.entries(groupedPermissions as Record<string, Permission[]>).map(([module, perms]: [string, Permission[]]) => (
              <div key={module} className="bg-slate-50 rounded-2xl border border-slate-100 p-5">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200/60">
                  <div className={`p-1.5 rounded-lg ${module === 'System' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>{module === 'System' ? <Settings className="w-4 h-4" /> : <Database className="w-4 h-4" />}</div>
                  <h4 className="font-bold text-slate-700">{module === 'System' ? '系统核心模块' : module === 'Research' ? '科研业务模块' : '其他模块'}</h4>
                </div>
                <div className="space-y-3">
                  {perms.map((p: Permission) => {
                    const isGranted = selectedPerms.includes(p.code);
                    return (
                      <label key={p.code} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all duration-200 ${isGranted ? 'bg-white border-indigo-200 shadow-sm' : 'bg-transparent border-transparent hover:bg-slate-100'}`}>
                        <div className="flex flex-col">
                          <span className={`text-sm font-bold ${isGranted ? 'text-slate-800' : 'text-slate-500'}`}>{p.name}</span>
                          <span className="text-[10px] font-mono text-slate-400 mt-0.5">{p.code}</span>
                        </div>
                        <div className="relative">
                          <input type="checkbox" className="sr-only" checked={isGranted} onChange={e => setSelectedPerms(prev => (e.target.checked ? [...prev, p.code] : prev.filter(x => x !== p.code)))} />
                          <div className={`w-11 h-6 rounded-full transition-colors duration-300 ${isGranted ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                          <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${isGranted ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 bg-white flex justify-between items-center">
          <div className="flex items-center">
            {!selectedRole.isSystem && (
              <div className="flex items-center gap-3 bg-red-50 px-4 py-2 rounded-xl border border-red-100">
                <div className="flex items-center gap-2">
                  <div onClick={() => setDeleteArmed(!deleteArmed)} className={`w-8 h-5 rounded-full cursor-pointer transition-colors relative ${deleteArmed ? 'bg-red-500' : 'bg-slate-300'}`}>
                    <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${deleteArmed ? 'translate-x-3' : 'translate-x-0'}`}></div>
                  </div>
                  <span className="text-xs font-bold text-red-700">解锁删除</span>
                </div>
                {deleteArmed && (
                  <button onClick={handleDeleteRole} className="p-1.5 bg-white text-red-600 rounded-lg shadow-sm border border-red-100 hover:bg-red-600 hover:text-white transition-colors" title="确认销毁">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
          <button onClick={handleSave} disabled={isSaving} className={`flex items-center px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 ${isSaving ? 'bg-indigo-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30'}`}>
            {isSaving ? <>正在同步...</> : (<><Save className="w-5 h-5 mr-2" /> 保存权限配置</>)}
          </button>
        </div>
      </div>
      {createOpen && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-3xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h4 className="text-sm font-bold text-slate-700">创建新角色</h4>
              <button onClick={() => setCreateOpen(false)} className="text-slate-500 hover:text-slate-800">×</button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <div className="space-y-3">
                  <input value={createName} onChange={e => setCreateName(e.target.value)} placeholder="角色名称" className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm" />
                  <textarea value={createDesc} onChange={e => setCreateDesc(e.target.value)} placeholder="角色说明（可选）" rows={4} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm" />
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="text-xs font-bold text-slate-500 mb-2">选择权限</div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-80 overflow-auto custom-scrollbar">
                  {Object.entries(groupedPermissions as Record<string, Permission[]>).map(([module, perms]: [string, Permission[]]) => (
                    <div key={module} className="bg-slate-50 rounded-xl border border-slate-100 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1 rounded ${module === 'System' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>{module === 'System' ? <Settings className="w-3 h-3" /> : <Database className="w-3 h-3" />}</div>
                        <div className="text-xs font-bold text-slate-700">{module}</div>
                      </div>
                      <div className="space-y-2">
                        {perms.map(p => {
                          const checked = createPerms.includes(p.code);
                          return (
                            <label key={p.code} className="flex items-center justify-between p-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 cursor-pointer">
                              <div>
                                <div className="text-xs font-bold text-slate-700">{p.name}</div>
                                <div className="text-[10px] font-mono text-slate-400">{p.code}</div>
                              </div>
                              <input type="checkbox" checked={checked} onChange={e => setCreatePerms(prev => (e.target.checked ? [...prev, p.code] : prev.filter(x => x !== p.code)))} />
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end gap-2">
              <button onClick={() => setCreateOpen(false)} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm">取消</button>
              <button onClick={confirmCreateRole} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm">创建</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
