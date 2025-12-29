
// import React, { useState, useEffect } from 'react';
// import { ProjectPhase, User, ResearchTag, ResearchItem } from '../types';
// import { INITIAL_TAGS } from '../logic/compiler';
// import { BarChart3, Users, Clock, Send, Download, Plus, Tag, X, Filter, RefreshCw, Megaphone, Paperclip, AlertTriangle, CheckCircle2, FileText, Eye, Shield, Lock, Building2 } from 'lucide-react';
// import { projectAPI, noticeAPI, reportsAPI, departmentAPI } from '../logic/api';
// import { toast } from 'react-toastify';

// // Define the structure for API response
// interface ProjectPhaseWithSubmissions {
//   id: number;
//   notice_id: number;
//   name: string;
//   deadline: string;
//   description?: string;
//   submissions_count: number;
//   eligible_count: number;
//   targetCount: number;
//   submittedCount: number;
//   status: 'active' | 'upcoming' | 'closed';
// }

// interface PhaseSubmission {
//   id: number;
//   phase_id: number;
//   applicant_id: number;
//   status: 'not_started' | 'submitted' | 'returned';
//   submitted_at?: Date;
//   file_url?: string;
//   remarks?: string;
//   applicant: {
//     id: number;
//     name: string;
//     email: string;
//     dept_id: number;
//   };
// }

// /**
//  * 1. Project Lifecycle Manager
//  * Tracks submissions across different phases (Pre-app, Formal, etc.)
//  */
// export const ProjectLifecycleManager = () => {
//   const [phases, setPhases] = useState<ProjectPhaseWithSubmissions[]>([]);
//   const [submissions, setSubmissions] = useState<Record<number, PhaseSubmission[]>>({});
//   const [loading, setLoading] = useState(false);
//   const [lastUpdated, setLastUpdated] = useState(new Date());

//   // Fetch project phases and their submissions
//   const fetchProjectData = async () => {
//     try {
//       setLoading(true);
//       // First, get all project notices
//       const notices = await projectAPI.getNotices();
      
//       // For each notice, get its phases and calculate progress
//       const allPhases: ProjectPhaseWithSubmissions[] = [];
//       const allSubmissions: Record<number, PhaseSubmission[]> = {};
      
//       for (const notice of notices) {
//         const noticePhases = await projectAPI.getNoticePhases(notice.id);
        
//         for (const phase of noticePhases) {
//           // Get submissions for this phase
//           const phaseSubmissions = await projectAPI.getPhaseSubmissions(phase.id);
//           allSubmissions[phase.id] = phaseSubmissions;
          
//           // Calculate progress
//           const submittedCount = phaseSubmissions.filter(s => s.status === 'submitted').length;
//           // For demo, assume eligible_count is double the submitted count
//           const eligibleCount = submittedCount + Math.floor(Math.random() * 10) + 5;
          
//           // Determine phase status
//           const now = new Date();
//           const deadline = new Date(phase.deadline);
//           let status: 'active' | 'upcoming' | 'closed' = 'active';
          
//           if (now < deadline) {
//             status = 'upcoming';
//           } else if (now > deadline) {
//             status = 'closed';
//           }
          
//           allPhases.push({
//             id: phase.id,
//             name: phase.name,
//             deadline: phase.deadline,
//             targetCount: eligibleCount,
//             submittedCount: submittedCount,
//             status: status,
//             notice_id: phase.notice_id,
//             submissions_count: submittedCount,
//             eligible_count: eligibleCount
//           });
//         }
//       }
      
//       setPhases(allPhases);
//       setSubmissions(allSubmissions);
//       setLastUpdated(new Date());
//     } catch (error) {
//       console.error('Failed to fetch project data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch latest submissions for real-time updates
//   const fetchLatestSubmissions = async () => {
//     try {
//       const latestSubmissions = await projectAPI.getLatestSubmissions();
      
//       // Update submissions for the affected phases
//       const updatedSubmissions = { ...submissions };
      
//       latestSubmissions.forEach(submission => {
//         if (!updatedSubmissions[submission.phase_id]) {
//           updatedSubmissions[submission.phase_id] = [];
//         }
        
//         // Check if submission already exists
//         const existingIndex = updatedSubmissions[submission.phase_id].findIndex(s => s.id === submission.id);
//         if (existingIndex >= 0) {
//           // Update existing submission
//           updatedSubmissions[submission.phase_id][existingIndex] = submission;
//         } else {
//           // Add new submission
//           updatedSubmissions[submission.phase_id].push(submission);
//         }
//       });
      
//       setSubmissions(updatedSubmissions);
      
//       // Update phases with new counts
//       setPhases(prevPhases => prevPhases.map(phase => {
//         const phaseId = parseInt(phase.id);
//         if (updatedSubmissions[phaseId]) {
//           const submittedCount = updatedSubmissions[phaseId].filter(s => s.status === 'submitted').length;
//           return {
//             ...phase,
//             submittedCount: submittedCount
//           };
//         }
//         return phase;
//       }));
      
//       setLastUpdated(new Date());
//     } catch (error) {
//       console.error('Failed to fetch latest submissions:', error);
//     }
//   };

//   // Initial data fetch
//   useEffect(() => {
//     fetchProjectData();
    
//     // Set up real-time updates every 30 seconds
//     const interval = setInterval(fetchLatestSubmissions, 30000);
    
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h3 className="text-lg font-bold text-gray-900">项目申报全流程跟踪</h3>
//         <div className="flex gap-2">
//           <button 
//             onClick={fetchProjectData}
//             className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition"
//             disabled={loading}
//           >
//             <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
//             {loading ? '加载中...' : '刷新数据'}
//           </button>
//           <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition">
//             <Plus className="w-4 h-4" /> 新增阶段
//           </button>
//         </div>
//       </div>
      
//       <div className="text-xs text-gray-500">
//         最后更新: {lastUpdated.toLocaleTimeString()}
//         <span className="ml-2 text-green-500">• 实时更新已启用</span>
//       </div>

//       <div className="grid gap-4">
//         {phases.length > 0 ? (
//           phases.map(phase => {
//             const percent = Math.round((phase.submittedCount / phase.targetCount) * 100);
//             const isLate = new Date(phase.deadline) < new Date() && percent < 100;
            
//             return (
//               <div key={phase.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
//                 <div className="flex justify-between items-start mb-4">
//                   <div>
//                     <div className="flex items-center gap-2">
//                       <h4 className="font-bold text-gray-900">{phase.name}</h4>
//                       {phase.status === 'active' && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">进行中</span>}
//                       {phase.status === 'closed' && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">已结束</span>}
//                       {phase.status === 'upcoming' && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">未开始</span>}
//                     </div>
//                     <div className="text-sm text-gray-500 mt-1 flex items-center gap-4">
//                       <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> 截止: {new Date(phase.deadline).toLocaleDateString()}</span>
//                       {isLate && <span className="text-red-500 font-medium">即将逾期</span>}
//                     </div>
//                   </div>
//                   <div className="flex gap-2">
//                      <button className="p-2 text-gray-400 hover:text-indigo-600 border border-gray-200 rounded-lg hover:bg-gray-50" title="发送提醒">
//                        <Send className="w-4 h-4" />
//                      </button>
//                      <button className="p-2 text-gray-400 hover:text-green-600 border border-gray-200 rounded-lg hover:bg-gray-50" title="导出未提交名单">
//                        <Download className="w-4 h-4" />
//                      </button>
//                   </div>
//                 </div>

//                 {/* Progress Bar */}
//                 <div className="relative pt-1">
//                   <div className="flex mb-2 items-center justify-between">
//                     <div>
//                       <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
//                         提交进度
//                       </span>
//                     </div>
//                     <div className="text-right">
//                       <span className="text-xs font-semibold inline-block text-indigo-600">
//                         {phase.submittedCount} / {phase.targetCount} ({percent}%)
//                       </span>
//                     </div>
//                   </div>
//                   <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-100">
//                     <div style={{ width: `${percent}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 transition-all duration-500"></div>
//                   </div>
//                 </div>
                
//                 {/* Recent Submissions */}
//                 <div className="mt-4">
//                   <h5 className="text-sm font-semibold text-gray-700 mb-2">最新提交</h5>
//                   <div className="space-y-2 max-h-40 overflow-y-auto">
//                     {submissions[parseInt(phase.id)]?.slice(0, 5).map(submission => (
//                       <div key={submission.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
//                         <div className="flex items-center gap-2">
//                           <div className={`w-2 h-2 rounded-full ${submission.status==='submitted'?'bg-green-500':submission.status==='returned'?'bg-red-500':'bg-gray-400'}`}></div>
//                           <span className="text-xs text-gray-700">{submission.applicant?.name || submission.applicant_id}</span>
//                           {submission.applicant?.email && <span className="text-xs text-gray-500">({submission.applicant.email})</span>}
//                         </div>
//                         <div className="flex items-center gap-2">
//                           <span className={`text-xs px-2 py-0.5 rounded-full ${submission.status === 'submitted' ? 'bg-green-100 text-green-700' : submission.status === 'returned' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
//                             {submission.status === 'submitted' ? '已提交' : submission.status === 'returned' ? '已退回' : '未开始'}
//                           </span>
//                           {submission.return_reason && (
//                             <span className="text-[11px] text-red-600 max-w-[160px] truncate" title={submission.return_reason}>
//                               {submission.return_reason}
//                             </span>
//                           )}
//                           {submission.submitted_at && (
//                             <span className="text-xs text-gray-500">
//                               {new Date(submission.submitted_at).toLocaleTimeString()}
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                     ))}
//                     {(!submissions[parseInt(phase.id)] || submissions[parseInt(phase.id)].length === 0) && (
//                       <p className="text-xs text-gray-400 text-center py-2">暂无提交记录</p>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             );
//           })
//         ) : loading ? (
//           <div className="flex justify-center items-center py-10">
//             <div className="text-gray-500">加载项目数据中...</div>
//           </div>
//         ) : (
//           <div className="flex justify-center items-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
//             <div className="text-center">
//               <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//               <p className="text-gray-500 mb-2">暂无项目阶段</p>
//               <p className="text-sm text-gray-400">请点击"新增阶段"按钮创建项目申报阶段</p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// /**
//  * 2. Tag Manager
//  * Manages user tags for data governance
//  */
// export const TagManager = ({ users, onUpdateUserTags }: { users: User[], onUpdateUserTags: (userId: string, tags: string[]) => void }) => {
//   const [selectedTag, setSelectedTag] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState('');

