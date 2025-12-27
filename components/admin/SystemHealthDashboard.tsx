import React, { useState, useEffect } from 'react';
import { SystemHealth } from '../../types';
import { INITIAL_HEALTH } from '../../logic/compiler';
import { Activity, Server, Database, HardDrive, Cpu, Zap, Terminal, Clock, RefreshCw, ShieldCheck } from 'lucide-react';

export const SystemHealthDashboard = () => {
  const [healthData, setHealthData] = useState<SystemHealth[]>(INITIAL_HEALTH);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    '[INFO] System monitor initialized...',
    '[INFO] Connecting to telemetry service... OK',
    '[INFO] Database connection pool: 5/20 active',
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      const events = [
        `[INFO] GET /api/v1/research/list - 200 OK (${Math.floor(Math.random() * 50 + 20)}ms)`,
        `[DEBUG] Worker_01 processing batch job...`,
        `[INFO] Health check: All services operational`,
        `[WARN] API latency slight increase detected`,
      ];
      const newLog = `${new Date().toLocaleTimeString()} ${events[Math.floor(Math.random() * events.length)]}`;
      setLogs(prev => [newLog, ...prev].slice(0, 6));
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const refreshHealth = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  const Waveform = ({ color }: { color: string }) => (
    <div className="flex items-end gap-1 h-8 mt-2">
      {[...Array(12)].map((_, i) => (
        <div key={i} className={`w-1.5 rounded-sm ${color} transition-all duration-500 ease-in-out`} style={{ height: `${Math.random() * 80 + 20}%`, opacity: 0.6 + i / 20 }} />
      ))}
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-end bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">System Operational</span>
          </div>
          <h2 className="text-2xl font-black text-slate-800">系统运行监控中心</h2>
          <p className="text-slate-500 text-sm mt-1 flex items-center">
            <Clock className="w-3 h-3 mr-1" /> 上次更新: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <button onClick={refreshHealth} className={`flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition shadow-sm ${isRefreshing ? 'opacity-70 cursor-wait' : ''}`}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? '刷新中...' : '刷新状态'}
          </button>
          <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition">
            <ShieldCheck className="w-4 h-4 mr-2" /> 安全审计
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap className="w-16 h-16 text-amber-500" />
          </div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Normal</span>
          </div>
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">API 响应延迟</h3>
          <div className="text-3xl font-black text-slate-800 mt-1">
            45<span className="text-sm font-medium text-slate-400 ml-1">ms</span>
          </div>
          <Waveform color="bg-amber-400" />
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Database className="w-16 h-16 text-blue-500" />
          </div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Server className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Active</span>
          </div>
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">数据库连接</h3>
          <div className="text-3xl font-black text-slate-800 mt-1">
            128<span className="text-sm font-medium text-slate-400 ml-1">/ 500</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: '25%' }}></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <HardDrive className="w-16 h-16 text-purple-500" />
          </div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <HardDrive className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">/data</span>
          </div>
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">磁盘剩余空间</h3>
          <div className="text-3xl font-black text-slate-800 mt-1">
            42%<span className="text-sm font-medium text-slate-400 ml-1">Used</span>
          </div>
          <div className="flex gap-1 mt-4 h-1.5">
            <div className="flex-1 bg-purple-500 rounded-full"></div>
            <div className="flex-1 bg-purple-500 rounded-full"></div>
            <div className="flex-1 bg-purple-200 rounded-full"></div>
            <div className="flex-1 bg-purple-200 rounded-full"></div>
            <div className="flex-1 bg-purple-200 rounded-full"></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Cpu className="w-16 h-16 text-rose-500" />
          </div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Good</span>
          </div>
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">CPU 负载</h3>
          <div className="text-3xl font-black text-slate-800 mt-1">
            12%<span className="text-sm font-medium text-slate-400 ml-1">Avg</span>
          </div>
          <Waveform color="bg-rose-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl p-6 shadow-xl flex flex-col h-64 overflow-hidden relative border border-slate-800">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
            <div className="flex items-center text-slate-400 text-xs font-mono">
              <Terminal className="w-4 h-4 mr-2" /> 实时系统日志 (Live Stream)
            </div>
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500"></div>
            </div>
          </div>
          <div className="flex-1 overflow-y-hidden font-mono text-xs text-green-400 space-y-1.5 opacity-90">
            {logs.map((log, i) => (
              <div key={i} className="truncate animate-in slide-in-from-left-2 duration-300">
                <span className="text-slate-500 mr-2">$</span>
                {log}
              </div>
            ))}
            <div className="w-2 h-4 bg-green-500 animate-pulse mt-1 inline-block"></div>
          </div>
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-slate-900/10 bg-[length:100%_4px] opacity-10"></div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"></div>
      </div>
    </div>
  );
};

