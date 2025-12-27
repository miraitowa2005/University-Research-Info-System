
import React from 'react';
import { User } from '../types';
import { LayoutDashboard, FileText, Upload, Users, UserCog, Bell, BarChart3, LogOut, ClipboardList, Calendar, Database, Activity, Shield, FolderTree, Sliders, CheckCircle } from 'lucide-react';

interface Props {
  user: User;
  activeView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<Props> = ({ user, activeView, onViewChange, onLogout }) => {
  
  const getNavItems = () => {
    switch (user.role) {
      case 'teacher':
        return [
          { id: 'account', label: '个人中心', icon: UserCog },
          { id: 'my_research', label: '我的科研', icon: FileText },
          { id: 'apply', label: '项目申报', icon: Upload },
          { id: 'calendar', label: '科研日历', icon: Calendar },
          { id: 'export', label: '数据导出', icon: Database },
        ];
      case 'research_admin':
        return [
          { id: 'dashboard', label: '工作台', icon: LayoutDashboard },
          { id: 'audit', label: '科研审核', icon: CheckCircle },
          { id: 'stats', label: '统计报表', icon: BarChart3 },
          { id: 'publish', label: '发布通知', icon: Bell },
          { id: 'templates', label: '审核模板', icon: FileText },
        ];
      case 'sys_admin':
        return [
          { id: 'sys_health', label: '系统监控', icon: Activity },
          { id: 'users', label: '用户管理', icon: Users },
          { id: 'sys_roles', label: '角色权限', icon: Shield },
          { id: 'logs', label: '操作审计', icon: ClipboardList },
          { id: 'sys_mdm', label: '主数据', icon: FolderTree },
          { id: 'config', label: '参数配置', icon: Sliders },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const getRoleName = (role: string) => {
    switch(role) {
      case 'teacher': return '教师';
      case 'research_admin': return '科研管理员';
      case 'sys_admin': return '系统管理员';
      default: return role;
    }
  };

  return (
    <div className="w-64 bg-[#0f172a] min-h-screen text-slate-300 flex flex-col shadow-2xl relative z-40">
      <div className="p-6 border-b border-slate-800/50">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-indigo-500/20">
            UR
          </div>
          <div>
            <h1 className="font-bold text-lg text-white leading-tight tracking-wide">科研管理系统</h1>
            <p className="text-xs text-slate-500">Research System</p>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-slate-800/50 bg-slate-900/30">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-full bg-slate-700/50 flex items-center justify-center border border-slate-600/50 text-white">
             {user.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-slate-200 truncate">{user.name}</p>
            <p className="text-xs text-slate-500 truncate">{getRoleName(user.role)}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1.5">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group relative ${
                isActive 
                  ? 'bg-gradient-to-r from-indigo-600/90 to-blue-600/90 text-white shadow-md shadow-indigo-900/20' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <item.icon className={`h-5 w-5 transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
              <span className="text-sm font-medium tracking-wide">{item.label}</span>
              
              {isActive && <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white/40 shadow-sm"></div>}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800/50">
        <button 
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-sm font-medium">退出登录</span>
        </button>
      </div>
    </div>
  );
};

// Helper icon for this file
const CheckCircleIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);