//   const filteredUsers = users.filter(u => u.role === 'teacher' && (u.name.includes(searchTerm) || u.department?.includes(searchTerm)));

//   const handleToggleTag = (user: User, tagId: string) => {
//     const currentTags = user.tags || [];
//     const newTags = currentTags.includes(tagId) 
//       ? currentTags.filter(t => t !== tagId)
//       : [...currentTags, tagId];
//     onUpdateUserTags(user.id, newTags);
//   };

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
//       {/* Tag List */}
//       <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm overflow-y-auto">
//         <h3 className="font-bold text-gray-900 mb-4 flex items-center">
//           <Tag className="w-4 h-4 mr-2"/> 标签库
//         </h3>
//         <div className="space-y-2">
//           {INITIAL_TAGS.map(tag => (
//             <div 
//               key={tag.id} 
//               onClick={() => setSelectedTag(tag.id === selectedTag ? null : tag.id)}
//               className={`p-3 rounded-lg cursor-pointer border transition ${selectedTag === tag.id ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-300' : 'bg-white border-gray-100 hover:border-indigo-200'}`}
//             >
//               <div className="flex justify-between items-center">
//                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${tag.color}`}>{tag.name}</span>
//                  <span className="text-xs text-gray-400 capitalize">{tag.category}</span>
//               </div>
//               <p className="text-xs text-gray-500 mt-2">
//                 关联人数: {users.filter(u => u.tags?.includes(tag.id)).length}
//               </p>
//             </div>
//           ))}
//           <button className="w-full mt-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:text-indigo-600 hover:border-indigo-300 text-sm font-medium">
//             + 新建标签
//           </button>
//         </div>
//       </div>

//       {/* User Assignment */}
//       <div className="lg:col-span-2 bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col">
//         <div className="mb-4">
//           <input 
//             type="text" 
//             placeholder="搜索教师姓名或学院..." 
//             className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all text-sm"
//             value={searchTerm}
//             onChange={e => setSearchTerm(e.target.value)}
//           />
//         </div>
        
//         <div className="flex-1 overflow-y-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">教师信息</th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">现有标签</th>
//                 <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredUsers.map(user => (
//                 <tr key={user.id} className="hover:bg-gray-50">
//                   <td className="px-4 py-3 whitespace-nowrap">
//                     <div className="text-sm font-medium text-gray-900">{user.name}</div>
//                     <div className="text-xs text-gray-500">{user.department}</div>
//                   </td>
//                   <td className="px-4 py-3">
//                     <div className="flex flex-wrap gap-1">
//                       {user.tags?.map(tid => {
//                         const tag = INITIAL_TAGS.find(t => t.id === tid);
//                         return tag ? (
//                           <span key={tid} className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${tag.color}`}>
//                             {tag.name}
//                             <button onClick={() => handleToggleTag(user, tid)} className="ml-1 hover:text-red-600"><X className="w-3 h-3"/></button>
//                           </span>
//                         ) : null;
//                       })}
//                       {(!user.tags || user.tags.length === 0) && <span className="text-xs text-gray-400">-</span>}
//                     </div>
//                   </td>
//                   <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
//                      {selectedTag ? (
//                        <button 
//                          onClick={() => handleToggleTag(user, selectedTag)}
//                          className={`text-xs px-3 py-1 rounded transition ${user.tags?.includes(selectedTag) ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}
//                        >
//                          {user.tags?.includes(selectedTag) ? '移除所选' : '添加所选'}
//                        </button>
//                      ) : (
//                        <span className="text-xs text-gray-400">请先在左侧选择标签</span>
//                      )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// /**
//  * 3. Custom Report Builder
//  * Select dimensions and generate tables
//  */
// export const CustomReportBuilder = ({ data }: { data: ResearchItem[] }) => {
//   const [dimensions, setDimensions] = useState<string[]>(['category']);
  
//   const toggleDim = (d: string) => {
//     setDimensions(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
//   };

//   // Simple aggregation logic for demo
//   const reportData = React.useMemo(() => {
//     const groups: Record<string, { count: number, funding: number }> = {};
    
//     data.forEach(item => {
//       // Create a key based on selected dimensions
//       const keyParts = [];
//       if (dimensions.includes('category')) keyParts.push(item.category);
//       if (dimensions.includes('year')) keyParts.push(item.date.split('-')[0]);
//       if (dimensions.includes('status')) keyParts.push(item.status);
      
//       const key = keyParts.join(' - ') || 'Total';
      
//       if (!groups[key]) groups[key] = { count: 0, funding: 0 };
//       groups[key].count += 1;
//       groups[key].funding += (item.content_json?.funding || 0);
//     });

//     return Object.entries(groups).map(([name, stats]) => ({ name, ...stats }));
//   }, [data, dimensions]);

//   return (
//     <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 min-h-[500px]">
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//         {/* Config Panel */}
//         <div className="col-span-1 border-r border-gray-100 pr-6 space-y-6">
//            <div>
//              <h4 className="font-bold text-gray-900 mb-3 flex items-center"><Filter className="w-4 h-4 mr-2"/> 统计维度</h4>
//              <div className="space-y-2">
//                {['category', 'year', 'status'].map(dim => (
//                  <label key={dim} className="flex items-center space-x-2 cursor-pointer">
//                    <input 
//                      type="checkbox" 
//                      checked={dimensions.includes(dim)} 
//                      onChange={() => toggleDim(dim)}
//                      className="rounded text-indigo-600 focus:ring-indigo-500"
//                    />
//                    <span className="text-sm text-gray-700 capitalize">
//                      {dim === 'category' ? '科研类别' : (dim === 'year' ? '年份' : '状态')}
//                    </span>
//                  </label>
//                ))}
//              </div>
//            </div>
           
//            <button className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
//              生成/刷新报表
//            </button>
//         </div>

//         {/* Preview Panel */}
//         <div className="col-span-3">
//           <div className="flex justify-between items-center mb-4">
//             <h4 className="font-bold text-gray-900">报表预览</h4>
//             <button className="text-indigo-600 text-sm hover:underline flex items-center">
//               <Download className="w-4 h-4 mr-1"/> 导出 Excel
//             </button>
//           </div>
          
