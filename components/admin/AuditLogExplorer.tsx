import React, { useState, useMemo } from 'react';
import { AuditLog } from '../../types';
import { Activity, Database, UserCog, AlertOctagon, ShieldCheck, Search, Calendar, ChevronDown, Download, FileDiff } from 'lucide-react';

const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 'log_001', timestamp: '2024-03-15 14:23:05', operatorName: 'admin', ip: '10.20.1.5', action: 'UPDATE_ROLE_PERM', targetId: 'role_research_admin', diff: { oldValue: { permissions: ['view_reports', 'export_data'] }, newValue: { permissions: ['view_reports', 'export_data', 'audit_projects'] } } },
  { id: 'log_002', timestamp: '2024-03-15 11:05:22', operatorName: 'zhang_san', ip: '192.168.1.102', action: 'LOGIN_SUCCESS', targetId: 'session_xj82' },
  { id: 'log_003', timestamp: '2024-03-14 16:45:00', operatorName: 'sys_monitor', ip: '127.0.0.1', action: 'SYSTEM_BACKUP', targetId: 'backup_20240314.zip' },
  { id: 'log_004', timestamp: '2024-03-14 09:12:33', operatorName: 'admin', ip: '10.20.1.5', action: 'DELETE_USER', targetId: 'user_temp_01', diff: { oldValue: { id: 'user_temp_01', name: 'Temporary User', role: 'guest' }, newValue: null } },
  { id: 'log_005', timestamp: '2024-03-13 15:30:11', operatorName: 'li_si', ip: '192.168.1.105', action: 'SUBMIT_PROJECT', targetId: 'proj_2024_005', diff: { oldValue: { status: 'draft' }, newValue: { status: 'pending_review', submitTime: '2024-03-13T15:30:11Z' } } },
  { id: 'log_006', timestamp: '2024-03-13 10:00:00', operatorName: 'admin', ip: '10.20.1.5', action: 'UPDATE_CONFIG', targetId: 'sys_config', diff: { oldValue: { max_upload_size: '50MB', maintenance_mode: false }, newValue: { max_upload_size: '100MB', maintenance_mode: false } } },
];

