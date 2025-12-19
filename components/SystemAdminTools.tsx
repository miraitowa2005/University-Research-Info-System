
import React, { useState } from 'react';
import { 
  SystemHealth, SysRole, Permission, SystemSetting, Department, AuditLog 
} from '../types';
import { 
  INITIAL_HEALTH, INITIAL_ROLES, INITIAL_PERMISSIONS, INITIAL_SETTINGS, INITIAL_DEPARTMENTS, INITIAL_LOGS 
} from '../logic/compiler';
import { 
  Activity, Server, Database, AlertTriangle, CheckCircle, Save, RotateCcw, 
  Shield, UserCog, List, Trash2, Plus, Edit2, Archive, Settings, FolderTree, 
  Search, Eye, FileJson 
} from 'lucide-react';

/**
 * 1. System Health Monitor Dashboard
 */
export const SystemHealthDashboard = () => {
  const [healthData, setHealthData] = useState<SystemHealth[]>(INITIAL_HEALTH);

  const refreshHealth = () => {
    // Simulate refresh
    const newData = healthData.map(h => ({ ...h, checkedAt: 'Just now' }));
    setHealthData(newData);
    alert('系统状态已刷新');
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'ok': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBg = (status: string) => {
    switch(status) {
      case 'ok': return 'bg-green-50 border-green-100';
      case 'warning': return 'bg-yellow-50 border-yellow-100';
      case 'error': return 'bg-red-50 border-red-100';
      default: return 'bg-gray-50 border-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900 flex items-center">
          <Server className="w-5 h-5 mr-2 text-indigo-600"/> 系统健康监控
        </h3>
        <div className="space-x-2">
           <button className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">查看备份记录</button>
           <button onClick={refreshHealth} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">立即刷新</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {healthData.map(item => (
          <div key={item.id} className={`p-4 rounded-xl border shadow-sm ${getStatusBg(item.status)}`}>
            <div className="flex justify-between items-start mb-2">
              <div className="font-semibold text-gray-800">{item.checkType}</div>
              {getStatusIcon(item.status)}
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{item.metric || '-'}</div>
            <div className="text-sm text-gray-600 truncate" title={item.message}>{item.message}</div>
            <div className="text-xs text-gray-400 mt-3">更新于: {item.checkedAt}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h4 className="font-bold text-gray-900 mb-4">系统维护操作</h4>
        <div className="flex gap-4">
          <button className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition">
             <Database className="w-4 h-4 mr-2"/> 立即全量备份
          </button>
          <button className="flex items-center px-4 py-2 bg-orange-50 text-orange-700 rounded-lg border border-orange-100 hover:bg-orange-100 transition">
             <Trash2 className="w-4 h-4 mr-2"/> 清理过期缓存
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * 2. RBAC Role Manager
 */
export const RolePermissionManager = () => {
  const [roles] = useState<SysRole[]>(INITIAL_ROLES);
  const [selectedRole, setSelectedRole] = useState<SysRole>(INITIAL_ROLES[0]);
  const [permissions] = useState<Permission[]>(INITIAL_PERMISSIONS);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
      {/* Role List */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-900">角色列表</h3>
          <button className="p-1 hover:bg-gray-100 rounded"><Plus className="w-4 h-4 text-gray-600"/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {roles.map(role => (
            <div 
              key={role.id}
              onClick={() => setSelectedRole(role)}
              className={`p-3 rounded-lg cursor-pointer flex justify-between items-center transition ${selectedRole.id === role.id ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50 text-gray-700'}`}
            >
              <div>
                <div className="font-medium">{role.name}</div>
                <div className="text-xs opacity-70">{role.isSystem ? '系统预置' : '自定义'}</div>
              </div>
              <Shield className="w-4 h-4 opacity-50"/>
            </div>
          ))}
        </div>
      </div>

      {/* Permission Matrix */}
      <div className="md:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col">
        <div className="p-6 border-b border-gray-100">
           <div className="flex justify-between items-start">
             <div>
               <h3 className="text-lg font-bold text-gray-900">{selectedRole.name}</h3>
               <p className="text-sm text-gray-500 mt-1">{selectedRole.description}</p>
             </div>
             <div className="space-x-2">
                <button className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700">保存权限</button>
                {!selectedRole.isSystem && <button className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50">删除角色</button>}
             </div>
           </div>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
          <h4 className="text-sm font-bold text-gray-500 uppercase mb-4">权限分配</h4>
          <div className="grid grid-cols-2 gap-4">
            {['System', 'Research'].map(module => (
              <div key={module} className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-bold text-gray-800 mb-3">{module === 'System' ? '系统管理' : '科研管理'}</h5>
                <div className="space-y-2">
                  {permissions.filter(p => p.module === module).map(p => (
                    <label key={p.code} className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        defaultChecked={selectedRole.permissions.includes(p.code) || selectedRole.permissions.includes('*')}
                        disabled={selectedRole.permissions.includes('*')}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">{p.name}</span>
                      <span className="text-xs text-gray-400 font-mono">({p.code})</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 3. Enhanced Audit Log Explorer
 */
export const AuditLogExplorer = () => {
  const [logs] = useState<AuditLog[]>(INITIAL_LOGS);
  const [viewingDiff, setViewingDiff] = useState<AuditLog | null>(null);

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"/>
          <input 
            type="text" 
            placeholder="搜索操作人、动作或IP..." 
            className="block w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all text-sm"
          />
        </div>
        <input 
          type="date" 
          className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all"
        />
        <button className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900">查询</button>
      </div>

      {/* Log Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间 / IP</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作人</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">动作 / 对象</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">详情</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map(log => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 font-mono">{log.timestamp}</div>
                  <div className="text-xs text-gray-500">{log.ip}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {log.operatorName}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-indigo-600 font-medium">{log.action}</div>
                  <div className="text-xs text-gray-500">ID: {log.targetId}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  {log.diff && (
                    <button onClick={() => setViewingDiff(log)} className="text-gray-500 hover:text-indigo-600 flex items-center justify-end w-full">
                      <FileJson className="w-4 h-4 mr-1"/> 变更详情
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Diff Modal */}
      {viewingDiff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">操作变更详情</h3>
            <div className="bg-gray-50 rounded border border-gray-200 p-4 font-mono text-xs overflow-auto max-h-96">
               <div className="grid grid-cols-2 gap-4">
                 <div className="border-r border-gray-200 pr-4">
                   <h5 className="text-red-600 font-bold mb-2">变更前 (Old Value)</h5>
                   <pre className="text-gray-600">{JSON.stringify(viewingDiff.diff?.oldValue || {}, null, 2)}</pre>
                 </div>
                 <div>
                   <h5 className="text-green-600 font-bold mb-2">变更后 (New Value)</h5>
                   <pre className="text-gray-600">{JSON.stringify(viewingDiff.diff?.newValue || {}, null, 2)}</pre>
                 </div>
               </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={() => setViewingDiff(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 4. Master Data Manager (Departments)
 */
export const MasterDataManager = () => {
  const [departments] = useState<Department[]>(INITIAL_DEPARTMENTS);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">主数据管理</h3>
          <p className="text-sm text-gray-500">统一管理学院、学科、职称等基础数据。</p>
        </div>
        <div className="flex gap-2">
           <button className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">下载导入模板</button>
           <button className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">添加数据</button>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex text-xs font-semibold text-gray-500 uppercase">
          <div className="w-1/4">编码</div>
          <div className="w-1/2">名称</div>
          <div className="w-1/4 text-right">操作</div>
        </div>
        <div className="divide-y divide-gray-100">
          {departments.map(dept => (
            <div key={dept.id} className="px-6 py-4 flex items-center hover:bg-gray-50">
              <div className="w-1/4 font-mono text-sm text-gray-600">{dept.code}</div>
              <div className="w-1/2 text-sm font-medium text-gray-900 flex items-center">
                 <FolderTree className="w-4 h-4 text-gray-400 mr-2" />
                 {dept.name}
              </div>
              <div className="w-1/4 text-right space-x-3 text-sm">
                <button className="text-indigo-600 hover:text-indigo-900">编辑</button>
                <button className="text-red-600 hover:text-red-900">删除</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * 5. System Configuration Panel
 */
export const SystemSettingsPanel = () => {
  const [settings, setSettings] = useState<SystemSetting[]>(INITIAL_SETTINGS);

  const handleSave = () => {
    alert('配置已保存并生效。');
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <div>
           <h3 className="text-lg font-bold text-gray-900 flex items-center">
             <Settings className="w-5 h-5 mr-2 text-gray-500"/> 系统参数配置
           </h3>
           <p className="text-sm text-gray-500">修改系统运行参数，请谨慎操作。</p>
        </div>
        <button onClick={handleSave} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm">
          <Save className="w-4 h-4 mr-2" /> 保存更改
        </button>
      </div>

      <div className="p-6 space-y-6">
        {settings.map(setting => (
           <div key={setting.key} className="flex items-start pb-6 border-b border-gray-100 last:border-0 last:pb-0">
             <div className="w-1/3 pr-4">
               <label className="block text-sm font-medium text-gray-900">{setting.key}</label>
               <p className="text-xs text-gray-500 mt-1">{setting.description}</p>
             </div>
             <div className="w-2/3">
               {setting.type === 'boolean' ? (
                 <div className="flex items-center h-full">
                    <button 
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${setting.value === 'true' ? 'bg-indigo-600' : 'bg-gray-200'}`}
                      onClick={() => {
                        const newSettings = settings.map(s => s.key === setting.key ? {...s, value: s.value === 'true' ? 'false' : 'true'} : s);
                        setSettings(newSettings);
                      }}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${setting.value === 'true' ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                    <span className="ml-3 text-sm text-gray-600">{setting.value === 'true' ? '已启用' : '已禁用'}</span>
                 </div>
               ) : (
                 <input 
                   type={setting.type === 'number' ? 'number' : 'text'}
                   value={setting.value}
                   onChange={e => {
                     const newSettings = settings.map(s => s.key === setting.key ? {...s, value: e.target.value} : s);
                     setSettings(newSettings);
                   }}
                   className="block w-full max-w-md rounded-lg bg-gray-50 border border-gray-200 text-gray-900 px-3 py-2 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all sm:text-sm"
                 />
               )}
             </div>
           </div>
        ))}
      </div>
    </div>
  );
};