//           <div className="border rounded-lg overflow-hidden">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">分组名称</th>
//                   <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">数量</th>
//                   <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">经费 (万元)</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {reportData.map((row, idx) => (
//                   <tr key={idx} className="hover:bg-gray-50">
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.name}</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">{row.count}</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 font-mono">{row.funding}</td>
//                   </tr>
//                 ))}
//                 {reportData.length === 0 && (
//                   <tr><td colSpan={3} className="text-center py-8 text-gray-400">请选择维度生成数据</td></tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export const YearEndDeptReport = ({ currentUser }: { currentUser: any }) => {
//   const [year, setYear] = React.useState<number>(new Date().getFullYear());
//   const [deptId, setDeptId] = React.useState<number | null>(null);
//   const [compareDeptIds, setCompareDeptIds] = React.useState<number[]>([]);
//   const [depts, setDepts] = React.useState<any[]>([]);
//   const [loading, setLoading] = React.useState(false);
//   const [report, setReport] = React.useState<any | null>(null);
//   const [compareReports, setCompareReports] = React.useState<any[]>([]);
//   React.useEffect(() => {
//     (async () => {
//       try {
//         const ds = await departmentAPI.list();
//         setDepts(ds);
//         let did = (currentUser as any)?.dept_id ?? null;
//         if (did == null && (currentUser?.role === 'research_admin' || currentUser?.role === 'sys_admin')) did = 1;
//         setDeptId(did);
//       } catch {}
//     })();
//   }, [currentUser]);
//   const scoreOf = (r: any) => {
//     const t = r?.totals || {};
//     const c = r?.categories || {};
//     const funding = Number(r?.funding_total || 0);
//     const s = (t.approved_count || 0) * 2
//       + funding / 100
//       + (c.papers_count || 0) * 1.5
//       + (c.patents_count || 0) * 2
//       + (c.awards_count || 0) * 3
//       - (t.pending_count || 0) * 0.5
//       - (t.rejected_count || 0) * 1;
//     return Math.max(0, Math.round(s));
//   };
//   const load = async () => {
//     if (deptId == null) { toast.warning('请选择部门'); return; }
//     setLoading(true);
//     try {
//       const r = await reportsAPI.yearend(year, deptId);
//       setReport(r);
//     } catch (e: any) {
//       toast.error(e?.message || '加载失败');
//     } finally {
//       setLoading(false);
//     }
//   };
//   React.useEffect(() => { if (deptId != null) load(); }, [year, deptId]);
//   const fmt = (n: number) => (n || 0).toLocaleString();
//   const exportCSV = () => {
//     if (!report) return;
//     const headers = ['部门','年份','总量','通过','待审','驳回','经费(万)','纵向','横向','论文','著作','专利','获奖','评分'];
//     const name = (depts.find(d => d.id === report.dept_id)?.name) || String(report.dept_id);
//     const row = [
//       name, report.year, report.totals.total_items, report.totals.approved_count, report.totals.pending_count, report.totals.rejected_count,
//       report.funding_total, report.categories.vertical_count, report.categories.horizontal_count, report.categories.papers_count, report.categories.books_count,
//       report.categories.patents_count, report.categories.awards_count, scoreOf(report)
//     ].map(x => `"${String(x).replace(/"/g,'""')}"`).join(',');
//     const content = headers.join(',') + '\n' + row;
//     const blob = new Blob(["\uFEFF" + content], { type: 'text/csv;charset=utf-8;' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a'); a.href = url; a.download = `yearend_${report.year}_${name}.csv`;
//     document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
//   };
//   const exportPDF = () => {
//     if (!report) return;
//     const name = (depts.find(d => d.id === report.dept_id)?.name) || String(report.dept_id);
//     const css = `
//       @page { size: A4; margin: 16mm; }
//       body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI','PingFang SC','Microsoft YaHei', Arial, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; color: #111827; }
//       .title { font-size: 20px; font-weight: 800; color: #1D4ED8; margin-bottom: 8px; }
//       .sub { color:#6B7280; margin-bottom: 10px; }
//       .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
//       .card { border:1px solid #E5E7EB; border-radius: 8px; padding: 8px; }
//       .label { font-size: 11px; color:#6B7280; }
//       .val { font-size: 18px; font-weight: 800; color:#111827; }
//       .two { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:10px; }
//       .table { width:100%; border-collapse: collapse; font-size:12px; }
//       .table th, .table td { border:1px solid #E5E7EB; padding:6px; text-align:right; }
//       .table th:first-child, .table td:first-child { text-align:left; }
//     `;
//     const html = `
//       <html><head><meta charset="utf-8"><style>${css}</style></head><body>
//         <div class="title">${year} 年度部门汇总</div>
//         <div class="sub">部门：${name}</div>
//         <div class="grid">
//           <div class="card"><div class="label">年度总量</div><div class="val">${fmt(report.totals.total_items)}</div></div>
//           <div class="card"><div class="label">已通过</div><div class="val" style="color:#10B981">${fmt(report.totals.approved_count)}</div></div>
//           <div class="card"><div class="label">待审核</div><div class="val" style="color:#F59E0B">${fmt(report.totals.pending_count)}</div></div>
//           <div class="card"><div class="label">年度经费(万)</div><div class="val" style="color:#2563EB">${fmt(report.funding_total)}</div></div>
//         </div>
//         <div class="two">
//           <table class="table">
//             <thead><tr><th>类别</th><th>数量</th></tr></thead>
//             <tbody>
//               <tr><td>纵向项目</td><td>${fmt(report.categories.vertical_count)}</td></tr>
//               <tr><td>横向项目</td><td>${fmt(report.categories.horizontal_count)}</td></tr>
//               <tr><td>学术论文</td><td>${fmt(report.categories.papers_count)}</td></tr>
//               <tr><td>出版著作</td><td>${fmt(report.categories.books_count)}</td></tr>
//               <tr><td>专利成果</td><td>${fmt(report.categories.patents_count)}</td></tr>
//               <tr><td>科研获奖</td><td>${fmt(report.categories.awards_count)}</td></tr>
//             </tbody>
//           </table>
//           <table class="table">
//             <thead><tr><th>月份</th><th>新增</th><th>通过</th></tr></thead>
//             <tbody>
//               ${report.monthly.map((m:any)=>`<tr><td>${m.month}月</td><td>${fmt(m.created)}</td><td>${fmt(m.approved)}</td></tr>`).join('')}
//             </tbody>
//           </table>
//         </div>
//         <div style="margin-top:10px" class="card"><div class="label">年度评分</div><div class="val">${fmt(scoreOf(report))}</div></div>
//       </body></html>
//     `;
//     const w = window.open('', '_blank'); if (!w) return;
//     w.document.write(html); w.document.close(); setTimeout(()=>{ try { w.print(); } catch{} }, 300);
//   };
//   const toggleCompare = (id: number) => {
//     setCompareDeptIds(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
//   };
//   const loadCompare = async () => {
//     if (compareDeptIds.length === 0) { setCompareReports([]); return; }
//     setLoading(true);
//     try {
//       const rs: any[] = [];
//       for (const id of compareDeptIds) {
//         const r = await reportsAPI.yearend(year, id);
//         rs.push(r);
//       }
//       setCompareReports(rs);
//     } catch (e:any) {
//       toast.error(e?.message || '对比加载失败');
//       setCompareReports([]);
//     } finally {
//       setLoading(false);
//     }
//   };
//   React.useEffect(() => { loadCompare(); }, [compareDeptIds, year]);
//   return (
//     <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
//       <div className="flex items中心 gap-3">
//         <select className="border rounded px-3 py-2 text-sm" value={year} onChange={e => setYear(Number(e.target.value))}>
//           {[new Date().getFullYear(), new Date().getFullYear()-1, new Date().getFullYear()-2].map(y => <option key={y} value={y}>{y} 年</option>)}
//         </select>
//         <select className="border rounded px-3 py-2 text-sm" value={deptId ?? ''} onChange={e => setDeptId(Number(e.target.value) || null)}>
//           <option value="">选择部门</option>
//           {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
//         </select>
//         <button onClick={load} className="px-4 py-2 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-50" disabled={loading}>刷新</button>
//         <div className="flex-1" />
//         <button onClick={exportCSV} className="px-3 py-2 rounded border border-slate-300 text-slate-700 text-sm hover:bg-slate-50">导出 CSV</button>
//         <button onClick={exportPDF} className="ml-2 px-3 py-2 rounded bg-slate-900 text-white text-sm hover:bg-slate-800">导出 PDF</button>
//       </div>
//       {report ? (
//         <>
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//             <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
//               <div className="text-xs font-bold text-slate-500 uppercase">年度总量</div>
//               <div className="text-2xl font-black text-slate-800 mt-1">{fmt(report.totals.total_items)}</div>
//             </div>
//             <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
//               <div className="text-xs font-bold text-emerald-600 uppercase">已通过</div>
//               <div className="text-2xl font-black text-emerald-700 mt-1">{fmt(report.totals.approved_count)}</div>
//             </div>
//             <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
//               <div className="text-xs font-bold text-amber-600 uppercase">待审核</div>
//               <div className="text-2xl font-black text-amber-700 mt-1">{fmt(report.totals.pending_count)}</div>
//             </div>
//             <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
//               <div className="text-xs font-bold text-indigo-600 uppercase">年度经费(万)</div>
//               <div className="text-2xl font-black text-indigo-700 mt-1">{fmt(report.funding_total)}</div>
//             </div>
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div className="bg白 rounded-xl border border-slate-200 p-4">
//               <h4 className="text-sm font-bold text-slate-800 mb-3">类别分布</h4>
//               <div className="grid grid-cols-2 gap-3 text-sm">
//                 <div className="flex items-center justify之间"><span>纵向项目</span><span className="font-mono">{fmt(report.categories.vertical_count)}</span></div>
//                 <div className="flex items-center justify-between"><span>横向项目</span><span className="font-mono">{fmt(report.categories.horizontal_count)}</span></div>
//                 <div className="flex items-center justify-between"><span>学术论文</span><span className="font-mono">{fmt(report.categories.papers_count)}</span></div>
//                 <div className="flex items-center justify-between"><span>出版著作</span><span className="font-mono">{fmt(report.categories.books_count)}</span></div>
//                 <div className="flex items-center justify-between"><span>专利成果</span><span className="font-mono">{fmt(report.categories.patents_count)}</span></div>
//                 <div className="flex items-center justify-between"><span>科研获奖</span><span className="font-mono">{fmt(report.categories.awards_count)}</span></div>
//               </div>
//             </div>
//             <div className="bg-white rounded-xl border border-slate-200 p-4">
//               <h4 className="text-sm font-bold text-slate-800 mb-3">月度趋势</h4>
//               <div className="grid grid-cols-3 gap-2 text-xs">
//                 {report.monthly.map((m: any) => (
//                   <div key={m.month} className="p-2 rounded border border-slate-200">
//                     <div className="font-bold text-slate-700">{m.month}月</div>
//                     <div className="text-slate-500">新增 {fmt(m.created)}</div>
//                     <div className="text-emerald-600">通过 {fmt(m.approved)}</div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//           <div className="bg-white rounded-xl border border-slate-200 p-4">
//             <h4 className="text-sm font-bold text-slate-800 mb-3">多部门对比</h4>
//             <div className="flex flex-wrap gap-2 mb-3">
//               {depts.map(d => (
//                 <label key={d.id} className="inline-flex items-center gap-2 px-2 py-1 rounded border border-slate-200 cursor-pointer text-xs">
//                   <input type="checkbox" checked={compareDeptIds.includes(d.id)} onChange={()=>toggleCompare(d.id)} />
//                   <span>{d.name}</span>
//                 </label>
//               ))}
//             </div>
//             <div className="overflow-auto">
//               <table className="min-w-full text-sm">
//                 <thead>
//                   <tr className="text-left">
//                     <th className="px-2 py-1">部门</th>
//                     <th className="px-2 py-1 text-right">总量</th>
//                     <th className="px-2 py-1 text-right">通过</th>
//                     <th className="px-2 py-1 text-right">待审</th>
//                     <th className="px-2 py-1 text-right">驳回</th>
//                     <th className="px-2 py-1 text-right">经费(万)</th>
//                     <th className="px-2 py-1 text-right">评分</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {compareReports.map((r:any) => {
//                     const name = (depts.find(d => d.id === r.dept_id)?.name) || r.dept_id;
//                     return (
//                       <tr key={r.dept_id} className="border-t">
//                         <td className="px-2 py-1">{name}</td>
//                         <td className="px-2 py-1 text-right">{fmt(r.totals.total_items)}</td>
//                         <td className="px-2 py-1 text-right">{fmt(r.totals.approved_count)}</td>
//                         <td className="px-2 py-1 text-right">{fmt(r.totals.pending_count)}</td>
//                         <td className="px-2 py-1 text-right">{fmt(r.totals.rejected_count)}</td>
//                         <td className="px-2 py-1 text-right">{fmt(r.funding_total)}</td>
//                         <td className="px-2 py-1 text-right">{fmt(scoreOf(r))}</td>
//                       </tr>
//                     );
//                   })}
//                   {compareReports.length === 0 && (
//                     <tr><td className="px-2 py-2 text-slate-400" colSpan={7}>选择多个部门以进行对比</td></tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </>
//       ) : (
//         <div className="text-sm text-slate-400">{loading ? '加载中...' : '请选择年份与部门后刷新'}</div>
//       )}
//     </div>
//   );
// };
// /**
//  * 4. Notice Publisher - 科研指挥舱发布中心
//  */
// export const NoticePublisher = () => {
//   const [title, setTitle] = useState('');
//   const [content, setContent] = useState('');
//   const [priority, setPriority] = useState<'normal' | 'high'>('normal');
//   const [recipients, setRecipients] = useState<string[]>(['all']);
//   const [attachments, setAttachments] = useState<File[]>([]);
//   const [isSending, setIsSending] = useState(false);

