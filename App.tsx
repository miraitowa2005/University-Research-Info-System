
import React, { useState, useEffect } from 'react';
import { User, ResearchItem, ResearchCategory, AuditLog, Role } from './types';
import { RESEARCH_CATEGORIES, RESEARCH_SUBTYPES } from './logic/compiler'; 
import { authAPI, researchAPI, usersAPI, logsAPI } from './logic/api';
import { Sidebar } from './components/LogViewer'; 
import { ResearchTable, getResearchMaskingStatus } from './components/QuadTable'; 
import { StatsOverview } from './components/TreeVisualizer'; 
import { DynamicForm } from './components/DynamicForm';
import { AcademicProfile } from './components/AcademicProfile';
import { ProjectLifecycleManager, TagManager, CustomReportBuilder } from './components/EnhancedAdminTools';
import BatchReviewModal from './components/BatchReviewModal';
import { ResearchCalendar, DataExportCenter } from './components/TeacherTools';
import ReviewTemplatesManager from './components/ReviewTemplatesManager';
import { SystemHealthDashboard, RolePermissionManager, AuditLogExplorer, MasterDataManager, SystemSettingsPanel } from './components/SystemAdminTools';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  Plus, Search, User as UserIcon, LogIn, Briefcase, Settings, FileText, 
  X, Check, Clock, AlertCircle, Shield, LayoutDashboard, ClipboardList, 
  ChevronRight, BarChart3, Bell, Download, CheckCircle, Tag, Layers, Database,
  Lock, Mail, GraduationCap, Zap, Globe, Cpu, Hexagon, Sparkles
} from 'lucide-react';
import FilterBar, { Filters } from './components/FilterBar';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // App State
  const [researchData, setResearchData] = useState<ResearchItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);

  // Filters
  const [filters, setFilters] = useState<Filters>({ status: 'all', category: 'all' });
  
  // Fetch all data when user logs in
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        // Fetch research data
        const research = await researchAPI.getAll();
        setResearchData(research);
        
        // Fetch users (for admin roles)
        if (currentUser.role === 'research_admin' || currentUser.role === 'system_admin') {
          const usersList = await usersAPI.getAll();
          setUsers(usersList);
        }
        
        // Fetch logs
        const logsList = await logsAPI.getAll();
        setLogs(logsList);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('获取数据失败');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser]);
  
  // Selection State for Batch Operations
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modal State
  const [selectedItem, setSelectedItem] = useState<ResearchItem | null>(null);
  const [batchOpen, setBatchOpen] = useState(false);
  const [batchDefaultAction, setBatchDefaultAction] = useState<'Approved' | 'Rejected'>('Approved');

  // Helper: Add Log
  const addLog = (action: string, targetId: string) => {
    if (!currentUser) return;
    const newLog: AuditLog = {
      id: `l${Date.now()}`,
      operatorName: currentUser.name,
      action: action,
      targetId: targetId,
      timestamp: new Date().toLocaleString()
    };
    setLogs(prev => [newLog, ...prev]);
  };
  
  // Login Handler
  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authAPI.login(email, password);
      localStorage.setItem('token', response.token);
      setCurrentUser(response.user);
      
      // Route to default view based on Role
      if (response.user.role === 'teacher') setActiveView('profile'); 
      else if (response.user.role === 'research_admin') setActiveView('dashboard'); 
      else setActiveView('sys_health'); 
      
      // Reset register screen state
      setShowRegister(false);
      toast.success('登录成功');
    } catch (error: any) {
      console.error('Login failed:', error);
      toast.error(error.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  // Register Handler
  const handleRegister = async (userData: Omit<User, 'id' | 'created_at'>) => {
    setLoading(true);
    try {
      const response = await authAPI.register(userData);
      localStorage.setItem('token', response.token);
      setCurrentUser(response.user);
      
      // Route to default view based on Role
      if (response.user.role === 'teacher') setActiveView('profile'); 
      else if (response.user.role === 'research_admin') setActiveView('dashboard'); 
      else setActiveView('sys_health'); 
      
      toast.success('注册成功');
    } catch (error: any) {
      console.error('Register failed:', error);
      toast.error(error.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  // Actions
  const handleApprove = async (id: string) => {
    if (!currentUser) return;
    setLoading(true);
    try {
      await researchAPI.updateStatus(id, 'approved', currentUser.name);
      const research = await researchAPI.getAll();
      setResearchData(research);
      const logsList = await logsAPI.getAll();
      setLogs(logsList);
      toast.success('审核通过');
    } catch (error: any) {
      console.error('Approve failed:', error);
      toast.error(error.message || '审核失败');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    if (!currentUser) return;
    setLoading(true);
    try {
      await researchAPI.updateStatus(id, 'Rejected', currentUser.name);
      // Refresh research data
      const research = await researchAPI.getAll();
      setResearchData(research);
      // Refresh logs
      const logsList = await logsAPI.getAll();
      setLogs(logsList);
      toast.success('驳回成功');
    } catch (error: any) {
      console.error('Reject failed:', error);
      toast.error(error.message || '驳回失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!currentUser) return;
    setLoading(true);
    try {
      await researchAPI.delete(id, currentUser.name);
      // Refresh research data
      const research = await researchAPI.getAll();
      setResearchData(research);
      // Refresh logs
      const logsList = await logsAPI.getAll();
      setLogs(logsList);
      toast.success('删除成功');
    } catch (error: any) {
      console.error('Delete failed:', error);
      toast.error(error.message || '删除失败');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmitDraft = async (id: string) => {
    if (!currentUser) return;
    setLoading(true);
    try {
      await researchAPI.updateStatus(id, 'Pending', currentUser.name);
      // Refresh research data
      const research = await researchAPI.getAll();
      setResearchData(research);
      // Refresh logs
      const logsList = await logsAPI.getAll();
      setLogs(logsList);
      toast.success('提交审核成功');
    } catch (error: any) {
      console.error('Submit draft failed:', error);
      toast.error(error.message || '提交审核失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddResearch = async (newItem: ResearchItem) => {
    setLoading(true);
    try {
      await researchAPI.create(newItem);
      // Refresh research data
      const research = await researchAPI.getAll();
      setResearchData(research);
      // Refresh logs
      const logsList = await logsAPI.getAll();
      setLogs(logsList);
      toast.success('新增成果成功');
    } catch (error: any) {
      console.error('Add research failed:', error);
      toast.error(error.message || '新增成果失败');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchApprove = async () => {
    if (!currentUser) return;
    if (window.confirm(`确定要批量通过选中的 ${selectedIds.length} 项成果吗？`)) {
      setLoading(true);
      try {
        await researchAPI.batchUpdateStatus(selectedIds, 'Approved', currentUser.name);
        // Refresh research data
        const research = await researchAPI.getAll();
        setResearchData(research);
        // Refresh logs
        const logsList = await logsAPI.getAll();
        setLogs(logsList);
        setSelectedIds([]);
        toast.success(`批量通过 ${selectedIds.length} 项成果`);
      } catch (error: any) {
        console.error('Batch approve failed:', error);
        toast.error(error.message || '批量操作失败');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBatchReject = async () => {
    if (!currentUser) return;
    if (window.confirm(`确定要批量驳回选中的 ${selectedIds.length} 项成果吗？`)) {
      setLoading(true);
      try {
        await researchAPI.batchUpdateStatus(selectedIds, 'Rejected', currentUser.name);
        // Refresh research data
        const research = await researchAPI.getAll();
        setResearchData(research);
        // Refresh logs
        const logsList = await logsAPI.getAll();
        setLogs(logsList);
        setSelectedIds([]);
        toast.success(`批量驳回 ${selectedIds.length} 项成果`);
      } catch (error: any) {
        console.error('Batch reject failed:', error);
        toast.error(error.message || '批量操作失败');
      } finally {
        setLoading(false);
      }
    }
  };

  const updateUserTags = async (userId: string, tags: string[]) => {
    if (!currentUser) return;
    setLoading(true);
    try {
      await usersAPI.updateTags(userId, tags);
      // Refresh users list
      if (currentUser.role === 'research_admin' || currentUser.role === 'system_admin') {
        const usersList = await usersAPI.getAll();
        setUsers(usersList);
      }
      // Refresh logs
      const logsList = await logsAPI.getAll();
      setLogs(logsList);
      toast.success('用户标签更新成功');
    } catch (error: any) {
      console.error('Update user tags failed:', error);
      toast.error(error.message || '更新失败');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = "ID,标题,作者,类别,日期,状态,详情\n";
    const rows = researchData.map(item => 
      `${item.id},"${item.title}","${item.authorName}",${item.category},${item.date},${item.status},"${item.details || ''}"`
    ).join("\n");
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "research_data_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog(`导出全量数据`, 'system');
  };

  // Filter helpers
  const normalizeStatus = (s: any) => String(s || '').toLowerCase();
  const inDateRange = (d?: string, from?: string, to?: string) => {
    if (!d) return true;
    try {
      const t = new Date(d).getTime();
      if (from && t < new Date(from).getTime()) return false;
      if (to && t > new Date(to).getTime()) return false;
      return true;
    } catch { return true; }
  };
  const inFundingRange = (item: ResearchItem, min?: number, max?: number) => {
    const v = (item as any)?.content_json?.funding ?? (item as any)?.content_json?.amount;
    if (typeof v !== 'number') return true;
    if (min !== undefined && v < min) return false;
    if (max !== undefined && v > max) return false;
    return true;
  };
  const applyFilters = (arr: ResearchItem[]) => {
    return arr.filter(i => {
      const s = normalizeStatus(i.status);
      if (filters.status !== 'all' && s !== filters.status) return false;
      if (filters.category !== 'all' && i.category !== filters.category) return false;
      if (!inDateRange(i.date, filters.dateFrom, filters.dateTo)) return false;
      if (!inFundingRange(i, filters.fundingMin, filters.fundingMax)) return false;
      return true;
    });
  };

  // Map view IDs to Chinese titles
  const getViewTitle = (viewId: string) => {
    const map: Record<string, string> = {
      'dashboard': '科研管理驾驶舱',
      'my_research': '我的科研成果',
      'apply': '科研项目申报',
      'profile': '个人学术主页',
      'audit': '科研成果审核',
      'stats': '科研数据统计',
      'publish': '通知公告发布',
      'lifecycle': '项目全流程管理',
      'tags': '数据治理 / 标签管理',
      'reports': '自定义统计报表',
      'users': '系统用户管理',
      'logs': '全链路操作审计',
      'config': '系统参数配置',
      'calendar': '科研日历',
      'export': '数据导出中心',
      'sys_health': '系统健康监控',
      'sys_roles': '角色权限管理',
      'sys_mdm': '主数据管理',
      'templates': '审核意见模板'
    };
    return map[viewId] || viewId;
  };

  if (!currentUser) {
    if (showRegister) {
       return <RegisterScreen onRegister={handleRegister} onBackToLogin={() => setShowRegister(false)} />;
    }
    return <LoginScreen onLogin={handleLogin} onGoToRegister={() => setShowRegister(true)} />;
  }

  // Filter Data Logic
  const myResearch = researchData.filter(item => item.authorId === currentUser.id);
  const pendingResearch = researchData.filter(item => (item.status || '').toLowerCase() === 'pending');

  const filteredMyResearch = applyFilters(myResearch);
  const filteredPending = applyFilters(pendingResearch);
  
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-600 antialiased">
      <Sidebar 
        user={currentUser} 
        activeView={activeView} 
        onViewChange={setActiveView} 
        onLogout={() => setCurrentUser(null)}
      />

      <main className="flex-1 overflow-y-auto relative">
        {/* Sticky Header with Backdrop Blur */}
        <div className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-xl border-b border-slate-200/60 px-4 md:px-8 py-4 mb-8">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                  {getViewTitle(activeView)}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  欢迎回来，{currentUser?.name}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                 {/* Contextual Action Button */}
                 {currentUser?.role === 'teacher' && activeView === 'my_research' && (
                  <button onClick={() => setActiveView('apply')} className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center text-sm font-medium transition shadow-lg shadow-indigo-500/20 active:scale-95">
                    <Plus className="w-4 h-4 mr-2" />
                    新增成果
                  </button>
                )}
                {/* Batch Actions for Admin */}
                {currentUser.role === 'research_admin' && activeView === 'audit' && selectedIds.length > 0 && (
                  <div className="flex gap-2">
                    <button onClick={() => { setBatchDefaultAction('Approved'); setBatchOpen(true); }} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium transition shadow-sm">
                      <CheckCircle className="w-4 h-4 mr-2" /> 批量通过 ({selectedIds.length})
                    </button>
                    <button onClick={() => { setBatchDefaultAction('Rejected'); setBatchOpen(true); }} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium transition shadow-sm">
                       批量驳回
                    </button>
                  </div>
                )}
              </div>
            </div>
         </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12">
          
          {/* Views */}

          {/* RESEARCH ADMIN: Dashboard */}
          {activeView === 'dashboard' && (
            <>
              <FilterBar value={filters} onChange={setFilters} />
              <div className="h-4" />
              <ResearchAdminDashboard data={applyFilters(researchData)} onNavigate={setActiveView} />
            </>
          )}

          {/* RESEARCH ADMIN: Lifecycle Manager */}
          {activeView === 'lifecycle' && (
            <ProjectLifecycleManager />
          )}

           {/* RESEARCH ADMIN: Tag Manager */}
           {activeView === 'tags' && (
            <TagManager users={users} onUpdateUserTags={updateUserTags} />
          )}

          {/* RESEARCH ADMIN: Custom Reports */}
          {activeView === 'reports' && (
            <CustomReportBuilder data={applyFilters(researchData)} />
          )}
          
          {/* TEACHER: My Research */}
          {activeView === 'my_research' && (
            <>
              <FilterBar value={filters} onChange={setFilters} />
              <div className="h-4" />
              <ResearchTable 
                data={filteredMyResearch} 
                currentUser={currentUser}
                onSubmit={handleSubmitDraft}
                onViewDetail={setSelectedItem}
                onExport={handleExportCSV}
              />
            </>
          )}

          {/* TEACHER: Apply (Dynamic Form) */}
          {activeView === 'apply' && (
            <DynamicForm 
              subtypes={RESEARCH_SUBTYPES}
              currentUser={currentUser} 
              onSubmit={(item) => {
                handleAddResearch(item);
                setActiveView('my_research');
              }}
              onCancel={() => setActiveView('my_research')} 
            />
          )}

           {/* TEACHER: Academic Profile */}
           {activeView === 'profile' && (
            <AcademicProfile user={currentUser} researchItems={filteredMyResearch} />
          )}

          {/* TEACHER: Research Calendar */}
          {activeView === 'calendar' && (
            <ResearchCalendar />
          )}

          {/* TEACHER: Data Export Center */}
          {activeView === 'export' && (
            <DataExportCenter user={currentUser} researchItems={filteredMyResearch} />
          )}

          {/* ADMIN: Audit */}
          {activeView === 'audit' && (
            <>
              <FilterBar value={filters} onChange={setFilters} />
              <div className="h-4" />
              <ResearchTable 
                data={filteredPending} 
                currentUser={currentUser} 
                onApprove={handleApprove} 
                onReject={handleReject} 
                onViewDetail={setSelectedItem}
                selectedIds={selectedIds}
                onSelect={(id, checked) => setSelectedIds(prev => checked ? [...prev, id] : prev.filter(x => x !== id))}
                onSelectAll={(checked) => setSelectedIds(checked ? filteredPending.map(i => i.id) : [])}
              />
            </>
          )}

          {/* ADMIN: Stats */}
          {activeView === 'stats' && (
            <StatsOverview data={applyFilters(researchData)} />
          )}

          {/* ADMIN: Publish Notice (Mock) */}
          {activeView === 'publish' && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
               <h3 className="text-lg font-medium mb-4 text-gray-900">发布新通知</h3>
               <div className="mb-4">
                 <label className="block text-sm font-medium text-gray-700 mb-1">通知标题</label>
                 <input 
                   type="text" 
                   className="block w-full rounded-lg bg-gray-50 border border-gray-200 text-gray-900 px-4 py-2.5 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all sm:text-sm" 
                   placeholder="请输入标题..." 
                 />
               </div>
               <div className="mb-4">
                 <label className="block text-sm font-medium text-gray-700 mb-1">通知内容</label>
                 <textarea 
                   className="block w-full rounded-lg bg-gray-50 border border-gray-200 text-gray-900 px-4 py-2.5 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all sm:text-sm" 
                   rows={6} 
                   placeholder="请输入通知正文..."
                 ></textarea>
               </div>
               <div className="flex justify-end">
                 <button className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition font-medium">发布通知</button>
               </div>
            </div>
          )}

          {/* SYS ADMIN: Users */}
          {activeView === 'users' && (
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
               <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                 <div className="relative">
                   <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                   <input 
                     type="text" 
                     placeholder="搜索用户..." 
                     className="block w-full pl-9 pr-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all text-sm" 
                   />
                 </div>
                 <button className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">添加用户</button>
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
                   {users.map(u => (
                     <tr key={u.id} className="hover:bg-gray-50">
                       <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{u.name}</td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                           {u.role === 'teacher' ? '教师' : (u.role === 'research_admin' ? '科研管理员' : '系统管理员')}
                         </span>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-gray-500">{u.department || '-'}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">{u.email}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                         <button className="text-indigo-600 hover:text-indigo-900">编辑</button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          )}

          {/* SYS ADMIN: Health */}
          {activeView === 'sys_health' && <SystemHealthDashboard />}

          {/* SYS ADMIN: Roles */}
          {activeView === 'sys_roles' && <RolePermissionManager />}

          {/* SYS ADMIN: Logs */}
          {activeView === 'logs' && <AuditLogExplorer />}

          {/* SYS ADMIN: MDM */}
          {activeView === 'sys_mdm' && <MasterDataManager />}

          {/* SYS ADMIN: Config */}
          {activeView === 'config' && <SystemSettingsPanel />}

          {/* RESEARCH ADMIN: Review Templates */}
          {activeView === 'templates' && <ReviewTemplatesManager />}

        </div>
      </main>

      {/* Detail Modal */}
      {selectedItem && (
        <ResearchDetailModal 
          item={selectedItem} 
          currentUser={currentUser}
          onClose={() => setSelectedItem(null)} 
        />
      )}

      {/* Batch Review Modal */}
      {currentUser.role === 'research_admin' && (
        <BatchReviewModal
          open={batchOpen}
          onClose={() => setBatchOpen(false)}
          selectedCount={selectedIds.length}
          defaultAction={batchDefaultAction}
          onConfirm={async (action, remarks) => {
            setLoading(true);
            try {
              await researchAPI.batchUpdateStatus(selectedIds, action.toLowerCase(), currentUser.name, remarks);
              const research = await researchAPI.getAll();
              setResearchData(research);
              const logsList = await logsAPI.getAll();
              setLogs(logsList);
              setSelectedIds([]);
              setBatchOpen(false);
              toast.success(`批量${action === 'Approved' ? '通过' : '驳回'}成功`);
            } catch (err: any) {
              console.error('Batch review failed:', err);
              toast.error(err.message || '批量操作失败');
            } finally {
              setLoading(false);
            }
          }}
        />
      )}
      
      {/* Toast Notifications */}
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false} 
        newestOnTop 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
      />
    </div>
  );
}

// Sub-components

const ResearchAdminDashboard = ({ data, onNavigate }: { data: ResearchItem[], onNavigate: (v: string) => void }) => {
  const pendingCount = data.filter(i => (i.status || '').toLowerCase() === 'pending').length;
  const approvedCount = data.filter(i => (i.status || '').toLowerCase() === 'approved').length;
  const totalFunding = data.reduce((acc, item) => acc + ((item as any)?.content_json?.funding ?? (item as any)?.content_json?.amount ?? 0), 0);
  
  // Mock Todos
  const todos = [
    { id: 1, title: '审核新提交的科研项目/论文', count: pendingCount, action: 'audit' },
    { id: 2, title: '即将截止的项目中期检查', count: 3, action: 'midterm' }, // No dedicated view for midterm yet
    { id: 3, title: '国自然预申报即将截止', count: 22, action: 'lifecycle' },
  ];

  return (
     <div className="space-y-6">
       {/* Stats Cards */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <DashboardCard title="待审核项目" value={pendingCount} icon={<Clock className="text-orange-600" />} bg="bg-orange-50" />
          <DashboardCard title="已立项/发表" value={approvedCount} icon={<Check className="text-emerald-600" />} bg="bg-emerald-50" />
          <DashboardCard title="累计经费 (万元)" value={totalFunding} icon={<Briefcase className="text-blue-600" />} bg="bg-blue-50" />
          <DashboardCard title="本周预警" value={2} icon={<AlertCircle className="text-red-600" />} bg="bg-red-50" />
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Todos */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
             <h3 className="font-bold text-gray-900 mb-4 flex items-center">
               <ClipboardList className="w-5 h-5 mr-2 text-indigo-600"/>
               待办事项
             </h3>
             <div className="space-y-3">
               {todos.map(todo => (
                 <div key={todo.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-indigo-50 transition cursor-pointer" onClick={() => todo.action !== 'midterm' && onNavigate(todo.action)}>
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-3 ${todo.count > 0 ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                      <span className="text-gray-700 font-medium">{todo.title}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-900 font-bold mr-2">{todo.count}</span>
                      <span className="text-xs text-gray-500">项</span>
                      <ChevronRight className="w-4 h-4 text-gray-400 ml-2" />
                    </div>
                 </div>
               ))}
               <div className="p-4 text-center text-sm text-gray-400">
                 没有更多待办事项
               </div>
             </div>
          </div>

          {/* Sidebar - Quick Actions */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">快捷入口</h3>
            <div className="grid grid-cols-2 gap-3">
              <QuickActionBtn icon={CheckCircle} label="批量审核" onClick={() => onNavigate('audit')} />
              <QuickActionBtn icon={Bell} label="发布通知" onClick={() => onNavigate('publish')} />
              <QuickActionBtn icon={Layers} label="全周期管理" onClick={() => onNavigate('lifecycle')} />
              <QuickActionBtn icon={Database} label="自定义报表" onClick={() => onNavigate('reports')} />
              <QuickActionBtn icon={Tag} label="标签管理" onClick={() => onNavigate('tags')} />
              <QuickActionBtn icon={Download} label="数据导出" onClick={() => alert('导出功能开发中')} />
            </div>
          </div>
       </div>
       
       {/* Highlights Table */}
       <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-bold text-gray-900">近期亮点成果</h3>
          </div>
          <div className="divide-y divide-gray-100">
             {data.filter(i => (i.status || '').toLowerCase() === 'approved').slice(0, 3).map(item => (
               <div key={item.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition">
                  <div>
                    <div className="font-medium text-gray-900">{item.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{item.authorName} · {item.category}</div>
                  </div>
                  <div className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                    {((item as any)?.content_json?.funding ?? (item as any)?.content_json?.amount) ? `经费 ${((item as any)?.content_json?.funding ?? (item as any)?.content_json?.amount)}万` : '高水平成果'}
                  </div>
               </div>
             ))}
             {data.filter(i => (i.status || '').toLowerCase() === 'approved').length === 0 && (
               <div className="p-8 text-center text-gray-400">暂无通过审核的成果</div>
             )}
          </div>
       </div>
     </div>
  )
};

const DashboardCard = ({ title, value, icon, bg }: any) => (
  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
    <div className={`p-3 rounded-lg ${bg}`}>
      {icon}
    </div>
  </div>
);

const QuickActionBtn = ({ icon: Icon, label, onClick }: any) => (
  <button onClick={onClick} className="flex flex-col items-center justify-center p-4 rounded-lg border border-gray-200 bg-gray-50 hover:bg-white hover:border-indigo-200 hover:shadow-sm transition group">
    <Icon className="w-6 h-6 text-gray-500 group-hover:text-indigo-600 mb-2" />
    <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900">{label}</span>
  </button>
);

// --- AUTH COMPONENTS ---

const LoginScreen = ({ onLogin, onGoToRegister }: { onLogin: (email: string, password: string) => Promise<void>, onGoToRegister: () => void }) => {
  const [email, setEmail] = useState('chen@univ.edu.cn');
  const [password, setPassword] = useState('123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onLogin(email, password);
    } catch (err: any) {
      setError(err.message || '登录失败，请检查邮箱和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Left Hero Section */}
      <div className="hidden lg:flex lg:w-5/12 bg-[#0B1120] relative overflow-hidden flex-col justify-between p-12 text-white">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
             {/* Grid Pattern */}
             <div className="absolute inset-0" style={{ 
                 backgroundImage: 'radial-gradient(rgba(99, 102, 241, 0.15) 1px, transparent 1px)', 
                 backgroundSize: '32px 32px' 
             }}></div>
             {/* Gradient Glows */}
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
             <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 mt-10">
           <div className="flex items-center space-x-3 mb-8">
             <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
               <Hexagon className="text-white w-6 h-6 fill-indigo-500/20" />
             </div>
             <span className="text-xl font-bold tracking-wide">UR System</span>
           </div>
           
           <h1 className="text-5xl font-bold leading-tight mb-6 tracking-tight">
             Accelerate <br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">
               Research Impact
             </span>
           </h1>
           <p className="text-slate-400 text-lg max-w-sm leading-relaxed mb-8">
             高效管理科研全生命周期。从项目申报到成果转化，让数据驱动每一次学术创新。
           </p>

           {/* Feature Highlights */}
           <div className="space-y-4 max-w-sm">
              <div className="flex items-center space-x-4 p-3 rounded-xl bg白/5 border border白/10 backdrop-blur-sm hover:bg白/10 transition duration-300">
                <div className="p-2.5 rounded-lg bg-indigo-500/20 text-indigo-300">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">极速审批流程</h3>
                  <p className="text-xs text-slate-400">Streamlined Workflows</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 rounded-xl bg白/5 border border白/10 backdrop-blur-sm hover:bg白/10 transition duration-300">
                <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-300">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">多维数据洞察</h3>
                  <p className="text-xs text-slate-400">Advanced Analytics</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 rounded-xl bg白/5 border border白/10 backdrop-blur-sm hover:bg白/10 transition duration-300">
                 <div className="p-2.5 rounded-lg bg-blue-500/20 text-blue-300">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">智能辅助决策</h3>
                  <p className="text-xs text-slate-400">AI-Powered Insights</p>
                </div>
              </div>
           </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500 flex justify之间 items-center mt-12">
          <span>© 2024 University Research System</span>
          <div className="flex space-x-6">
             <a href="#" className="hover:text-slate-300 transition">Privacy</a>
             <a href="#" className="hover:text-slate-300 transition">Terms</a>
             <a href="#" className="hover:text-slate-300 transition">Contact</a>
          </div>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-8 bg-slate-50 relative overflow-hidden">
        {/* Background decoration for right side */}
        <div className="absolute top-[-10%] right-[-10%] opacity-[0.03] pointer-events-none">
           <Globe className="w-96 h-96 text-indigo-900" />
        </div>
        <div className="absolute bottom-[-10%] left-[-10%] opacity-[0.03] pointer-events-none">
           <Sparkles className="w-64 h-64 text-blue-900" />
        </div>

        <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100 relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 mb-4 ring-4 ring-indigo-50/50">
               <LogIn className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
            <p className="text-slate-500 text-sm mt-2">请登录您的账号以访问工作台</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">电子邮箱</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg白 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm"
                  placeholder="name@univ.edu.cn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <div className="flex justify之间 items-center mb-1">
                <label className="block text-sm font-medium text-slate-700">登录密码</label>
                <a href="#" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">忘记密码?</a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg白 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm"
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && <div className="flex items-center text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              {error}
            </div>}

            <button
              type="submit"
              className="w-full flex justify中心 py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-500/20 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all transform hover:scale-[1.01] active:scale-[0.99]"
            >
              立即登录
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600">
              还没有账号？{' '}
              <button onClick={onGoToRegister} className="font-bold text-indigo-600 hover:text-indigo-500 transition">
                注册新教师/管理员账号
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const RegisterScreen = ({ onRegister, onBackToLogin }: { onRegister: (userData: Omit<User, 'id' | 'created_at'>) => Promise<void>, onBackToLogin: () => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'teacher' as Role,
    department: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!formData.name || !formData.email || !formData.password) {
      setError('请填写所有必填字段');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        department: formData.role === 'teacher' ? formData.department : undefined,
      };
      await onRegister(userData);
    } catch (err: any) {
      setError(err.message || '注册失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full border border-indigo-50">
        <div className="mb-6">
           <h2 className="text-2xl font-bold text-gray-900">注册新账号</h2>
           <p className="text-sm text-gray-500 mt-1">创建账号以访问科研管理系统。</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <UserIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                required
                className="block w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:bg白 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all sm:text-sm"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">电子邮箱</label>
             <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <Mail className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="email"
                required
                className="block w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:bg白 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all sm:text-sm"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">设置密码</label>
             <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="password"
                required
                className="block w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:bg白 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all sm:text-sm"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">账号角色</label>
               <select 
                 className="block w-full py-2.5 pl-3 pr-10 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:bg白 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all sm:text-sm"
                 value={formData.role}
                 onChange={e => setFormData({...formData, role: e.target.value as Role})}
               >
                 <option value="teacher">教师/科研人员</option>
                 <option value="research_admin">科研管理员</option>
                 <option value="sys_admin">系统管理员</option>
               </select>
             </div>
             {formData.role === 'teacher' && (
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">所属院系</label>
                 <input
                    type="text"
                    required
                    placeholder="例如: 计算机学院"
                    className="block w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:bg白 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all sm:text-sm"
                    value={formData.department}
                    onChange={e => setFormData({...formData, department: e.target.value})}
                  />
               </div>
             )}
          </div>

          <button
            type="submit"
            className="w-full flex justify中心 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 mt-6 transition-colors"
          >
            完成注册
          </button>
        </form>

        <div className="mt-4 text-center">
          <button onClick={onBackToLogin} className="text-sm font-medium text-gray-600 hover:text-indigo-600">
            返回登录
          </button>
        </div>
      </div>
    </div>
  );
};

const OperationLogTable = ({ logs }: { logs: AuditLog[] }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作人</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">动作</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {logs.map(log => (
          <tr key={log.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.operatorName}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.action}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">{log.timestamp}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const ResearchDetailModal = ({ item, currentUser, onClose }: { item: ResearchItem, currentUser: User, onClose: () => void }) => {
  const steps = [
    { label: '草稿', status: 'Draft', icon: FileText },
    { label: '审核中', status: 'Pending', icon: Clock },
    { label: item.status === 'Rejected' ? '已驳回' : '已通过', status: item.status === 'Rejected' ? 'Rejected' : 'Approved', icon: item.status === 'Rejected' ? AlertCircle : Check }
  ];

  const currentStepIndex = item.status === 'Draft' ? 0 : item.status === 'Pending' ? 1 : 2;

  // Masking Logic
  const { maskedFields } = getResearchMaskingStatus(item, currentUser, RESEARCH_SUBTYPES);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify之间 items-center sticky top-0 bg白 z-10">
          <h3 className="text-xl font-bold text-gray-900">科研项目详情</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-8">
          {/* Status Visualization */}
          <div className="flex justify之间 items-center mb-10 relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 transform -translate-y-1/2"></div>
            {steps.map((step, idx) => {
               const isActive = idx <= currentStepIndex;
               const isFinalRejected = item.status === 'Rejected' && idx === 2;
               let colorClass = isActive ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-400 border-gray-300';
               if (isFinalRejected) colorClass = 'bg-red-600 text-white border-red-600';

               return (
                 <div key={idx} className="flex flex-col items-center bg白 px-2">
                   <div className={`w-10 h-10 rounded-full border-2 flex items-center justify中心 mb-2 ${colorClass}`}>
                     <step.icon className="w-5 h-5" />
                   </div>
                   <span className={`text-xs font-medium ${isActive ? (isFinalRejected ? 'text-red-600' : 'text-indigo-600') : 'text-gray-500'}`}>{step.label}</span>
                 </div>
               );
            })}
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">标题</label>
              <p className="text-lg font-medium text-gray-900">{item.title}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">类别</label>
                <p className="text-gray-900">{item.category}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">负责人</label>
                <p className="text-gray-900">{item.authorName}</p>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">团队成员</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {item.teamMembers && item.teamMembers.length > 0 ? (
                  item.teamMembers.map((m, i) => (
                    <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                      {m}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 text-sm">无</span>
                )}
              </div>
            </div>
            
            {/* Dynamic Data Display */}
            {item.content_json && (
               <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                 <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">详细元数据</h4>
                 <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                   {Object.entries(item.content_json).map(([key, value]) => {
                     const isSensitive = maskedFields.includes(key);
                     return (
                       <div key={key}>
                         <dt className="text-xs text-gray-500 capitalize">{key.replace(/_/g, ' ')}</dt>
                         <dd className="text-sm font-medium text-gray-900 mt-1">
                           {isSensitive ? (
                             <span className="inline-flex items-center text-gray-500 bg-gray-100 px-2 py-0.5 rounded text-xs border border-gray-200">
                               <Shield className="w-3 h-3 mr-1" />
                               *** (已脱敏)
                             </span>
                           ) : (
                             value as any
                           )}
                         </dd>
                       </div>
                     );
                   })}
                 </dl>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
