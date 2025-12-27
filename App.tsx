
import React, { useState, useEffect } from 'react';
import { User, ResearchItem, ResearchCategory, AuditLog, Role } from './types';
import { RESEARCH_CATEGORIES, RESEARCH_SUBTYPES } from './logic/compiler'; 
import { authAPI, researchAPI, usersAPI, logsAPI, noticeAPI, departmentAPI } from './logic/api';
import { Sidebar } from './components/LogViewer'; 
import { ResearchTable, getResearchMaskingStatus } from './components/QuadTable'; 
import { StatsOverview } from './components/TreeVisualizer'; 
import MidtermCheckList from './components/MidtermCheckList';
import { DynamicForm } from './components/DynamicForm';
import { AcademicProfile } from './components/AcademicProfile';
import { ProjectLifecycleManager, TagManager, CustomReportBuilder } from './components/EnhancedAdminTools';
import { ResearchCalendar, DataExportCenter } from './components/TeacherTools';
import TeacherNotifications from './components/TeacherNotifications';
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
import AuditContainer from './components/containers/AuditContainer';
import { getViewTitle } from './components/viewRegistry';
import LandingPage from './components/LandingPage';
import DashboardContainer from './components/containers/DashboardContainer';
import MyResearchContainer from './components/containers/MyResearchContainer';
import ApplyContainer from './components/containers/ApplyContainer';
import ProfileContainer from './components/containers/ProfileContainer';
import CalendarContainer from './components/containers/CalendarContainer';
import MidtermContainer from './components/containers/MidtermContainer';
import ExportContainer from './components/containers/ExportContainer';
import StatsContainer from './components/containers/StatsContainer';
import LifecycleContainer from './components/containers/LifecycleContainer';
import TagsContainer from './components/containers/TagsContainer';
import ReportsContainer from './components/containers/ReportsContainer';
import TemplatesContainer from './components/containers/TemplatesContainer';
import SysHealthContainer from './components/containers/SysHealthContainer';
import RolesContainer from './components/containers/RolesContainer';
import LogsContainer from './components/containers/LogsContainer';
import MDMContainer from './components/containers/MDMContainer';
import ConfigContainer from './components/containers/ConfigContainer';
import PublishContainer from './components/containers/PublishContainer';
import UsersContainer from './components/containers/UsersContainer';
// 确保路径对应你实际保存的位置
import ProjectApplyForm from './components/ProjectApplyForm';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [showRegister, setShowRegister] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // App State
  const [researchData, setResearchData] = useState<ResearchItem[]>([]);
  const [pendingData, setPendingData] = useState<ResearchItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [deptList, setDeptList] = useState<{code:string,name:string}[]>([]);
  const [userDeptCode, setUserDeptCode] = useState<string | null>(null);
  const [notices, setNotices] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Filters
  const [filters, setFilters] = useState<Filters>({ status: 'all', category: 'all' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    let cancelled = false;

    (async () => {
      try {
        const me = await usersAPI.getMe();
        if (cancelled) return;
        setCurrentUser(me);
        if (me.role === 'teacher') setActiveView('account');
        else if (me.role === 'research_admin') setActiveView('dashboard');
        else setActiveView('sys_health');
      } catch {
        localStorage.removeItem('token');
        setShowLanding(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);
  
  // Fetch all data when user logs in
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        // Fetch research data
        let research: ResearchItem[] = [];
        if (currentUser.role === 'teacher') {
          research = await researchAPI.getByUserId(currentUser.id as any);
        } else {
          research = await researchAPI.getAllAdmin();
        }
        setResearchData(research);
        
        // For admins, also fetch pending list
        if (currentUser.role === 'research_admin' || currentUser.role === 'sys_admin') {
          try {
            const pending = await researchAPI.getPending();
            setPendingData(pending);
          } catch {}
        }
        
        // Fetch users（仅系统管理员）
        if (currentUser.role === 'sys_admin') {
          const usersList = await usersAPI.getAll();
          setUsers(usersList);
        }
        
        // Fetch logs
        const logsList = await logsAPI.getAll();
        setLogs(logsList);
        try {
          const ns = currentUser.role === 'teacher' ? await noticeAPI.my() : await noticeAPI.list();
          setNotices(ns);
          if (currentUser.role === 'teacher') {
            // naive unread by fetching recipients is not available; mark unread as all for now
            setUnreadCount(ns.length);
          }
        } catch {}
        try {
          const ds = await departmentAPI.list();
          setDeptList(ds);
          if (currentUser.department) {
            const code = await departmentAPI.normalize(currentUser.department);
            setUserDeptCode(code);
          } else {
            setUserDeptCode(null);
          }
        } catch {}
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast.error(error.message || '获取数据失败');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser]);
  
  // Modal State
  const [selectedItem, setSelectedItem] = useState<ResearchItem | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectId, setRejectId] = useState<string>('');
  const [rejectRemarks, setRejectRemarks] = useState<string>('');
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<string>('');
  const [editUserName, setEditUserName] = useState<string>('');
  const [editUserEmail, setEditUserEmail] = useState<string>('');
  const [editUserDept, setEditUserDept] = useState<string>('');
  const [editUserRole, setEditUserRole] = useState<Role>('teacher');
  const [deleteUserArmed, setDeleteUserArmed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const centerTab: 'academic_home' | 'profile_manage' = 'academic_home';
  const setCenterTab = (_: any) => {};
  const accountTab: 'basic' | 'academic' | 'experience' | 'security' = 'basic';
  const setAccountTab = (_: any) => {};
  const expForm: any = { type: 'education', start_date: '', end_date: '', title: '', institution: '', description: '' };
  const setExpForm = (_: any) => {};
  const experiences: any[] = [];
  const setExperiences = (_: any) => {};


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

  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setShowRegister(false);
    setShowLanding(true);
    setActiveView('dashboard');
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
      const research = (currentUser.role === 'research_admin' || currentUser.role === 'sys_admin')
        ? await researchAPI.getAllAdmin()
        : await researchAPI.getAll();
      setResearchData(research);
      if (currentUser.role === 'research_admin' || currentUser.role === 'sys_admin') {
        try {
          const pending = await researchAPI.getPending();
          setPendingData(pending);
        } catch {}
      }
      const logsList = await logsAPI.getAll();
      setLogs(logsList);
      toast.success('审核通过');
    } catch (error: any) {
      console.error('Approve failed:', error);
      const msg = String(error?.message || '');
      if (msg.includes('already been reviewed')) {
        toast.info('该条目已被处理，已刷新列表');
        const research = (currentUser.role === 'research_admin' || currentUser.role === 'sys_admin')
          ? await researchAPI.getAllAdmin()
          : await researchAPI.getAll();
        setResearchData(research);
        if (currentUser.role === 'research_admin' || currentUser.role === 'sys_admin') {
          try {
            const pending = await researchAPI.getPending();
            setPendingData(pending);
          } catch {}
        }
        const logsList = await logsAPI.getAll();
        setLogs(logsList);
      } else {
        toast.error(msg || '审核失败');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    if (!currentUser) return;
    setRejectId(id);
    setRejectRemarks('');
    setRejectOpen(true);
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
      await researchAPI.updateStatus(id, 'pending', currentUser.name);
      // Refresh research data
      const research = currentUser.role === 'teacher'
        ? await researchAPI.getByUserId(currentUser.id as any)
        : await researchAPI.getAll();
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

  // Single reject confirm
  const confirmReject = async () => {
    if (!currentUser || !rejectId) return;
    setLoading(true);
    try {
      await researchAPI.updateStatus(rejectId, 'rejected', currentUser.name, rejectRemarks || undefined);
      const research = (currentUser.role === 'research_admin' || currentUser.role === 'sys_admin')
        ? await researchAPI.getAllAdmin()
        : await researchAPI.getAll();
      setResearchData(research);
      try {
        const pending = await researchAPI.getPending();
        setPendingData(pending);
      } catch {}
      const logsList = await logsAPI.getAll();
      setLogs(logsList);
      toast.success('驳回成功');
    } catch (error: any) {
      console.error('Reject failed:', error);
      toast.error(error.message || '驳回失败');
    } finally {
      setLoading(false);
      setRejectOpen(false);
      setRejectId('');
      setRejectRemarks('');
    }
  };

  const updateUserTags = async (userId: string, tags: string[]) => {
    if (!currentUser) return;
    setLoading(true);
    try {
      await usersAPI.updateTags(userId, tags);
      // Refresh users list
      if (currentUser.role === 'sys_admin') {
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

  const handleExportCSV = (items?: ResearchItem[]) => {
    const list = items ?? researchData;
    const headers = [
      "ID","标题","类别","负责人","日期","状态",
      "经费(万元)","来源","编号","参与角色","驳回原因","协作者"
    ];
    const esc = (v: any) => {
      const s = v === undefined || v === null ? "" : String(v);
      return `"${s.replace(/"/g, '""')}"`;
    };
    const rows = list.map(item => {
      const cj = (item as any)?.content_json || {};
      const funding = cj.funding ?? cj.amount ?? "";
      const source = cj.source ?? cj.agency ?? "";
      const number = cj.project_no ?? cj.projectNo ?? cj.number ?? "";
      const role = cj.role ?? "";
      const remarks = (item as any)?.audit_remarks ?? "";
      const collaborators = (item.teamMembers || []).join("|");
      return [
        esc(item.id),
        esc(item.title),
        esc(item.category),
        esc(item.authorName),
        esc(item.date),
        esc(item.status),
        esc(funding),
        esc(source),
        esc(number),
        esc(role),
        esc(remarks),
        esc(collaborators)
      ].join(",");
    }).join("\n");
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers.join(",") + "\n" + rows;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const ts = new Date().toISOString().slice(0,19).replace(/[:T]/g,"-");
    link.download = `research_export_${ts}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addLog(`导出数据(${list.length}条)`, 'export');
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
  const applyFiltersWithoutCategory = (arr: ResearchItem[]) => {
    return arr.filter(i => {
      const s = normalizeStatus(i.status);
      if (filters.status !== 'all' && s !== filters.status) return false;
      if (!inDateRange(i.date, filters.dateFrom, filters.dateTo)) return false;
      if (!inFundingRange(i, filters.fundingMin, filters.fundingMax)) return false;
      return true;
    });
  };

  // Map view IDs to Chinese titles
  

  if (!currentUser) {
    if (showLanding) {
      return (
        <LandingPage
          onLoginClick={() => { setShowLanding(false); setShowRegister(false); }}
          onRegisterClick={() => { setShowLanding(false); setShowRegister(true); }}
        />
      );
    }
    if (showRegister) {
      return <RegisterScreen onRegister={handleRegister} onBackToLogin={() => { setShowRegister(false); setShowLanding(true); }} />;
    }
    return <LoginScreen onLogin={handleLogin} onGoToRegister={() => setShowRegister(true)} />;
  }

  // Filter Data Logic
  const myResearch = currentUser.role === 'teacher'
    ? researchData
    : researchData.filter(item => item.authorId === currentUser.id || (item.teamMembers || []).includes(currentUser.name));
  const pendingResearch = pendingData.length ? pendingData : researchData.filter(item => (item.status || '').toLowerCase() === 'pending');

  const filteredMyResearch = applyFilters(myResearch);
  const filteredPending = applyFilters(pendingResearch);
  const impactMyResearch = applyFiltersWithoutCategory(myResearch);
  
  const filteredNotices = notices.filter(n => {
    const roleOk = n.target_role === 'all' || n.target_role === currentUser?.role;
    const deptOk = !n.target_department_code || (userDeptCode && n.target_department_code === userDeptCode);
    return roleOk && deptOk;
  });

  const handleMarkRead = async (id: number) => {
    try {
      await noticeAPI.markRead(id);
      const ns = await noticeAPI.my();
      setNotices(ns);
      setUnreadCount(Math.max(0, unreadCount - 1));
      toast.success('已标记为已读');
    } catch (e:any) {
      toast.error(e.message || '操作失败');
    }
  };
  
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-600 antialiased">
      <Sidebar 
        user={currentUser} 
        activeView={activeView} 
        onViewChange={setActiveView} 
        onLogout={handleLogout}
      />

      <main className="flex-1 overflow-y-auto relative">
        {/* Sticky Header with Backdrop Blur */}
        <div className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-xl border-b border-slate-200/60 px-4 md:px-8 py-4 mb-8">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              {currentUser?.role !== 'teacher' ? (
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                    {getViewTitle(activeView)}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    欢迎回来，{currentUser?.name}
                  </p>
                </div>
              ) : <div />}
              
              <div className="flex items-center gap-4">
                 {currentUser?.role === 'teacher' && (
                   <>
                    <div className="relative">
                      <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors focus:outline-none">
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />}
                      </button>
                      
                      {showNotifications && (
                        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden max-h-[80vh] overflow-y-auto">
                           <TeacherNotifications 
                              notices={filteredNotices} 
                              onMarkRead={handleMarkRead} 
                              unreadCount={unreadCount} 
                           />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                      <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center border border-indigo-500 text-white font-medium shadow-sm">
                        {currentUser.name?.[0] || 'U'}
                      </div>
                      <div className="flex flex-col">
                         <p className="text-sm font-medium text-slate-800 truncate">{currentUser.name}</p>
                         <p className="text-xs text-slate-500 truncate">教师</p>
                      </div>
                    </div>
                   </>
                 )}
                 {/* Contextual Action Button */}
                 {currentUser?.role === 'teacher' && activeView === 'my_research' && (
                  <button onClick={() => setActiveView('apply')} className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center text-sm font-medium transition shadow-lg shadow-indigo-500/20 active:scale-95">
                    <Plus className="w-4 h-4 mr-2" />
                    新增成果
                  </button>
                )}
               
              </div>
            </div>
         </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12">
          
          {/* Views */}

          {/* RESEARCH ADMIN: Dashboard */}
          {activeView === 'dashboard' && (
            <DashboardContainer filters={filters} onFiltersChange={setFilters}>
              <ResearchAdminDashboard 
                data={applyFilters(researchData)} 
                onNavigate={setActiveView}
                onExport={(items) => handleExportCSV(items)}
              />
            </DashboardContainer>
          )}

          {/* TEACHER: Account/Profile Unified */}
          {(activeView === 'account' || activeView === 'profile') && (
            <AcademicProfile
              user={currentUser}
              researchItems={filteredMyResearch}
              impactItems={impactMyResearch}
              onProfileUpdate={async () => {
                const me = await usersAPI.getMe();
                setCurrentUser(me);
              }}
            />
          )}

          {/* TEACHER: Account Center */}
          {false && activeView === 'account' && (
            <div className="max-w-5xl mx-auto space-y-8">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3 sticky top-16 z-20">
                <button className={`px-3 py-2 rounded ${centerTab==='academic_home'?'bg-indigo-600 text-white':'text-gray-700 hover:bg-gray-50'}`} onClick={()=>setCenterTab('academic_home')}>学术主页</button>
                <button className={`px-3 py-2 rounded ${centerTab==='profile_manage'?'bg-indigo-600 text-white':'text-gray-700 hover:bg-gray-50'}`} onClick={()=>setCenterTab('profile_manage')}>资料管理</button>
                <div className="flex-1" />
                <button className="px-3 py-2 bg-indigo-600 text-white rounded text-sm" onClick={async () => {
                  try {
                    const deptCode = currentUser?.department ? await departmentAPI.normalize(currentUser!.department!) : null;
                    await usersAPI.updateMe({
                      full_name: currentUser!.name,
                      email: currentUser!.email,
                      department: currentUser!.department,
                      department_code: deptCode || undefined,
                      employee_id: (currentUser as any)?.employee_id,
                      gender: (currentUser as any)?.gender,
                      birth_date: (currentUser as any)?.birth_date,
                      phone: (currentUser as any)?.phone,
                      office_location: (currentUser as any)?.office_location,
                      highest_education: (currentUser as any)?.highest_education,
                      degree: (currentUser as any)?.degree,
                      alma_mater: (currentUser as any)?.alma_mater,
                      major: (currentUser as any)?.major,
                      research_direction: (currentUser as any)?.research_direction,
                      advisor_qualification: (currentUser as any)?.advisor_qualification,
                      profile_public: (currentUser as any)?.profile_public
                    });
                    const me = await usersAPI.getMe();
                    setCurrentUser(me);
                    toast.success('已更新个人档案');
                  } catch (e:any) {
                    toast.error(e.message || '更新失败');
                  }
                }}>保存档案</button>
              </div>
              {centerTab === 'academic_home' && (
                <>
                  <AcademicProfile 
                    user={currentUser} 
                    researchItems={filteredMyResearch}
                    impactItems={impactMyResearch}
                    categoryFilterValue={filters.category}
                    onCategoryChange={(v) => setFilters({ ...filters, category: v as any })}
                  />

                </>
              )}
              {centerTab === 'profile_manage' && false && (
              <>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
                <button className={`px-3 py-2 rounded ${accountTab==='basic'?'bg-indigo-600 text-white':'text-gray-700 hover:bg-gray-50'}`} onClick={()=>setAccountTab('basic')}>基本信息</button>
                <button className={`px-3 py-2 rounded ${accountTab==='academic'?'bg-indigo-600 text-white':'text-gray-700 hover:bg-gray-50'}`} onClick={()=>setAccountTab('academic')}>学术信息</button>
                <button className={`px-3 py-2 rounded ${accountTab==='experience'?'bg-indigo-600 text-white':'text-gray-700 hover:bg-gray-50'}`} onClick={()=>setAccountTab('experience')}>教育与工作经历</button>
                <button className={`px-3 py-2 rounded ${accountTab==='security'?'bg-indigo-600 text-white':'text-gray-700 hover:bg-gray-50'}`} onClick={()=>setAccountTab('security')}>隐私与安全</button>
                <div className="flex-1" />
                <button className="px-3 py-2 bg-indigo-600 text-white rounded text-sm" onClick={async () => {
                  try {
                    const deptCode = currentUser?.department ? await departmentAPI.normalize(currentUser!.department!) : null;
                    await usersAPI.updateMe({
                      full_name: currentUser!.name,
                      email: currentUser!.email,
                      department: currentUser!.department,
                      department_code: deptCode || undefined,
                      employee_id: (currentUser as any)?.employee_id,
                      gender: (currentUser as any)?.gender,
                      birth_date: (currentUser as any)?.birth_date,
                      phone: (currentUser as any)?.phone,
                      office_location: (currentUser as any)?.office_location,
                      highest_education: (currentUser as any)?.highest_education,
                      degree: (currentUser as any)?.degree,
                      alma_mater: (currentUser as any)?.alma_mater,
                      major: (currentUser as any)?.major,
                      research_direction: (currentUser as any)?.research_direction,
                      advisor_qualification: (currentUser as any)?.advisor_qualification,
                      profile_public: (currentUser as any)?.profile_public
                    });
                    const me = await usersAPI.getMe();
                    setCurrentUser(me);
                    toast.success('已更新个人档案');
                  } catch (e:any) {
                    toast.error(e.message || '更新失败');
                  }
                }}>保存档案</button>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">基本信息维护</h3>
                {accountTab==='basic' && <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">工号</label>
                    <input className="w-full border rounded px-3 py-2 text-sm" value={(currentUser as any)?.employee_id || ''} onChange={e => setCurrentUser({...currentUser!, employee_id: e.target.value} as any)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">姓名</label>
                    <input className="w-full border rounded px-3 py-2 text-sm" value={currentUser?.name || ''} onChange={e => setCurrentUser({...currentUser!, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">性别</label>
                    <select className="w-full border rounded px-3 py-2 text-sm" value={(currentUser as any)?.gender || ''} onChange={e => setCurrentUser({...currentUser!, gender: e.target.value} as any)}>
                      <option value="">未填写</option>
                      <option value="男">男</option>
                      <option value="女">女</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">出生日期</label>
                    <input type="date" className="w-full border rounded px-3 py-2 text-sm" value={(currentUser as any)?.birth_date || ''} onChange={e => setCurrentUser({...currentUser!, birth_date: e.target.value} as any)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">联系电话</label>
                    <input className="w-full border rounded px-3 py-2 text-sm" value={(currentUser as any)?.phone || ''} onChange={e => setCurrentUser({...currentUser!, phone: e.target.value} as any)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">电子邮箱</label>
                    <input className="w-full border rounded px-3 py-2 text-sm" value={currentUser?.email || ''} onChange={e => setCurrentUser({...currentUser!, email: e.target.value})} />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs text-gray-500 mb-1">学院/部门</label>
                    <input className="w-full border rounded px-3 py-2 text-sm" value={currentUser?.department || ''} onChange={e => setCurrentUser({...currentUser!, department: e.target.value})} />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs text-gray-500 mb-1">办公地点</label>
                    <input className="w-full border rounded px-3 py-2 text-sm" value={(currentUser as any)?.office_location || ''} onChange={e => setCurrentUser({...currentUser!, office_location: e.target.value} as any)} />
                  </div>
                </div>}
              </div>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">学术信息</h3>
                {accountTab==='academic' && <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">最高学历</label>
                    <input className="w-full border rounded px-3 py-2 text-sm" value={(currentUser as any)?.highest_education || ''} onChange={e => setCurrentUser({...currentUser!, highest_education: e.target.value} as any)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">授予学位</label>
                    <input className="w-full border rounded px-3 py-2 text-sm" value={(currentUser as any)?.degree || ''} onChange={e => setCurrentUser({...currentUser!, degree: e.target.value} as any)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">毕业院校</label>
                    <input className="w-full border rounded px-3 py-2 text-sm" value={(currentUser as any)?.alma_mater || ''} onChange={e => setCurrentUser({...currentUser!, alma_mater: e.target.value} as any)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">所学专业</label>
                    <input className="w-full border rounded px-3 py-2 text-sm" value={(currentUser as any)?.major || ''} onChange={e => setCurrentUser({...currentUser!, major: e.target.value} as any)} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">研究方向（用于推荐项目申报）</label>
                    <input className="w-full border rounded px-3 py-2 text-sm" value={(currentUser as any)?.research_direction || ''} onChange={e => setCurrentUser({...currentUser!, research_direction: e.target.value} as any)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">导师资格</label>
                    <select className="w-full border rounded px-3 py-2 text-sm" value={(currentUser as any)?.advisor_qualification || ''} onChange={e => setCurrentUser({...currentUser!, advisor_qualification: e.target.value} as any)}>
                      <option value="">未填写</option>
                      <option value="博导">博导</option>
                      <option value="硕导">硕导</option>
                    </select>
                  </div>
                </div>}
              </div>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900">教育与工作经历</h3>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 border rounded text-sm" onClick={async () => {
                      try { const list = await usersAPI.getMyExperiences(); setExperiences(list); } catch (e:any) { toast.error(e.message || '加载失败'); }
                    }}>同步服务器数据</button>
                  </div>
                </div>
                {accountTab==='experience' && <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <select className="border rounded px-3 py-2 text-sm" value={expForm.type} onChange={e => setExpForm({ ...expForm, type: e.target.value })}>
                    <option value="education">教育经历</option>
                    <option value="work">工作经历</option>
                  </select>
                  <input type="date" className="border rounded px-3 py-2 text-sm" value={expForm.start_date} onChange={e => setExpForm({ ...expForm, start_date: e.target.value })} />
                  <input type="date" className="border rounded px-3 py-2 text-sm" value={expForm.end_date} onChange={e => setExpForm({ ...expForm, end_date: e.target.value })} />
                  <input className="border rounded px-3 py-2 text-sm" placeholder="标题/岗位或学位" value={expForm.title} onChange={e => setExpForm({ ...expForm, title: e.target.value })} />
                  <input className="border rounded px-3 py-2 text-sm" placeholder="单位/学校" value={expForm.institution} onChange={e => setExpForm({ ...expForm, institution: e.target.value })} />
                  <input className="border rounded px-3 py-2 text-sm md:col-span-2" placeholder="描述" value={expForm.description} onChange={e => setExpForm({ ...expForm, description: e.target.value })} />
                </div>}
                {accountTab==='experience' && <div className="flex justify-end mb-4">
                  <button className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm" onClick={async () => {
                    try { const created = await usersAPI.addMyExperience(expForm); setExperiences([...(experiences || []), created]); toast.success('已新增经历'); } catch (e:any) { toast.error(e.message || '新增失败'); }
                  }}>新增经历</button>
                </div>}
                {accountTab==='experience' && <div className="relative border-l-2 border-gray-200 ml-3 space-y-4 pl-8 py-2">
                  {(experiences || []).map((exp: any) => (
                    <div key={exp.id} className="relative group">
                      <div className="absolute -left-[9px] bg-white border-2 border-gray-200 rounded-full w-4 h-4 group-hover:border-indigo-500 transition-colors"></div>
                      <div className="bg-gray-50 p-4 rounded-lg hover:bg-white hover:shadow-md border border-transparent hover:border-gray-100 transition-all">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-gray-900">{exp.title || (exp.type === 'education' ? '教育经历' : '工作经历')}</h4>
                          <span className="text-xs font-mono text-gray-500 bg-white px-2 py-1 rounded border">{exp.start_date || ''} ~ {exp.end_date || ''}</span>
                        </div>
                        <div className="text-sm text-indigo-600 font-medium mt-1">{exp.institution || ''}</div>
                        <p className="text-sm text-gray-600 mt-2">{exp.description || ''}</p>
                        <div className="mt-2 text-right space-x-3">
                          <button className="text-indigo-600 hover:text-indigo-900 text-xs" onClick={async () => {
                            const title = prompt('修改标题', exp.title || '') || exp.title;
                            const institution = prompt('修改单位', exp.institution || '') || exp.institution;
                            const description = prompt('修改描述', exp.description || '') || exp.description;
                            try { const updated = await usersAPI.updateMyExperience(exp.id, { ...exp, title, institution, description }); setExperiences((experiences || []).map(e => e.id === exp.id ? updated : e)); toast.success('已更新'); } catch (e:any) { toast.error(e.message || '更新失败'); }
                          }}>编辑</button>
                          <button className="text-red-600 hover:text-red-900 text-xs" onClick={async () => {
                            if (!confirm('确认删除该经历？')) return;
                            try { await usersAPI.deleteMyExperience(exp.id); setExperiences((experiences || []).filter(e => e.id !== exp.id)); toast.success('已删除'); } catch (e:any) { toast.error(e.message || '删除失败'); }
                          }}>删除</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(experiences || []).length === 0 && <p className="text-gray-500 italic">暂无经历，点击“同步服务器数据”或新增</p>}
                </div>}
              </div>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">隐私与安全</h3>
                {accountTab==='security' && <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 flex items-center">
                    <label className="text-sm text-gray-700 mr-3">个人主页对外公开</label>
                    <button
                      onClick={() => setCurrentUser({...currentUser!, profile_public: !((currentUser as any)?.profile_public)} as any)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${ (currentUser as any)?.profile_public ? 'bg-indigo-600' : 'bg-gray-200'}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${ (currentUser as any)?.profile_public ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  <div />
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">旧密码</label>
                    <input type="password" className="w-full border rounded px-3 py-2 text-sm" id="old_pwd" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">新密码</label>
                    <input type="password" className="w-full border rounded px-3 py-2 text-sm" id="new_pwd" />
                  </div>
                  <div className="flex items-end">
                    <button className="px-4 py-2 border rounded text-sm" onClick={async () => {
                      const oldPwd = (document.getElementById('old_pwd') as HTMLInputElement)?.value || '';
                      const newPwd = (document.getElementById('new_pwd') as HTMLInputElement)?.value || '';
                      if (!oldPwd || !newPwd) { toast.error('请输入旧密码与新密码'); return; }
                      try { await usersAPI.changeMyPassword(oldPwd, newPwd); toast.success('密码已修改'); } catch (e:any) { toast.error(e.message || '修改失败'); }
                    }}>修改密码</button>
                  </div>
                </div>}
              </div>
              <div className="flex justify-end">
                <button className="px-4 py-2 bg-indigo-600 text-white rounded text-sm" onClick={async () => {
                  try {
                    const deptCode = currentUser?.department ? await departmentAPI.normalize(currentUser!.department!) : null;
                    await usersAPI.updateMe({
                      full_name: currentUser!.name,
                      email: currentUser!.email,
                      department: currentUser!.department,
                      department_code: deptCode || undefined,
                      employee_id: (currentUser as any)?.employee_id,
                      gender: (currentUser as any)?.gender,
                      birth_date: (currentUser as any)?.birth_date,
                      phone: (currentUser as any)?.phone,
                      office_location: (currentUser as any)?.office_location,
                      highest_education: (currentUser as any)?.highest_education,
                      degree: (currentUser as any)?.degree,
                      alma_mater: (currentUser as any)?.alma_mater,
                      major: (currentUser as any)?.major,
                      research_direction: (currentUser as any)?.research_direction,
                      advisor_qualification: (currentUser as any)?.advisor_qualification,
                      profile_public: (currentUser as any)?.profile_public
                    });
                    const me = await usersAPI.getMe();
                    setCurrentUser(me);
                    toast.success('已更新个人档案');
                  } catch (e:any) {
                    toast.error(e.message || '更新失败');
                  }
                }}>保存档案</button>
              </div>
              </>
              )}
             
            </div>
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
            <MyResearchContainer
              data={filteredMyResearch}
              currentUser={currentUser}
              filters={filters}
              onFiltersChange={setFilters}
              onSubmit={handleSubmitDraft}
              onViewDetail={setSelectedItem}
              onExport={() => handleExportCSV(filteredMyResearch)}
            />
          )}

          {/* TEACHER: Apply (Dynamic Form) */}
          {activeView === 'apply' && (
            // <ApplyContainer
            //   currentUser={currentUser}
            //   onSubmit={(item) => {
            //     handleAddResearch(item);
            //     setActiveView('my_research');
            //   }}
            //   onCancel={() => setActiveView('my_research')}
            // />
            <ProjectApplyForm 
    // 如果后续你需要在这个组件里处理提交逻辑，可以在这里传 props
    // 目前先直接渲染看效果
  />
          )}

          {/* TEACHER: Academic Profile */}
          {false && activeView === 'profile' && (
            <ProfileContainer
              user={currentUser}
              filteredItems={filteredMyResearch}
              impactItems={impactMyResearch}
              notices={notices.filter(n => {
                const roleOk = n.target_role === 'all' || n.target_role === currentUser.role;
                const deptOk = !n.target_department_code || (userDeptCode && n.target_department_code === userDeptCode);
                return roleOk && deptOk;
              })}
              unreadCount={unreadCount}
              onNoticesRefresh={setNotices}
              onUnreadChange={setUnreadCount}
              category={filters.category}
              onCategoryChange={(v) => setFilters({ ...filters, category: v as any })}
            />
          )}

          {/* TEACHER: Research Calendar */}
          {activeView === 'calendar' && <CalendarContainer />}
          
          {/* ADMIN: Midterm Check List */}
          {activeView === 'midterm' && (
            <MidtermContainer data={applyFilters(researchData)} onViewDetail={setSelectedItem} />
          )}

          {/* TEACHER: Data Export Center */}
          {activeView === 'export' && (
            <ExportContainer user={currentUser} researchItems={filteredMyResearch} />
          )}

          {/* ADMIN: Audit */}
          {activeView === 'audit' && (
            <AuditContainer
              data={filteredPending}
              currentUser={currentUser!}
              filters={filters}
              onFiltersChange={setFilters}
              onApprove={handleApprove}
              onReject={handleReject}
              onViewDetail={setSelectedItem}
              onExport={() => handleExportCSV(filteredPending)}
            />
          )}

          {/* ADMIN: Stats */}
          {activeView === 'stats' && <StatsContainer data={applyFilters(researchData)} />}

          {/* ADMIN: Publish Notice (Mock) */}
          {activeView === 'publish' && false && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
               <h3 className="text-lg font-medium mb-4 text-gray-900">发布新通知</h3>
               <div className="mb-4">
                 <label className="block text-sm font-medium text-gray-700 mb-1">通知标题</label>
                 <input 
                   type="text" 
                   className="block w-full rounded-lg bg-gray-50 border border-gray-200 text-gray-900 px-4 py-2.5 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all sm:text-sm" 
                   placeholder="请输入标题..." 
                    id="notice_title"
                 />
               </div>
               <div className="mb-4">
                 <label className="block text-sm font-medium text-gray-700 mb-1">通知内容</label>
                 <textarea 
                   className="block w-full rounded-lg bg-gray-50 border border-gray-200 text-gray-900 px-4 py-2.5 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all sm:text-sm" 
                   rows={6} 
                   placeholder="请输入通知正文..."
                    id="notice_content"
                 ></textarea>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">目标群体</label>
                   <select id="notice_role" className="block w-full rounded-lg bg-gray-50 border border-gray-200 px-4 py-2.5 text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all sm:text-sm">
                     <option value="teacher">教师/科研人员</option>
                     <option value="research_admin">科研管理员</option>
                     <option value="sys_admin">系统管理员</option>
                     <option value="all">全体</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">目标院系（可选）</label>
                   <select id="notice_dept_code" className="block w-full rounded-lg bg-gray-50 border border-gray-200 px-4 py-2.5 text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all sm:text-sm">
                     <option value="">不限定院系</option>
                     {deptList.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                   </select>
                 </div>
               </div>
               <div className="flex justify-end">
                 <button onClick={async () => {
                   const title = (document.getElementById('notice_title') as HTMLInputElement)?.value || '';
                   const content = (document.getElementById('notice_content') as HTMLTextAreaElement)?.value || '';
                   const role = (document.getElementById('notice_role') as HTMLSelectElement)?.value || 'teacher';
                   const deptCode = (document.getElementById('notice_dept_code') as HTMLSelectElement)?.value || '';
                   const dept = deptCode ? (deptList.find((d:any) => d.code === deptCode)?.name || undefined) : undefined;
                   if (!title || !content) { toast.error('请填写标题与内容'); return; }
                   try {
                     await noticeAPI.create({ title, content, target_role: role, target_department: dept, target_department_code: deptCode || undefined, publisher: currentUser?.name } as any);
                     toast.success('通知已发布');
                   } catch (e: any) {
                     toast.error(e.message || '发布失败');
                   }
                 }} className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition font-medium">发布通知</button>
               </div>
           </div>
          )}

          {activeView === 'publish' && (
            <PublishContainer deptList={deptList} currentUser={currentUser} />
          )}

          {/* SYS ADMIN: Users */}
          {activeView === 'users' && false && (
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="搜索用户..." 
                    value={(window as any).__userSearch || ''} 
                    onChange={(e) => { (window as any).__userSearch = e.target.value; }}
                    className="block w-full h-10 pl-9 pr-4 rounded-lg bg-white border border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all text-sm" 
                  />
                </div>
                {currentUser?.role === 'sys_admin' && (
                  <>
                    <div className="ml-2 flex items-center">
                      <span className="text-xs text-gray-500 mr-2">删除保护</span>
                      <button
                        onClick={() => setDeleteUserArmed(v => !v)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${deleteUserArmed ? 'bg-red-600' : 'bg-gray-200'}`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${deleteUserArmed ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                    <button onClick={async () => {
                      try {
                        const email = `user${Date.now()}@demo.com`;
                        await usersAPI.create({ email, password: '123456', full_name: `新用户${Date.now()}`, role: 'teacher' });
                        const usersList = await usersAPI.getAll();
                        setUsers(usersList);
                        toast.success('已添加用户');
                      } catch (e:any) { toast.error(e.message || '添加失败'); }
                    }} className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">添加用户</button>
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
                   {users.filter(u => {
                     const q = (window as any).__userSearch || '';
                     return !q || (u.name?.includes(q) || u.email?.includes(q));
                   }).map(u => (
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
                         {currentUser?.role === 'sys_admin' ? (
                           <>
                             <button onClick={() => {
                               setEditUserId(String(u.id));
                               setEditUserName(u.name || '');
                               setEditUserEmail(u.email || '');
                               setEditUserDept(u.department || '');
                               setEditUserRole(u.role as Role);
                               setEditUserOpen(true);
                             }} className="text-indigo-600 hover:text-indigo-900">编辑</button>
                             <button onClick={async () => {
                               try {
                                 if (!deleteUserArmed) { toast.error('请先开启删除保护开关'); return; }
                                 await usersAPI.delete(String(u.id));
                                 const usersList = await usersAPI.getAll();
                                 setUsers(usersList);
                                 setDeleteUserArmed(false);
                                 toast.success('已删除用户');
                               } catch (e:any) { toast.error(e.message || '删除失败'); }
                             }} className="text-red-600 hover:text-red-900 ml-3">删除</button>
                           </>
                         ) : (
                           <span className="text-xs text-gray-400">仅系统管理员可操作</span>
                         )}
                       </td>
                     </tr>
                   ))}
                 </tbody>
             </table>
            </div>
          )}

          {activeView === 'users' && (
            <UsersContainer users={users} currentUser={currentUser} onUsersRefresh={setUsers} />
          )}

          {/* SYS ADMIN: Health */}
          {activeView === 'sys_health' && <SysHealthContainer />}

          {/* SYS ADMIN: Roles */}
          {activeView === 'sys_roles' && <RolesContainer />}

          {/* SYS ADMIN: Logs */}
          {activeView === 'logs' && <LogsContainer />}

          {/* SYS ADMIN: MDM */}
          {activeView === 'sys_mdm' && <MDMContainer />}

          {/* SYS ADMIN: Config */}
          {activeView === 'config' && <ConfigContainer />}

          {/* RESEARCH ADMIN: Review Templates */}
          {activeView === 'templates' && <TemplatesContainer />}

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
      {/* Reject Modal */}
      {rejectOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-md">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h4 className="text-sm font-semibold text-gray-900">填写驳回原因</h4>
              <button onClick={() => setRejectOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4">
              <textarea value={rejectRemarks} onChange={(e) => setRejectRemarks(e.target.value)} rows={4} className="w-full rounded-lg bg-white border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm" placeholder="请输入具体原因（必填）"></textarea>
            </div>
            <div className="p-4 flex justify-end gap-2 border-t border-gray-200">
              <button onClick={() => setRejectOpen(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm">取消</button>
              <button onClick={confirmReject} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm">确认驳回</button>
            </div>
          </div>
        </div>
      )}
      {/* Edit User Modal */}
      {editUserOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-lg">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h4 className="text-sm font-semibold text-gray-900">编辑用户</h4>
              <button onClick={() => setEditUserOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">姓名</label>
                <input value={editUserName} onChange={e => setEditUserName(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">邮箱</label>
                <input type="email" value={editUserEmail} onChange={e => setEditUserEmail(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">学院/部门</label>
                <input value={editUserDept} onChange={e => setEditUserDept(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="例如：计算机学院" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">角色身份</label>
                <select value={editUserRole} onChange={e => setEditUserRole(e.target.value as Role)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                  <option value="teacher">教师</option>
                  <option value="research_admin">科研管理员</option>
                  <option value="sys_admin">系统管理员</option>
                </select>
              </div>
            </div>
            <div className="p-4 flex justify-end gap-2 border-t border-gray-200">
              <button onClick={() => setEditUserOpen(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm">取消</button>
              <button onClick={async () => {
                try {
                  const deptCode = editUserDept ? await (await import('./logic/api')).departmentAPI.normalize(editUserDept) : null;
                  await usersAPI.update(editUserId, { full_name: editUserName, email: editUserEmail, role: editUserRole, department: editUserDept || undefined, department_code: deptCode || undefined } as any);
                  const usersList = await usersAPI.getAll();
                  setUsers(usersList);
                  setEditUserOpen(false);
                  toast.success('已更新用户信息');
                } catch (e:any) {
                  toast.error(e.message || '更新失败');
                }
              }} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm">保存</button>
            </div>
          </div>
        </div>
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
        aria-label="通知"
      />
    </div>
  );
}

// Sub-components

const ResearchAdminDashboard = ({ data, onNavigate, onExport }: { data: ResearchItem[], onNavigate: (v: string) => void, onExport: (items: ResearchItem[]) => void }) => {
  const pendingCount = data.filter(i => (i.status || '').toLowerCase() === 'pending').length;
  const approvedCount = data.filter(i => (i.status || '').toLowerCase() === 'approved').length;
  const totalFunding = data.reduce((acc, item) => acc + ((item as any)?.content_json?.funding ?? (item as any)?.content_json?.amount ?? 0), 0);
  
  // Mock Todos
  const daysUntil = (dateStr?: string) => {
    if (!dateStr) return null;
    try { const ms = new Date(dateStr).getTime() - Date.now(); return Math.ceil(ms / 86400000); } catch { return null; }
  };
  const midtermCount = data
    .filter(i => String(i.category || '').includes('项目'))
    .map(i => {
      const cj: any = (i as any)?.content_json || {};
      const mid = cj.midterm_date || cj.midterm_due || cj.end_date;
      const d = daysUntil(mid);
      return typeof d === 'number' && d <= 30 ? 1 : 0;
    })
    .reduce((a, b) => a + b, 0);
  const todos = [
    { id: 1, title: '审核新提交的科研项目/论文', count: pendingCount, action: 'audit' },
    { id: 2, title: '即将截止的项目中期检查', count: midtermCount, action: 'midterm' },
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
              <QuickActionBtn icon={CheckCircle} label="审核队列" onClick={() => onNavigate('audit')} />
              <QuickActionBtn icon={Bell} label="发布通知" onClick={() => onNavigate('publish')} />
              <QuickActionBtn icon={Layers} label="全周期管理" onClick={() => onNavigate('lifecycle')} />
              <QuickActionBtn icon={Database} label="自定义报表" onClick={() => onNavigate('reports')} />
              <QuickActionBtn icon={Tag} label="标签管理" onClick={() => onNavigate('tags')} />
              <QuickActionBtn icon={Download} label="数据导出" onClick={() => onExport(data)} />
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
        <div className="relative overflow-hidden flex-col justify-between p-8 text-white bg-[#0B1120]">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
             {/* Grid Pattern */}
             <div className="absolute inset-0" style={{ 
                 backgroundImage: 'radial-gradient(rgba(99, 102, 241, 0.15) 1px, transparent 1px)', 
                 backgroundSize: '32px 32px' 
             }}></div>
             {/* Gradient Glows */}
             <div className="absolute top-0 right-0 w-[380px] h-[380px] bg-indigo-600/20 rounded-full blur-[90px] -translate-y-1/2 translate-x-1/2"></div>
             <div className="absolute bottom-0 left-0 w-[380px] h-[380px] bg-blue-600/20 rounded-full blur-[90px] translate-y-1/2 -translate-x-1/2"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 mt-6">
           <div className="flex items-center space-x-3 mb-6">
             <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
               <Hexagon className="text-white w-6 h-6 fill-indigo-500/20" />
             </div>
             <span className="text-xl font-bold tracking-wide">UR System</span>
           </div>
           
           <h1 className="text-4xl font-bold leading-tight mb-4 tracking-tight">
             Accelerate <br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">
               Research Impact
             </span>
           </h1>
           <p className="text-slate-400 text-base max-w-sm leading-relaxed mb-6">
             高效管理科研全生命周期。从项目申报到成果转化，让数据驱动每一次学术创新。
           </p>

           {/* Feature Highlights */}
           <div className="space-y-3 max-w-sm">
              <div className="flex items-center space-x-4 p-2.5 rounded-xl bg白/5 border border白/10 backdrop-blur-sm hover:bg白/10 transition duration-300">
                <div className="p-2.5 rounded-lg bg-indigo-500/20 text-indigo-300">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">极速审批流程</h3>
                  <p className="text-xs text-slate-400">Streamlined Workflows</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-2.5 rounded-xl bg白/5 border border白/10 backdrop-blur-sm hover:bg白/10 transition duration-300">
                <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-300">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">多维数据洞察</h3>
                  <p className="text-xs text-slate-400">Advanced Analytics</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-2.5 rounded-xl bg白/5 border border白/10 backdrop-blur-sm hover:bg白/10 transition duration-300">
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

        <div className="relative z-10 text-xs text-slate-500 flex justify之间 items-center mt-8">
          <span>© 2024 University Research System</span>
          <div className="flex space-x-6">
             <a href="#" className="hover:text-slate-300 transition">Privacy</a>
             <a href="#" className="hover:text-slate-300 transition">Terms</a>
             <a href="#" className="hover:text-slate-300 transition">Contact</a>
          </div>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="relative p-6">
        {/* Background decoration for right side */}
        <div className="absolute top-[-10%] right-[-10%] opacity-[0.03] pointer-events-none">
           <Globe className="w-72 h-72 text-indigo-900" />
        </div>
        <div className="absolute bottom-[-10%] left-[-10%] opacity-[0.03] pointer-events-none">
           <Sparkles className="w-48 h-48 text-blue-900" />
        </div>

        <div className="relative z-10 max-w-md">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 mb-3 ring-4 ring-indigo-50/50">
               <LogIn className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Welcome Back</h2>
            <p className="text-slate-500 text-sm mt-1">请登录您的账号以访问工作台</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">电子邮箱</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg白 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm"
                  placeholder="name@univ.edu.cn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <div className="flex justify之间 items-center mb-1">
                <label className="block text-sm font-medium text-slate-700">登录密码</label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg白 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm"
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && <div className="flex items-center text-red-600 text-sm bg-red-50 p-2.5 rounded-lg border border-red-100">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              {error}
            </div>}

            <button
              type="submit"
              className="w-full flex justify中心 py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-500/20 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all"
            >
              立即登录
            </button>
            <div className="mt-3 text-center">
              <a href="#" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">忘记密码?</a>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
        <div className="relative overflow-hidden flex-col justify-between p-8 text-white bg-[#0B1120]">
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-8">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Hexagon className="text-white w-6 h-6 fill-indigo-500/20" />
              </div>
              <span className="text-xl font-bold tracking-wide">UR System</span>
            </div>
            <div className="text-4xl font-bold mb-6 text-white">注册账号</div>
            <div className="space-y-2 max-w-sm mb-8">
              <p className="text-slate-300 text-sm leading-relaxed">统一身份，安全可靠，快速开通科研管理平台账号。</p>
              <p className="text-slate-300 text-sm leading-relaxed">注册后即可提交项目与成果，并参与审批与统计。</p>
            </div>
          </div>
        </div>
        <div className="relative p-6">
          <div className="relative z-10 max-w-md">
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
                className="block w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all sm:text-sm"
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
                className="block w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all sm:text-sm"
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
                className="block w-full py-2.5 pl-3 pr-10 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all sm:text-sm"
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
                    className="block w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all sm:text-sm"
                    value={formData.department}
                    onChange={e => setFormData({...formData, department: e.target.value})}
                  />
               </div>
             )}
          </div>

          <button
            type="submit"
            className="w-full flex justify中心 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text白 bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 mt-2 transition-colors"
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
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <h3 className="text-xl font-bold text-gray-900">科研项目详情</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-8">
          {/* Status Visualization */}
          <div className="flex justify-between items-center mb-10 relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 transform -translate-y-1/2"></div>
            {steps.map((step, idx) => {
               const isActive = idx <= currentStepIndex;
               const isFinalRejected = item.status === 'Rejected' && idx === 2;
               let colorClass = isActive ? 'bg-indigo-600 text-white border-indigo-600 ring-4 ring-indigo-200 scale-110' : 'bg-white text-gray-400 border-gray-300';
               if (isFinalRejected) colorClass = 'bg-red-600 text-white border-red-600 ring-4 ring-red-200 scale-110';

               return (
                 <div key={idx} className="flex flex-col items-center bg-white px-2">
                   <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center mb-2 ${colorClass}`}>
                     <step.icon className="w-5 h-5" />
                   </div>
                   <span className={`text-xs font-medium ${isActive ? (isFinalRejected ? 'text-red-600' : 'text-indigo-600') : 'text-gray-500'}`}>{step.label}</span>
                 </div>
               );
            })}
          </div>
          <div className="mb-6">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
              item.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-100' :
              item.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
              item.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
              'bg-slate-50 text-slate-600 border-slate-200'
            }`}>
              当前状态：{item.status === 'Rejected' ? '已驳回' : item.status === 'Approved' ? '已通过' : item.status === 'Pending' ? '审核中' : '草稿'}
            </span>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">标题</label>
              <p className="text-lg font-medium text-gray-900">{item.title}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">类别</label>
                <p className="text-gray-900">{item.category || ((item as any)?.content_json?.source ? ((item as any).content_json.source) : '未提供')}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">负责人</label>
                <p className="text-gray-900">{item.authorName || '未提供'}</p>
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
                  <span className="text-gray-600 text-sm">未提供</span>
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