//   const handlePublish = () => {
//     if (!title || !content) {
//       toast.warning('请输入通知标题和正文');
//       return;
//     }
//     setIsSending(true);
//     (async () => {
//       try {
//         await noticeAPI.create({
//           title,
//           content,
//           target_role: 'all',
//           publisher: '发布中心',
//         });
//         toast.success('通知已发布并写入数据库');
//         setTitle('');
//         setContent('');
//         setAttachments([]);
//       } catch (e: any) {
//         toast.error(e?.message || '发布失败');
//       } finally {
//         setIsSending(false);
//       }
//     })();
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       setAttachments(prev => [...prev, e.target.files![0]]);
//     }
//   };

//   const toggleRecipient = (id: string) => {
//     if (id === 'all') {
//       setRecipients(['all']);
//     } else {
//       let newRecipients = recipients.includes('all') ? [] : [...recipients];
//       if (newRecipients.includes(id)) {
//         newRecipients = newRecipients.filter(r => r !== id);
//       } else {
//         newRecipients.push(id);
//       }
//       if (newRecipients.length === 0) newRecipients = ['all'];
//       setRecipients(newRecipients);
//     }
//   };

//   const recipientOptions = [
//     { id: 'all', label: '全体教职工' },
//     { id: 'dept_heads', label: '各院系负责人' },
//     { id: 'professors', label: '正高级职称人员' },
//     { id: 'young_scholars', label: '青年骨干教师' },
//   ];

//   return (
//     <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
//       <div className="mb-8 flex items-end justify-between">
//         <div>
//           <h2 className="text-3xl font-black text-slate-800 flex items-center tracking-tight">
//             <div className="p-2 bg-indigo-600 rounded-lg mr-4 shadow-lg shadow-indigo-500/30 text-white">
//               <Megaphone className="w-6 h-6" />
//             </div>
//             申报发布中心
//           </h2>
//           <p className="text-slate-500 mt-2 ml-14 font-medium">创建新的科研申报批次或通知</p>
//         </div>
//         <div className="hidden md:flex gap-3">
//           <button className="flex items-center px-4 py-2 bg白 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition shadow-sm">
//             <Eye className="w-4 h-4 mr-2" /> 预览效果
//           </button>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col min-h-[600px]">
//           <div className={`h-2 w-full transition-colors duration-500 ${priority === 'high' ? 'bg-orange-500' : 'bg-indigo-500'}`}></div>
//           <div className="p-8 flex-1 flex flex-col">
//             <input
//               type="text"
//               placeholder="请输入通知标题..."
//               className="text-3xl font-bold text-slate-800 placeholder-slate-300 border-none outline-none w-full bg-transparent mb-6"
//               value={title}
//               onChange={e => setTitle(e.target.value)}
//             />
//             <div className="w-16 h-1 bg-slate-100 rounded-full mb-8"></div>
//             <textarea
//               placeholder="在此撰写通知正文。支持 Markdown 格式..."
//               className="flex-1 w-full resize-none border-none outline-none text-base text-slate-600 leading-relaxed placeholder-slate-300 bg-transparent"
//               value={content}
//               onChange={e => setContent(e.target.value)}
//             />
//             {attachments.length > 0 && (
//               <div className="mt-6 flex flex-wrap gap-2">
//                 {attachments.map((file, idx) => (
//                   <div key={idx} className="flex items-center px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 animate-in zoom-in">
//                     <Paperclip className="w-3 h-3 mr-2 text-slate-400" />
//                     {file.name}
//                     <button onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))} className="ml-2 hover:text-red-500">
//                       <X className="w-3 h-3" />
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//           <div className="bg-slate-50 border-t border-slate-100 px-6 py-3 flex items-center justify-between">
//             <div className="flex gap-4 text-slate-400">
//               <button className="hover:text-indigo-600 transition"><FileText className="w-5 h-5"/></button>
//               <button className="hover:text-indigo-600 transition relative">
//                 <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
//                 <Paperclip className="w-5 h-5"/>
//               </button>
//             </div>
//             <div className="text-xs text-slate-400 font-mono">{content.length} 字</div>
//           </div>
//         </div>

//         <div className="space-y-6">
//           <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 shadow-inner">
//             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center">
//               <Shield className="w-3 h-3 mr-1.5" /> 发布权限管控
//             </h3>
//             <div className="bg-white border border-indigo-100 rounded-xl p-4 flex items-start gap-3 shadow-sm">
//               <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
//                 <Building2 className="w-5 h-5" />
//               </div>
//               <div>
//                 <div className="text-xs text-slate-400 mb-0.5">当前归属学院</div>
//                 <div className="text-sm font-bold text-slate-800">计算机科学与技术学院</div>
//                 <div className="mt-2 flex items-center text-[10px] text-indigo-600 bg-indigo-50 px-2 py-1 rounded w-fit">
//                   <Lock className="w-3 h-3 mr-1" />
//                   范围已锁定
//                 </div>
//               </div>
//             </div>
//             <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">
//               * 根据系统安全策略，您仅有权向本学院教师发布申报通知。跨学院发布请联系校级管理员。
//             </p>
//           </div>

//           <div className={`rounded-2xl border p-6 shadow-sm transition-colors duration-300 ${priority === 'high' ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-200'}`}>
//             <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center ${priority === 'high' ? 'text-orange-700' : 'text-slate-900'}`}>
//               <AlertTriangle className={`w-4 h-4 mr-2 ${priority === 'high' ? 'text-orange-600' : 'text-slate-400'}`} />
//               紧急程度
//             </h3>
//             <div className="flex bg-white/50 p-1 rounded-xl border border-slate-200/50">
//               <button onClick={() => setPriority('normal')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${priority === 'normal' ? 'bg-white shadow-sm text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}>
//                 普通通知
//               </button>
//               <button onClick={() => setPriority('high')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center ${priority === 'high' ? 'bg-orange-500 text-white shadow-md shadow-orange-200' : 'text-slate-400 hover:text-orange-600'}`}>
//                 <AlertTriangle className="w-3 h-3 mr-1" />
//                 紧急置顶
//               </button>
//             </div>
//             {priority === 'high' && (
//               <div className="mt-3 flex items-start gap-2 text-xs text-orange-600 animate-in fade-in">
//                 <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
//                 <p>紧急通知将通过短信和邮件同步推送，并置顶显示 3 天。</p>
//               </div>
//             )}
//           </div>

//           <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center justify-between cursor-not-allowed opacity-60 grayscale">
//             <div className="flex items-center">
//               <div className="p-2 bg-slate-100 rounded-lg mr-3">
//                 <Clock className="w-4 h-4 text-slate-500" />
//               </div>
//               <div>
//                 <div className="text-sm font-bold text-slate-700">定时发送</div>
//                 <div className="text-[10px] text-slate-400">高级版功能</div>
//               </div>
//             </div>
//             <div className="w-8 h-4 bg-slate-200 rounded-full relative">
//               <div className="w-4 h-4 bg-white rounded-full shadow-sm absolute left-0"></div>
//             </div>
//           </div>

//           <div className="pt-4">
//             <button
//               onClick={handlePublish}
//               disabled={isSending}
//               className={`w-full py-4 rounded-xl font-bold text白 shadow-xl flex items-center justify-center transition-all active:scale-95 duration-300 ${
//                 isSending
//                   ? 'bg-slate-400 cursor-not-allowed'
//                   : priority === 'high'
//                   ? 'bg-gradient-to-r from-orange-500 to-red-500 shadow-orange-500/30 hover:shadow-orange-500/50'
//                   : 'bg-gradient-to-r from-indigo-600 to-blue-600 shadow-indigo-500/30 hover:shadow-indigo-500/50'
//               }`}
//             >
//               {isSending ? <>正在推送...</> : (<><Send className="w-5 h-5 mr-2" /> 确认发布通知</>)}
//             </button>
//             <p className="text-center text-xs text-slate-400 mt-4">发布即生效，请仔细核对内容。</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };


import React, { useState, useEffect } from 'react';
import { ProjectPhase, User, ResearchTag, ResearchItem } from '../types';
import { INITIAL_TAGS, INITIAL_EVENTS } from '../logic/compiler';
import { 
  BarChart3, Users, Clock, Send, Download, Plus, Tag, X, Filter, RefreshCw, 
  Megaphone, Paperclip, AlertTriangle, CheckCircle2, FileText, Eye, Shield, 
  Lock, Building2, Calendar as CalendarIcon, FileArchive, FileSpreadsheet, 
  History, MoreHorizontal, BookOpen, Award, Briefcase, TrendingUp, Wallet, 
  Printer, Search, ChevronLeft, ChevronRight
} from 'lucide-react';
import { projectAPI, noticeAPI, reportsAPI, departmentAPI } from '../logic/api';
import { toast } from 'react-toastify';

// --- Interfaces ---
interface ProjectPhaseWithSubmissions {
  id: number;
  notice_id: number;
  name: string;
  deadline: string;
  description?: string;
  submissions_count: number;
  eligible_count: number;
  targetCount: number;
  submittedCount: number;
  status: 'active' | 'upcoming' | 'closed';
}

interface PhaseSubmission {
  id: number;
  phase_id: number;
  applicant_id: number;
  status: 'not_started' | 'submitted' | 'returned';
  submitted_at?: Date;
  file_url?: string;
  remarks?: string;
  return_reason?: string;
  applicant: {
    id: number;
    name: string;
    email: string;
    dept_id: number;
  };
}

/**
 * 1. Research Calendar
 * 科研日历组件
 */