export const AuditLogExplorer = () => {
  const [logs, setLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const stats = useMemo(
    () => ({
      total: logs.length,
      today: logs.filter(l => new Date(l.timestamp).getDate() === new Date().getDate()).length,
      users: new Set(logs.map(l => l.operatorName)).size,
      anomalies: logs.filter(l => l.action.includes('删除') || l.action.includes('DELETE')).length,
    }),
    [logs]
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase">总审计条目</div>
            <div className="text-2xl font-black text-slate-800">{stats.total}</div>
          </div>
          <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
            <Database className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify之间">
          <div>
            <div className="text-xs font-bold text-emerald-600 uppercase">今日活动</div>
            <div className="text-2xl font-black text-emerald-700">+{stats.today}</div>
          </div>
          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
            <Activity className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items中心 justify之间">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase">活跃操作人</div>
            <div className="text-2xl font-black text-indigo-600">{stats.users}</div>
          </div>
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <UserCog className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-red-100 shadow-sm flex items中心 justify之间">
          <div>
            <div className="text-xs font-bold text-red-500 uppercase">敏感/删除操作</div>
            <div className="text-2xl font-black text-red-600">{stats.anomalies}</div>
          </div>
          <div className="p-2 bg-red-50 rounded-lg text-red-600">
            <AlertOctagon className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2 items-center text-sm font-bold text-slate-700">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            操作溯源日志
          </div>
          <div className="flex flex-1 max-w-2xl gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="检索操作人、IP地址或行为关键词..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm transition-all" />
            </div>
            <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>近 7 天</span>
              <ChevronDown className="w-3 h-3 ml-1 text-slate-400" />
            </div>
            <button className="flex items-center px-4 py-2 bg白 border border-slate-300 text-slate-700 font-bold rounded-lg text-sm hover:bg-slate-50 transition shadow-sm">
              <Download className="w-4 h-4 mr-2" /> 导出报告
            </button>
          </div>
        </div>

        <div className="h-16 bg-slate-900 border-b border-slate-800 flex items-end px-4 gap-1 pt-4 relative overflow-hidden">
          <div className="absolute top-2 left-4 text-[10px] font-mono text-slate-500">ACTIVITY DENSITY (24H)</div>
          {[...Array(60)].map((_, i) => {
            const height = Math.random() * 80 + 10;
            const isActive = Math.random() > 0.8;
            return <div key={i} className={`flex-1 rounded-t-sm transition-all duration-500 hover:opacity-100 ${isActive ? 'bg-indigo-500 opacity-80' : 'bg-slate-700 opacity-30'}`} style={{ height: `${height}%` }}></div>;
          })}
        </div>

        <div className="flex-1 overflow-auto bg-slate-50">
          <div className="min-w-full divide-y divide-slate-200">
            <div className="flex bg-white text-xs font-bold text-slate-500 uppercase tracking-wider py-3 px-6 border-b border-slate-200">
              <div className="w-48">时间戳</div>
              <div className="w-40">操作人</div>
              <div className="w-32">IP 来源</div>
              <div className="flex-1">行为动作</div>
              <div className="w-24 text-right">状态</div>
            </div>
            {logs.map(log => {
              const isExpanded = expandedLogId === log.id;
              const isDelete = log.action.includes('删除') || log.action.includes('DELETE');
              return (
                <div key={log.id} className="group bg白 transition-colors hover:bg-indigo-50/30">
                  <div className={`flex items-center py-4 px-6 cursor-pointer ${isExpanded ? 'bg-indigo-50/50' : ''}`} onClick={() => setExpandedLogId(isExpanded ? null : log.id)}>
                    <div className="w-48 text-xs font-mono text-slate-500 flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-3 ${isDelete ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                      {log.timestamp}
                    </div>
                    <div className="w-40 text-sm font-bold text-slate-800 flex items-center">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-500 mr-2 border border-slate-200">{log.operatorName.charAt(0)}</div>
                      {log.operatorName}
                    </div>
                    <div className="w-32 text-xs font-mono text-slate-500">{log.ip}</div>
                    <div className="flex-1 text-sm font-medium text-slate-700 flex items-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold mr-2 border ${isDelete ? 'bg-red-50 text-red-700 border-red-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>{isDelete ? 'DELETE' : 'UPDATE'}</span>
                      {log.action} <span className="text-slate-400 mx-2">on</span> <span className="font-mono text-slate-500 text-xs">ID:{log.targetId}</span>
                    </div>
                    <div className="w-24 text-right">
                      {log.diff ? <span className="text-xs font-bold text-indigo-600 flex items-center justify-end group-hover:underline"><FileDiff className="w-3 h-3 mr-1" /> 查看详情</span> : <span className="text-xs text-slate-300">无变更</span>}
                    </div>
                  </div>
                  {isExpanded && log.diff && (
                    <div className="px-6 pb-6 pt-0 bg-indigo-50/50 border-b border-indigo-100 animate-in slide-in-from-top-2 duration-200">
                      <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs overflow-hidden shadow-inner border border-slate-800">
                        <div className="flex justify-between text-slate-400 mb-2 border-b border-slate-700 pb-2">
                          <span>CHANGE LOG VISUALIZER</span>
                          <span>JSON FORMAT</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="relative">
                            <div className="text-red-400 font-bold mb-1 opacity-70">--- BEFORE</div>
                            <pre className="text-red-300 opacity-90 overflow-auto max-h-60">{JSON.stringify(log.diff?.oldValue || {}, null, 2)}</pre>
                          </div>
                          <div className="relative border-l border-slate-700 pl-4">
                            <div className="text-emerald-400 font-bold mb-1 opacity-70">+++ AFTER</div>
                            <pre className="text-emerald-300 opacity-90 overflow-auto max-h-60">{JSON.stringify(log.diff?.newValue || {}, null, 2)}</pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