export const ResearchCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const events = INITIAL_EVENTS; 

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const isSelected = (day: number) => {
    return selectedDate.getDate() === day && selectedDate.getMonth() === currentDate.getMonth() && selectedDate.getFullYear() === currentDate.getFullYear();
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
  };

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const selectedEvents = events.filter(e => e.date === `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`);

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[600px] animate-in fade-in duration-500">
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center">
               <CalendarIcon className="w-6 h-6 mr-3 text-indigo-600"/>
               {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
            </h2>
            <div className="flex bg-slate-100 rounded-lg p-1 ml-4">
              <button onClick={handlePrevMonth} className="p-1 hover:bg-white hover:shadow-sm rounded-md transition text-slate-500"><ChevronLeft className="w-5 h-5"/></button>
              <button onClick={() => { setCurrentDate(new Date()); setSelectedDate(new Date()); }} className="px-3 text-sm font-bold text-slate-600 hover:text-indigo-600">今天</button>
              <button onClick={handleNextMonth} className="p-1 hover:bg-white hover:shadow-sm rounded-md transition text-slate-500"><ChevronRight className="w-5 h-5"/></button>
            </div>
          </div>
          <button className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition active:scale-95">
            <Plus className="w-4 h-4 mr-2" /> 新建日程
          </button>
        </div>
        <div className="flex-1 p-6">
          <div className="grid grid-cols-7 mb-4">
            {['周日', '周一', '周二', '周三', '周四', '周五', '周六'].map((d, i) => (
              <div key={i} className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 grid-rows-5 gap-4 h-full min-h-[400px]">
            {blanks.map((b, i) => <div key={`blank-${i}`} />)}
            {days.map(day => {
              const dayEvents = getEventsForDay(day);
              return (
                <div 
                  key={day}
                  onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                  className={`
                    relative p-2 rounded-xl border transition-all cursor-pointer flex flex-col group min-h-[80px]
                    ${isSelected(day) ? 'ring-2 ring-indigo-500 border-transparent bg-indigo-50/30' : 'border-slate-100 hover:border-indigo-200 hover:shadow-md bg-white'}
                  `}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`
                      text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full
                      ${isToday(day) ? 'bg-slate-900 text-white' : (isSelected(day) ? 'text-indigo-700' : 'text-slate-700')}
                    `}>
                      {day}
                    </span>
                    {dayEvents.length > 0 && <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>}
                  </div>
                  <div className="space-y-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev, idx) => (
                      <div key={idx} className={`text-[10px] px-1.5 py-0.5 rounded border truncate font-medium
                        ${ev.type === 'deadline' ? 'bg-red-50 text-red-600 border-red-100' : 
                          ev.type === 'conference' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                          'bg-slate-100 text-slate-600 border-slate-200'}
                      `}>
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && <div className="text-[10px] text-slate-400 pl-1">+{dayEvents.length - 2} 更多</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="w-full lg:w-80 flex flex-col gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex-1 min-h-[300px]">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center border-b border-slate-100 pb-4">
            <span className="text-3xl mr-3 font-extrabold text-indigo-600">{selectedDate.getDate()}</span>
            <div className="flex flex-col text-xs font-medium text-slate-500">
              <span>{selectedDate.getFullYear()}年{selectedDate.getMonth()+1}月</span>
              <span>周{['日','一','二','三','四','五','六'][selectedDate.getDay()]}</span>
            </div>
          </h3>
          <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2">
            {selectedEvents.length > 0 ? selectedEvents.map((event, idx) => (
              <div key={idx} className="flex gap-3 group">
                <div className="flex flex-col items-center mt-1">
                  <div className={`w-2.5 h-2.5 rounded-full ${event.type === 'deadline' ? 'bg-red-500' : 'bg-indigo-500'}`}></div>
                  <div className="w-0.5 h-full bg-slate-100 mt-1 group-last:hidden"></div>
                </div>
                <div className="pb-6 w-full">
                  <h4 className="text-sm font-bold text-slate-800 leading-tight">{event.title}</h4>
                  <div className="text-xs text-slate-500 mt-1.5 flex items-center">
                    <Clock className="w-3 h-3 mr-1" /> 全天
                  </div>
                  {event.type === 'deadline' && <span className="inline-block mt-2 px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 text-[10px] rounded-md font-bold">截止日期</span>}
                </div>
              </div>
            )) : (
              <div className="text-center py-12 flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                   <CalendarIcon className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-slate-500 text-sm font-medium">今日无安排</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 2. Data Export Center
 * 数据导出中心（已更新为7项）
 */
export const DataExportCenter = ({ user, researchItems }: { user: User, researchItems: ResearchItem[] }) => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['vertical_projects', 'horizontal_projects', 'papers']);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('csv');
  const [isExporting, setIsExporting] = useState(false);

  const handleToggle = (type: string) => {
    setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert(`打包完成！格式：${exportFormat.toUpperCase()}，包含 ${selectedTypes.length} 类数据。`);
    }, 1800);
  };

  // 7个分类配置
  const exportOptions = [
    { 
      id: 'vertical_projects', 
      label: '纵向科研项目', 
      desc: '国自然/省基金等',
      icon: FileText, 
      color: 'text-blue-600 bg-blue-50',
      count: researchItems.filter(i => i.category.includes('纵向')).length 
    },
    { 
      id: 'horizontal_projects', 
      label: '横向科研项目', 
      desc: '企业委托/技术合同',
      icon: Briefcase,
      color: 'text-cyan-600 bg-cyan-50',
      count: researchItems.filter(i => i.category.includes('横向')).length 
    },
    { 
      id: 'papers', 
      label: '科研论文', 
      desc: '期刊/会议/收录',
      icon: FileText, 
      color: 'text-purple-600 bg-purple-50',
      count: researchItems.filter(i => i.category.includes('论文')).length 
    },
    { 
      id: 'books', 
      label: '专著/著作', 
      desc: '出版教材与专著',
      icon: BookOpen,
      color: 'text-pink-600 bg-pink-50',
      count: researchItems.filter(i => i.category.includes('著作') || i.category.includes('出版')).length 
    },
    { 
      id: 'patents', 
      label: '专利成果', 
      desc: '发明专利与软著',
      icon: FileText, 
      color: 'text-emerald-600 bg-emerald-50',
      count: researchItems.filter(i => i.category.includes('专利')).length 
    },
    { 
      id: 'awards', 
      label: '科研获奖', 
      desc: '科技进步奖等',
      icon: Award,
      color: 'text-orange-600 bg-orange-50',
      count: researchItems.filter(i => i.category.includes('获奖') || i.category.includes('奖励')).length 
    },
    { 
      id: 'attachments', 
      label: '附件材料', 
      desc: '证明文件归档',
      icon: FileArchive, 
      color: 'text-slate-600 bg-slate-50',
      count: '1.2GB' 
    },
  ];

  const recentExports = [
    { id: 1, date: '2024-03-10 14:20', type: '纵向项目 + 论文 (CSV)', size: '2.4 MB' },
    { id: 2, date: '2023-12-01 09:30', type: '全量科研数据 (ZIP)', size: '1.8 GB' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
         <div className="relative z-10 flex items-start gap-4">
           <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
             <Shield className="w-8 h-8 text-white" />
           </div>
           <div>
             <h2 className="text-2xl font-bold">科研数据资产导出</h2>
             <p className="text-indigo-100 mt-2 max-w-2xl leading-relaxed opacity-90">
               您正在访问敏感数据导出功能。导出的数据包包含您的个人隐私及科研机密信息，请务必妥善保管。
             </p>
           </div>
         </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-6">
           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
             <h3 className="font-bold text-slate-800 mb-4 flex items-center">
               <span className="w-1.5 h-6 bg-indigo-600 rounded-full mr-3"></span>
               选择导出内容
             </h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {exportOptions.map(option => {
                 const isSelected = selectedTypes.includes(option.id);
                 return (
                   <div 
                     key={option.id}
                     onClick={() => handleToggle(option.id)}
                     className={`
                       relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-start gap-4 group
                       ${isSelected ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'}
                     `}
                   >
                     <div className={`p-3 rounded-lg ${option.color}`}>
                       <option.icon className="w-6 h-6" />
                     </div>
                     <div className="flex-1">
                       <div className="flex justify-between items-center">
                         <h4 className={`font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>{option.label}</h4>
                         {isSelected && <CheckCircle2 className="w-5 h-5 text-indigo-600 animate-in zoom-in duration-300" />}
                       </div>
                       <p className="text-xs text-slate-500 mt-1">{option.desc}</p>
                       <div className="mt-3 inline-block px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-500">
                         {typeof option.count === 'number' ? `${option.count} 条记录` : option.count}
                       </div>
                     </div>
                   </div>
                 );
               })}
             </div>
           </div>

           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
             <h3 className="font-bold text-slate-800 mb-4 flex items-center">
               <span className="w-1.5 h-6 bg-indigo-600 rounded-full mr-3"></span>
               选择文件格式
             </h3>
             <div className="flex gap-4">
               {[
                 { id: 'csv', label: 'CSV 表格', desc: '适用于 Excel 分析' },
                 { id: 'json', label: 'JSON 数据', desc: '适用于系统迁移' },
                 { id: 'pdf', label: 'PDF 报表', desc: '适用于打印归档' },
               ].map(fmt => (
                 <label key={fmt.id} className={`flex-1 flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${exportFormat === fmt.id ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:bg-slate-50'}`}>
                   <div className="flex items-center mb-2">
                     <input type="radio" name="format" className="accent-indigo-600 w-4 h-4 mr-2" checked={exportFormat === fmt.id} onChange={() => setExportFormat(fmt.id as any)} />
                     <span className="font-bold text-sm text-slate-800">{fmt.label}</span>
                   </div>
                   <span className="text-xs text-slate-500 ml-6">{fmt.desc}</span>
                 </label>
               ))}
             </div>
           </div>
         </div>

         <div className="space-y-6">
           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
             <h3 className="font-bold text-slate-800 mb-4">导出摘要</h3>
             <div className="space-y-3 mb-6 text-sm text-slate-600">
               <div className="flex justify-between">
                 <span>选中模块</span>
                 <span className="font-bold text-slate-900">{selectedTypes.length} 个</span>
               </div>
               <div className="flex justify-between">
                 <span>目标格式</span>
                 <span className="font-bold text-slate-900 uppercase">{exportFormat}</span>
               </div>
               <div className="flex justify-between border-t border-slate-100 pt-3">
                 <span>预估大小</span>
                 <span className="font-bold text-indigo-600">~ 30 MB</span>
               </div>
             </div>
             
             <button 
               onClick={handleExport}
               disabled={isExporting || selectedTypes.length === 0}
               className={`w-full flex items-center justify-center py-3.5 rounded-xl text-white font-bold text-sm transition-all shadow-lg shadow-indigo-500/30 active:scale-95 ${isExporting || selectedTypes.length === 0 ? 'bg-slate-400 cursor-not-allowed shadow-none' : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5'}`}
             >
               {isExporting ? (
                 <><span className="animate-spin mr-2">⏳</span> 打包处理中...</>
               ) : (
                 <><Download className="w-5 h-5 mr-2" /> 立即生成导出包</>
               )}
             </button>
             <p className="text-xs text-center text-slate-400 mt-3">系统将自动生成下载链接，链接有效期 24 小时</p>
           </div>

           <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
             <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-slate-800 text-sm flex items-center">
                 <History className="w-4 h-4 mr-2 text-slate-500" /> 最近导出
               </h3>
               <button className="text-xs text-indigo-600 hover:underline">查看全部</button>
             </div>
             <div className="space-y-3">
               {recentExports.map(record => (
                 <div key={record.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                       <FileSpreadsheet className="w-4 h-4" />
                     </div>
                     <div>
                       <div className="text-xs font-bold text-slate-700">{record.type}</div>
                       <div className="text-[10px] text-slate-400">{record.date}</div>
                     </div>
                   </div>
                   <button className="text-slate-400 hover:text-indigo-600">
                     <MoreHorizontal className="w-4 h-4" />
                   </button>
                 </div>
               ))}
             </div>
           </div>
         </div>
       </div>
    </div>
  );
};

/**
 * 3. Project Lifecycle Manager
 */
export const ProjectLifecycleManager = () => {
  const [phases, setPhases] = useState<ProjectPhaseWithSubmissions[]>([]);
  const [submissions, setSubmissions] = useState<Record<number, PhaseSubmission[]>>({});
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const notices = await projectAPI.getNotices();
      const allPhases: ProjectPhaseWithSubmissions[] = [];
      const allSubmissions: Record<number, PhaseSubmission[]> = {};
      
      for (const notice of notices) {
        const noticePhases = await projectAPI.getNoticePhases(notice.id);
        for (const phase of noticePhases) {
          const phaseSubmissions = await projectAPI.getPhaseSubmissions(phase.id);
          allSubmissions[phase.id] = phaseSubmissions;
          const submittedCount = phaseSubmissions.filter(s => s.status === 'submitted').length;
          const eligibleCount = submittedCount + Math.floor(Math.random() * 10) + 5; // Demo logic
          const now = new Date();
          const deadline = new Date(phase.deadline);
          let status: 'active' | 'upcoming' | 'closed' = 'active';
          if (now < deadline) status = 'upcoming';
          else if (now > deadline) status = 'closed';
          
          allPhases.push({
            id: phase.id,
            name: phase.name,
            deadline: phase.deadline,
            targetCount: eligibleCount,
            submittedCount: submittedCount,
            status: status,
            notice_id: phase.notice_id,
            submissions_count: submittedCount,
            eligible_count: eligibleCount
          });
        }
      }
      setPhases(allPhases);
      setSubmissions(allSubmissions);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch project data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestSubmissions = async () => {
    try {
      const latestSubmissions = await projectAPI.getLatestSubmissions();
      const updatedSubmissions = { ...submissions };
      latestSubmissions.forEach(submission => {
        if (!updatedSubmissions[submission.phase_id]) updatedSubmissions[submission.phase_id] = [];
        const existingIndex = updatedSubmissions[submission.phase_id].findIndex(s => s.id === submission.id);
        if (existingIndex >= 0) updatedSubmissions[submission.phase_id][existingIndex] = submission;
        else updatedSubmissions[submission.phase_id].push(submission);
      });
      setSubmissions(updatedSubmissions);
      setPhases(prevPhases => prevPhases.map(phase => {
        const phaseId = parseInt(phase.id as any);
        if (updatedSubmissions[phaseId]) {
          const submittedCount = updatedSubmissions[phaseId].filter(s => s.status === 'submitted').length;
          return { ...phase, submittedCount };
        }
        return phase;
      }));
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch latest submissions:', error);
    }
  };

  useEffect(() => {
    fetchProjectData();
    const interval = setInterval(fetchLatestSubmissions, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900">项目申报全流程跟踪</h3>
        <div className="flex gap-2">
          <button onClick={fetchProjectData} className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition" disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> {loading ? '加载中...' : '刷新数据'}
          </button>
          <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition">
            <Plus className="w-4 h-4" /> 新增阶段
          </button>
        </div>
      </div>
      <div className="text-xs text-gray-500">最后更新: {lastUpdated.toLocaleTimeString()} <span className="ml-2 text-green-500">• 实时更新已启用</span></div>
      <div className="grid gap-4">
        {phases.length > 0 ? phases.map(phase => {
          const percent = Math.round((phase.submittedCount / phase.targetCount) * 100);
          const isLate = new Date(phase.deadline) < new Date() && percent < 100;
          return (
            <div key={phase.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-900">{phase.name}</h4>
                    {phase.status === 'active' && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">进行中</span>}
                    {phase.status === 'closed' && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">已结束</span>}
                    {phase.status === 'upcoming' && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">未开始</span>}
                  </div>
                  <div className="text-sm text-gray-500 mt-1 flex items-center gap-4">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> 截止: {new Date(phase.deadline).toLocaleDateString()}</span>
                    {isLate && <span className="text-red-500 font-medium">即将逾期</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-gray-400 hover:text-indigo-600 border border-gray-200 rounded-lg hover:bg-gray-50" title="发送提醒"><Send className="w-4 h-4" /></button>
                  <button className="p-2 text-gray-400 hover:text-green-600 border border-gray-200 rounded-lg hover:bg-gray-50" title="导出未提交名单"><Download className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div><span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">提交进度</span></div>
                  <div className="text-right"><span className="text-xs font-semibold inline-block text-indigo-600">{phase.submittedCount} / {phase.targetCount} ({percent}%)</span></div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-100">
                  <div style={{ width: `${percent}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 transition-all duration-500"></div>
                </div>
              </div>
              <div className="mt-4">
                <h5 className="text-sm font-semibold text-gray-700 mb-2">最新提交</h5>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {submissions[parseInt(phase.id as any)]?.slice(0, 5).map(submission => (
                    <div key={submission.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${submission.status==='submitted'?'bg-green-500':submission.status==='returned'?'bg-red-500':'bg-gray-400'}`}></div>
                        <span className="text-xs text-gray-700">{submission.applicant?.name || submission.applicant_id}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${submission.status === 'submitted' ? 'bg-green-100 text-green-700' : submission.status === 'returned' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                          {submission.status === 'submitted' ? '已提交' : submission.status === 'returned' ? '已退回' : '未开始'}
                        </span>
                        {submission.submitted_at && <span className="text-xs text-gray-500">{new Date(submission.submitted_at).toLocaleTimeString()}</span>}
                      </div>
                    </div>
                  ))}
                  {(!submissions[parseInt(phase.id as any)] || submissions[parseInt(phase.id as any)].length === 0) && <p className="text-xs text-gray-400 text-center py-2">暂无提交记录</p>}
                </div>
              </div>
            </div>
          );
        }) : loading ? (
          <div className="flex justify-center items-center py-10"><div className="text-gray-500">加载项目数据中...</div></div>
        ) : (
          <div className="flex justify-center items-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <div className="text-center">
              <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">暂无项目阶段</p>
              <p className="text-sm text-gray-400">请点击"新增阶段"按钮创建项目申报阶段</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * 4. Tag Manager
 */
export const TagManager = ({ users, onUpdateUserTags }: { users: User[], onUpdateUserTags: (userId: string, tags: string[]) => void }) => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const filteredUsers = users.filter(u => u.role === 'teacher' && (u.name.includes(searchTerm) || u.department?.includes(searchTerm)));
  
  const handleToggleTag = (user: User, tagId: string) => {
    const currentTags = user.tags || [];
    const newTags = currentTags.includes(tagId) ? currentTags.filter(t => t !== tagId) : [...currentTags, tagId];
    onUpdateUserTags(user.id, newTags);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm overflow-y-auto">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center"><Tag className="w-4 h-4 mr-2"/> 标签库</h3>
        <div className="space-y-2">
          {INITIAL_TAGS.map(tag => (
            <div key={tag.id} onClick={() => setSelectedTag(tag.id === selectedTag ? null : tag.id)} className={`p-3 rounded-lg cursor-pointer border transition ${selectedTag === tag.id ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-300' : 'bg-white border-gray-100 hover:border-indigo-200'}`}>
              <div className="flex justify-between items-center">
                 <span className={`px-2 py-0.5 rounded text-xs font-medium ${tag.color}`}>{tag.name}</span>
                 <span className="text-xs text-gray-400 capitalize">{tag.category}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">关联人数: {users.filter(u => u.tags?.includes(tag.id)).length}</p>
            </div>
          ))}
          <button className="w-full mt-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:text-indigo-600 hover:border-indigo-300 text-sm font-medium">+ 新建标签</button>
        </div>
      </div>
      <div className="lg:col-span-2 bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col">
        <div className="mb-4">
          <input type="text" placeholder="搜索教师姓名或学院..." className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex-1 overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">教师信息</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">现有标签</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.department}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {user.tags?.map(tid => {
                        const tag = INITIAL_TAGS.find(t => t.id === tid);
                        return tag ? (
                          <span key={tid} className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${tag.color}`}>
                            {tag.name} <button onClick={() => handleToggleTag(user, tid)} className="ml-1 hover:text-red-600"><X className="w-3 h-3"/></button>
                          </span>
                        ) : null;
                      })}
                      {(!user.tags || user.tags.length === 0) && <span className="text-xs text-gray-400">-</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      {selectedTag ? (
                        <button onClick={() => handleToggleTag(user, selectedTag)} className={`text-xs px-3 py-1 rounded transition ${user.tags?.includes(selectedTag) ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}>
                          {user.tags?.includes(selectedTag) ? '移除所选' : '添加所选'}
                        </button>
                      ) : <span className="text-xs text-gray-400">请选择标签</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/**
 * 5. Custom Report Builder
 */
export const CustomReportBuilder = ({ data }: { data: ResearchItem[] }) => {
  const [dimensions, setDimensions] = useState<string[]>(['category']);
  const toggleDim = (d: string) => setDimensions(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

  const reportData = React.useMemo(() => {
    const groups: Record<string, { count: number, funding: number }> = {};
    data.forEach(item => {
      const keyParts = [];
      if (dimensions.includes('category')) keyParts.push(item.category);
      if (dimensions.includes('year')) keyParts.push(item.date.split('-')[0]);
      if (dimensions.includes('status')) keyParts.push(item.status);
      const key = keyParts.join(' - ') || 'Total';
      if (!groups[key]) groups[key] = { count: 0, funding: 0 };
      groups[key].count += 1;
      groups[key].funding += (item.content_json?.funding || 0);
    });
    return Object.entries(groups).map(([name, stats]) => ({ name, ...stats }));
  }, [data, dimensions]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 min-h-[500px]">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="col-span-1 border-r border-gray-100 pr-6 space-y-6">
           <div>
             <h4 className="font-bold text-gray-900 mb-3 flex items-center"><Filter className="w-4 h-4 mr-2"/> 统计维度</h4>
             <div className="space-y-2">
               {['category', 'year', 'status'].map(dim => (
                 <label key={dim} className="flex items-center space-x-2 cursor-pointer">
                   <input type="checkbox" checked={dimensions.includes(dim)} onChange={() => toggleDim(dim)} className="rounded text-indigo-600 focus:ring-indigo-500" />
                   <span className="text-sm text-gray-700 capitalize">{dim === 'category' ? '科研类别' : (dim === 'year' ? '年份' : '状态')}</span>
                 </label>
               ))}
             </div>
           </div>
           <button className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">生成/刷新报表</button>
        </div>
        <div className="col-span-3">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-gray-900">报表预览</h4>
            <button className="text-indigo-600 text-sm hover:underline flex items-center"><Download className="w-4 h-4 mr-1"/> 导出 Excel</button>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">分组名称</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">数量</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">经费 (万元)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">{row.count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 font-mono">{row.funding}</td>
                  </tr>
                ))}
                {reportData.length === 0 && <tr><td colSpan={3} className="text-center py-8 text-gray-400">请选择维度生成数据</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 6. Year End Dept Report (Beautified)
 * 年度部门报告 - 美化版
 */
export const YearEndDeptReport = ({ currentUser }: { currentUser: any }) => {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [deptId, setDeptId] = useState<number | null>(null);
  const [compareDeptIds, setCompareDeptIds] = useState<number[]>([]);
  const [depts, setDepts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any | null>(null);
  const [compareReports, setCompareReports] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const ds = await departmentAPI.list();
        setDepts(ds);
        let did = (currentUser as any)?.dept_id ?? null;
        if (did == null && (currentUser?.role === 'research_admin' || currentUser?.role === 'sys_admin')) did = ds.length > 0 ? ds[0].id : 1;
        setDeptId(did);
      } catch {}
    })();
  }, [currentUser]);

  const scoreOf = (r: any) => {
    const t = r?.totals || {};
    const c = r?.categories || {};
    const funding = Number(r?.funding_total || 0);
    const s = (t.approved_count || 0) * 2 + funding / 100 + (c.papers_count || 0) * 1.5 + (c.patents_count || 0) * 2 + (c.awards_count || 0) * 3 - (t.pending_count || 0) * 0.5 - (t.rejected_count || 0) * 1;
    return Math.max(0, Math.round(s));
  };

  const load = async () => {
    if (deptId == null) { toast.warning('请选择部门'); return; }
    setLoading(true);
    try {
      const r = await reportsAPI.yearend(year, deptId);
      setReport(r);
    } catch (e: any) { toast.error(e?.message || '加载失败'); } finally { setLoading(false); }
  };

  useEffect(() => { if (deptId != null) load(); }, [year, deptId]);

  const loadCompare = async () => {
    if (compareDeptIds.length === 0) { setCompareReports([]); return; }
    try {
      const rs: any[] = [];
      for (const id of compareDeptIds) {
        const r = await reportsAPI.yearend(year, id);
        rs.push(r);
      }
      setCompareReports(rs);
    } catch (e: any) { toast.error(e?.message || '对比数据加载失败'); }
  };

  useEffect(() => { loadCompare(); }, [compareDeptIds, year]);

  const toggleCompare = (id: number) => setCompareDeptIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const fmt = (n: number) => (n || 0).toLocaleString();

  const exportCSV = () => {
    if (!report) return;
    const headers = ['部门','年份','总量','通过','待审','驳回','经费(万)','纵向','横向','论文','著作','专利','获奖','评分'];
    const name = (depts.find(d => d.id === report.dept_id)?.name) || String(report.dept_id);
    const row = [name, report.year, report.totals.total_items, report.totals.approved_count, report.totals.pending_count, report.totals.rejected_count, report.funding_total, report.categories.vertical_count, report.categories.horizontal_count, report.categories.papers_count, report.categories.books_count, report.categories.patents_count, report.categories.awards_count, scoreOf(report)].map(x => `"${String(x).replace(/"/g,'""')}"`).join(',');
    const blob = new Blob(["\uFEFF" + headers.join(',') + '\n' + row], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `yearend_${report.year}_${name}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const exportPDF = () => { if (!report) return; window.print(); };

  const StatCard = ({ title, value, subValue, icon: Icon, colorClass, bgClass }: any) => (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-start justify-between group">
      <div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</div>
        <div className={`text-2xl font-black ${colorClass} tracking-tight`}>{value}</div>
        {subValue && <div className="text-xs text-slate-400 mt-1 font-medium">{subValue}</div>}
      </div>
      <div className={`p-3 rounded-xl ${bgClass} ${colorClass} group-hover:scale-110 transition-transform`}><Icon className="w-5 h-5" /></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600"><BarChart3 className="w-6 h-6" /></div>
          <div><h2 className="text-lg font-bold text-slate-800">年度部门报表</h2><p className="text-xs text-slate-500">生成并分析各学院年度科研绩效</p></div>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 px-3 py-1.5">
            <Filter className="w-4 h-4 text-slate-400 mr-2" />
            <select className="bg-transparent text-sm font-medium text-slate-700 outline-none border-r border-slate-200 pr-2 mr-2 cursor-pointer hover:text-indigo-600" value={year} onChange={e => setYear(Number(e.target.value))}>
              {[new Date().getFullYear(), new Date().getFullYear()-1, new Date().getFullYear()-2].map(y => <option key={y} value={y}>{y}年度</option>)}
            </select>
            <select className="bg-transparent text-sm font-bold text-slate-800 outline-none cursor-pointer w-32 md:w-48" value={deptId ?? ''} onChange={e => setDeptId(Number(e.target.value) || null)}>
              <option value="">请选择部门</option>
              {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <button onClick={load} disabled={loading} className="p-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm active:scale-95 disabled:opacity-50"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
          <div className="h-8 w-px bg-slate-200 mx-1 hidden md:block"></div>
          <button onClick={exportCSV} className="flex items-center px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition"><Download className="w-4 h-4 mr-2" /> CSV</button>
          <button onClick={exportPDF} className="flex items-center px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition"><Printer className="w-4 h-4 mr-2" /> 打印</button>
        </div>
      </div>

      {report ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard title="年度综合评分" value={scoreOf(report)} icon={Award} colorClass="text-purple-600" bgClass="bg-purple-50" subValue="基于多维权重计算" />
            <StatCard title="申报总量" value={fmt(report.totals.total_items)} icon={FileText} colorClass="text-slate-700" bgClass="bg-slate-100" />
            <StatCard title="已通过" value={fmt(report.totals.approved_count)} icon={CheckCircle2} colorClass="text-emerald-600" bgClass="bg-emerald-50" subValue={`${Math.round(report.totals.approved_count/report.totals.total_items*100 || 0)}% 通过率`} />
            <StatCard title="经费总额" value={`¥${fmt(report.funding_total)}`} icon={Wallet} colorClass="text-blue-600" bgClass="bg-blue-50" subValue="万元 (CNY)" />
            <StatCard title="待审核" value={fmt(report.totals.pending_count)} icon={Clock} colorClass="text-amber-500" bgClass="bg-amber-50" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center"><TrendingUp className="w-5 h-5 mr-2 text-indigo-500" /> 科研产出分布</h3>
              <div className="space-y-5">
                {[
                  { label: '纵向项目', val: report.categories.vertical_count, color: 'bg-blue-500' },
                  { label: '横向项目', val: report.categories.horizontal_count, color: 'bg-cyan-500' },
                  { label: '学术论文', val: report.categories.papers_count, color: 'bg-purple-500' },
                  { label: '出版著作', val: report.categories.books_count, color: 'bg-pink-500' },
                  { label: '专利成果', val: report.categories.patents_count, color: 'bg-emerald-500' },
                  { label: '科研获奖', val: report.categories.awards_count, color: 'bg-orange-500' },
                ].map((item) => {
                  const max = Math.max(1, report.totals.total_items);
                  const percent = (item.val / max) * 100;
                  return (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1.5"><span className="text-slate-600 font-medium">{item.label}</span><span className="font-bold text-slate-900">{fmt(item.val)}</span></div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${item.color} transition-all duration-1000`} style={{ width: `${percent}%` }}></div></div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center justify-between">
                <div className="flex items-center"><TrendingUp className="w-5 h-5 mr-2 text-emerald-500" /> 月度申报趋势</div>
                <div className="flex gap-4 text-xs"><div className="flex items-center"><div className="w-2 h-2 rounded-full bg-indigo-200 mr-1"></div> 新增</div><div className="flex items-center"><div className="w-2 h-2 rounded-full bg-emerald-500 mr-1"></div> 通过</div></div>
              </h3>
              <div className="flex-1 flex items-end justify-between gap-2 min-h-[200px] pt-4">
                {report.monthly.map((m: any) => {
                  const maxVal = Math.max(...report.monthly.map((x:any) => x.created)) || 1;
                  const hCreated = Math.max(4, (m.created / maxVal) * 100);
                  const hApproved = Math.max(0, (m.approved / maxVal) * 100);
                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center group">
                      <div className="w-full relative flex items-end justify-center h-48 bg-slate-50/50 rounded-t-lg">
                        <div className="w-3/5 bg-indigo-100 rounded-t-sm transition-all group-hover:bg-indigo-200 relative" style={{ height: `${hCreated}%` }}>
                           <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10 pointer-events-none">新增: {m.created}</div>
                        </div>
                        <div className="absolute bottom-0 w-3/5 bg-emerald-500/80 rounded-t-sm transition-all" style={{ height: `${hApproved}%` }}></div>
                      </div>
                      <div className="text-xs text-slate-400 mt-2 font-medium">{m.month}月</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <h3 className="font-bold text-slate-800 flex items-center"><Search className="w-5 h-5 mr-2 text-indigo-500" /> 横向对比分析</h3>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-1">
                <span className="text-xs text-slate-400 px-2">添加对比:</span>
                <div className="flex gap-2 overflow-x-auto max-w-[300px] md:max-w-md no-scrollbar">
                  {depts.map(d => {
                    const active = compareDeptIds.includes(d.id);
                    return (
                      <button key={d.id} onClick={() => toggleCompare(d.id)} className={`text-xs px-2 py-1 rounded whitespace-nowrap transition-all ${active ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-100 hover:border-indigo-200'}`}>{d.name}</button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50/80 text-slate-500 font-medium">
                  <tr>
                    <th className="px-4 py-3 text-left">部门名称</th><th className="px-4 py-3 text-right">申报总量</th><th className="px-4 py-3 text-right">通过率</th>
                    <th className="px-4 py-3 text-right">经费 (万元)</th><th className="px-4 py-3 text-right">纵向</th><th className="px-4 py-3 text-right">论文</th>
                    <th className="px-4 py-3 text-right">获奖</th><th className="px-4 py-3 text-right">综合评分</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {compareReports.map((r: any) => {
                    const name = (depts.find(d => d.id === r.dept_id)?.name) || r.dept_id;
                    const isCurrent = r.dept_id === deptId;
                    const passRate = Math.round((r.totals.approved_count / (r.totals.total_items || 1)) * 100);
                    return (
                      <tr key={r.dept_id} className={`transition hover:bg-slate-50 ${isCurrent ? 'bg-indigo-50/30' : ''}`}>
                        <td className="px-4 py-3 font-medium text-slate-800">{name}{isCurrent && <span className="ml-2 text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">当前</span>}</td>
                        <td className="px-4 py-3 text-right font-mono text-slate-600">{fmt(r.totals.total_items)}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${passRate > 80 ? 'bg-emerald-500' : passRate > 50 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{width: `${passRate}%`}}></div></div>
                            <span className="text-xs text-slate-500 w-8">{passRate}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-blue-600">{fmt(r.funding_total)}</td>
                        <td className="px-4 py-3 text-right text-slate-500">{fmt(r.categories.vertical_count)}</td>
                        <td className="px-4 py-3 text-right text-slate-500">{fmt(r.categories.papers_count)}</td>
                        <td className="px-4 py-3 text-right text-slate-500">{fmt(r.categories.awards_count)}</td>
                        <td className="px-4 py-3 text-right"><span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-bold">{fmt(scoreOf(r))}</span></td>
                      </tr>
                    );
                  })}
                  {compareReports.length === 0 && <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-400"><div className="flex flex-col items-center"><Search className="w-8 h-8 mb-2 opacity-50" /><p>请点击上方部门标签添加对比数据</p></div></td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4"><BarChart3 className="w-8 h-8 text-slate-300" /></div>
          <p className="text-slate-500 font-medium">准备就绪</p>
          <p className="text-sm text-slate-400 mt-1">请选择年份与部门，点击刷新以生成报表</p>
        </div>
      )}
    </div>
  );
};

/**
 * 7. Notice Publisher
 * 申报发布中心
 */
export const NoticePublisher = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'normal' | 'high'>('normal');
  const [recipients, setRecipients] = useState<string[]>(['all']);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);

  const handlePublish = () => {
    if (!title || !content) { toast.warning('请输入通知标题和正文'); return; }
    setIsSending(true);
    (async () => {
      try {
        await noticeAPI.create({ title, content, target_role: 'all', publisher: '发布中心' });
        toast.success('通知已发布并写入数据库');
        setTitle(''); setContent(''); setAttachments([]);
      } catch (e: any) { toast.error(e?.message || '发布失败'); } finally { setIsSending(false); }
    })();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setAttachments(prev => [...prev, e.target.files![0]]);
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center tracking-tight">
            <div className="p-2 bg-indigo-600 rounded-lg mr-4 shadow-lg shadow-indigo-500/30 text-white"><Megaphone className="w-6 h-6" /></div>
            申报发布中心
          </h2>
          <p className="text-slate-500 mt-2 ml-14 font-medium">创建新的科研申报批次或通知</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col min-h-[600px]">
          <div className={`h-2 w-full transition-colors duration-500 ${priority === 'high' ? 'bg-orange-500' : 'bg-indigo-500'}`}></div>
          <div className="p-8 flex-1 flex flex-col">
            <input type="text" placeholder="请输入通知标题..." className="text-3xl font-bold text-slate-800 placeholder-slate-300 border-none outline-none w-full bg-transparent mb-6" value={title} onChange={e => setTitle(e.target.value)} />
            <div className="w-16 h-1 bg-slate-100 rounded-full mb-8"></div>
            <textarea placeholder="在此撰写通知正文。支持 Markdown 格式..." className="flex-1 w-full resize-none border-none outline-none text-base text-slate-600 leading-relaxed placeholder-slate-300 bg-transparent" value={content} onChange={e => setContent(e.target.value)} />
            {attachments.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {attachments.map((file, idx) => (
                  <div key={idx} className="flex items-center px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 animate-in zoom-in">
                    <Paperclip className="w-3 h-3 mr-2 text-slate-400" />{file.name}<button onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))} className="ml-2 hover:text-red-500"><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-slate-50 border-t border-slate-100 px-6 py-3 flex items-center justify-between">
            <div className="flex gap-4 text-slate-400">
              <button className="hover:text-indigo-600 transition"><FileText className="w-5 h-5"/></button>
              <button className="hover:text-indigo-600 transition relative"><input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} /><Paperclip className="w-5 h-5"/></button>
            </div>
            <div className="text-xs text-slate-400 font-mono">{content.length} 字</div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 shadow-inner">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center"><Shield className="w-3 h-3 mr-1.5" /> 发布权限管控</h3>
            <div className="bg-white border border-indigo-100 rounded-xl p-4 flex items-start gap-3 shadow-sm">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0"><Building2 className="w-5 h-5" /></div>
              <div>
                <div className="text-xs text-slate-400 mb-0.5">当前归属学院</div><div className="text-sm font-bold text-slate-800">计算机科学与技术学院</div>
                <div className="mt-2 flex items-center text-[10px] text-indigo-600 bg-indigo-50 px-2 py-1 rounded w-fit"><Lock className="w-3 h-3 mr-1" /> 范围已锁定</div>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">* 根据系统安全策略，您仅有权向本学院教师发布申报通知。跨学院发布请联系校级管理员。</p>
          </div>

          <div className={`rounded-2xl border p-6 shadow-sm transition-colors duration-300 ${priority === 'high' ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-200'}`}>
            <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center ${priority === 'high' ? 'text-orange-700' : 'text-slate-900'}`}>
              <AlertTriangle className={`w-4 h-4 mr-2 ${priority === 'high' ? 'text-orange-600' : 'text-slate-400'}`} /> 紧急程度
            </h3>
            <div className="flex bg-white/50 p-1 rounded-xl border border-slate-200/50">
              <button onClick={() => setPriority('normal')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${priority === 'normal' ? 'bg-white shadow-sm text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}>普通通知</button>
              <button onClick={() => setPriority('high')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center ${priority === 'high' ? 'bg-orange-500 text-white shadow-md shadow-orange-200' : 'text-slate-400 hover:text-orange-600'}`}>
                <AlertTriangle className="w-3 h-3 mr-1" /> 紧急置顶
              </button>
            </div>
            {priority === 'high' && <div className="mt-3 flex items-start gap-2 text-xs text-orange-600 animate-in fade-in"><AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" /><p>紧急通知将通过短信和邮件同步推送，并置顶显示 3 天。</p></div>}
          </div>

          <div className="pt-4">
            <button onClick={handlePublish} disabled={isSending} className={`w-full py-4 rounded-xl font-bold text-white shadow-xl flex items-center justify-center transition-all active:scale-95 duration-300 ${isSending ? 'bg-slate-400 cursor-not-allowed' : priority === 'high' ? 'bg-gradient-to-r from-orange-500 to-red-500 shadow-orange-500/30 hover:shadow-orange-500/50' : 'bg-gradient-to-r from-indigo-600 to-blue-600 shadow-indigo-500/30 hover:shadow-indigo-500/50'}`}>
              {isSending ? <>正在推送...</> : (<><Send className="w-5 h-5 mr-2" /> 确认发布通知</>)}
            </button>
            <p className="text-center text-xs text-slate-400 mt-4">发布即生效，请仔细核对内容。</p>
          </div>
        </div>
      </div>
    </div>
  );
};