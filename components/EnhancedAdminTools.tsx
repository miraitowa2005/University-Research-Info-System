
import React, { useState, useEffect } from 'react';
import { ProjectPhase, User, ResearchTag, ResearchItem } from '../types';
import { INITIAL_TAGS } from '../logic/compiler';
import { BarChart3, Users, Clock, Send, Download, Plus, Tag, X, Filter, RefreshCw, Megaphone, Paperclip, AlertTriangle, CheckCircle2, FileText, Eye } from 'lucide-react';
import { projectAPI } from '../logic/api';
import { toast } from 'react-toastify';

// Define the structure for API response
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
  applicant: {
    id: number;
    name: string;
    email: string;
    dept_id: number;
  };
}

/**
 * 1. Project Lifecycle Manager
 * Tracks submissions across different phases (Pre-app, Formal, etc.)
 */
export const ProjectLifecycleManager = () => {
  const [phases, setPhases] = useState<ProjectPhaseWithSubmissions[]>([]);
  const [submissions, setSubmissions] = useState<Record<number, PhaseSubmission[]>>({});
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Fetch project phases and their submissions
  const fetchProjectData = async () => {
    try {
      setLoading(true);
      // First, get all project notices
      const notices = await projectAPI.getNotices();
      
      // For each notice, get its phases and calculate progress
      const allPhases: ProjectPhaseWithSubmissions[] = [];
      const allSubmissions: Record<number, PhaseSubmission[]> = {};
      
      for (const notice of notices) {
        const noticePhases = await projectAPI.getNoticePhases(notice.id);
        
        for (const phase of noticePhases) {
          // Get submissions for this phase
          const phaseSubmissions = await projectAPI.getPhaseSubmissions(phase.id);
          allSubmissions[phase.id] = phaseSubmissions;
          
          // Calculate progress
          const submittedCount = phaseSubmissions.filter(s => s.status === 'submitted').length;
          // For demo, assume eligible_count is double the submitted count
          const eligibleCount = submittedCount + Math.floor(Math.random() * 10) + 5;
          
          // Determine phase status
          const now = new Date();
          const deadline = new Date(phase.deadline);
          let status: 'active' | 'upcoming' | 'closed' = 'active';
          
          if (now < deadline) {
            status = 'upcoming';
          } else if (now > deadline) {
            status = 'closed';
          }
          
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

  // Fetch latest submissions for real-time updates
  const fetchLatestSubmissions = async () => {
    try {
      const latestSubmissions = await projectAPI.getLatestSubmissions();
      
      // Update submissions for the affected phases
      const updatedSubmissions = { ...submissions };
      
      latestSubmissions.forEach(submission => {
        if (!updatedSubmissions[submission.phase_id]) {
          updatedSubmissions[submission.phase_id] = [];
        }
        
        // Check if submission already exists
        const existingIndex = updatedSubmissions[submission.phase_id].findIndex(s => s.id === submission.id);
        if (existingIndex >= 0) {
          // Update existing submission
          updatedSubmissions[submission.phase_id][existingIndex] = submission;
        } else {
          // Add new submission
          updatedSubmissions[submission.phase_id].push(submission);
        }
      });
      
      setSubmissions(updatedSubmissions);
      
      // Update phases with new counts
      setPhases(prevPhases => prevPhases.map(phase => {
        const phaseId = parseInt(phase.id);
        if (updatedSubmissions[phaseId]) {
          const submittedCount = updatedSubmissions[phaseId].filter(s => s.status === 'submitted').length;
          return {
            ...phase,
            submittedCount: submittedCount
          };
        }
        return phase;
      }));
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch latest submissions:', error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchProjectData();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchLatestSubmissions, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900">项目申报全流程跟踪</h3>
        <div className="flex gap-2">
          <button 
            onClick={fetchProjectData}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? '加载中...' : '刷新数据'}
          </button>
          <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition">
            <Plus className="w-4 h-4" /> 新增阶段
          </button>
        </div>
      </div>
      
      <div className="text-xs text-gray-500">
        最后更新: {lastUpdated.toLocaleTimeString()}
        <span className="ml-2 text-green-500">• 实时更新已启用</span>
      </div>

      <div className="grid gap-4">
        {phases.length > 0 ? (
          phases.map(phase => {
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
                     <button className="p-2 text-gray-400 hover:text-indigo-600 border border-gray-200 rounded-lg hover:bg-gray-50" title="发送提醒">
                       <Send className="w-4 h-4" />
                     </button>
                     <button className="p-2 text-gray-400 hover:text-green-600 border border-gray-200 rounded-lg hover:bg-gray-50" title="导出未提交名单">
                       <Download className="w-4 h-4" />
                     </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                        提交进度
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-indigo-600">
                        {phase.submittedCount} / {phase.targetCount} ({percent}%)
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-100">
                    <div style={{ width: `${percent}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 transition-all duration-500"></div>
                  </div>
                </div>
                
                {/* Recent Submissions */}
                <div className="mt-4">
                  <h5 className="text-sm font-semibold text-gray-700 mb-2">最新提交</h5>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {submissions[parseInt(phase.id)]?.slice(0, 5).map(submission => (
                      <div key={submission.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="text-xs text-gray-700">{submission.applicant.name}</span>
                          <span className="text-xs text-gray-500">({submission.applicant.email})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${submission.status === 'submitted' ? 'bg-green-100 text-green-700' : submission.status === 'returned' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                            {submission.status === 'submitted' ? '已提交' : submission.status === 'returned' ? '已退回' : '未开始'}
                          </span>
                          {submission.submitted_at && (
                            <span className="text-xs text-gray-500">
                              {new Date(submission.submitted_at).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {(!submissions[parseInt(phase.id)] || submissions[parseInt(phase.id)].length === 0) && (
                      <p className="text-xs text-gray-400 text-center py-2">暂无提交记录</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="text-gray-500">加载项目数据中...</div>
          </div>
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
 * 2. Tag Manager
 * Manages user tags for data governance
 */
export const TagManager = ({ users, onUpdateUserTags }: { users: User[], onUpdateUserTags: (userId: string, tags: string[]) => void }) => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(u => u.role === 'teacher' && (u.name.includes(searchTerm) || u.department?.includes(searchTerm)));

  const handleToggleTag = (user: User, tagId: string) => {
    const currentTags = user.tags || [];
    const newTags = currentTags.includes(tagId) 
      ? currentTags.filter(t => t !== tagId)
      : [...currentTags, tagId];
    onUpdateUserTags(user.id, newTags);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Tag List */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm overflow-y-auto">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center">
          <Tag className="w-4 h-4 mr-2"/> 标签库
        </h3>
        <div className="space-y-2">
          {INITIAL_TAGS.map(tag => (
            <div 
              key={tag.id} 
              onClick={() => setSelectedTag(tag.id === selectedTag ? null : tag.id)}
              className={`p-3 rounded-lg cursor-pointer border transition ${selectedTag === tag.id ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-300' : 'bg-white border-gray-100 hover:border-indigo-200'}`}
            >
              <div className="flex justify-between items-center">
                 <span className={`px-2 py-0.5 rounded text-xs font-medium ${tag.color}`}>{tag.name}</span>
                 <span className="text-xs text-gray-400 capitalize">{tag.category}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                关联人数: {users.filter(u => u.tags?.includes(tag.id)).length}
              </p>
            </div>
          ))}
          <button className="w-full mt-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:text-indigo-600 hover:border-indigo-300 text-sm font-medium">
            + 新建标签
          </button>
        </div>
      </div>

      {/* User Assignment */}
      <div className="lg:col-span-2 bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col">
        <div className="mb-4">
          <input 
            type="text" 
            placeholder="搜索教师姓名或学院..." 
            className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all text-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
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
                            {tag.name}
                            <button onClick={() => handleToggleTag(user, tid)} className="ml-1 hover:text-red-600"><X className="w-3 h-3"/></button>
                          </span>
                        ) : null;
                      })}
                      {(!user.tags || user.tags.length === 0) && <span className="text-xs text-gray-400">-</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                     {selectedTag ? (
                       <button 
                         onClick={() => handleToggleTag(user, selectedTag)}
                         className={`text-xs px-3 py-1 rounded transition ${user.tags?.includes(selectedTag) ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}
                       >
                         {user.tags?.includes(selectedTag) ? '移除所选' : '添加所选'}
                       </button>
                     ) : (
                       <span className="text-xs text-gray-400">请先在左侧选择标签</span>
                     )}
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
 * 3. Custom Report Builder
 * Select dimensions and generate tables
 */
export const CustomReportBuilder = ({ data }: { data: ResearchItem[] }) => {
  const [dimensions, setDimensions] = useState<string[]>(['category']);
  
  const toggleDim = (d: string) => {
    setDimensions(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  };

  // Simple aggregation logic for demo
  const reportData = React.useMemo(() => {
    const groups: Record<string, { count: number, funding: number }> = {};
    
    data.forEach(item => {
      // Create a key based on selected dimensions
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
        {/* Config Panel */}
        <div className="col-span-1 border-r border-gray-100 pr-6 space-y-6">
           <div>
             <h4 className="font-bold text-gray-900 mb-3 flex items-center"><Filter className="w-4 h-4 mr-2"/> 统计维度</h4>
             <div className="space-y-2">
               {['category', 'year', 'status'].map(dim => (
                 <label key={dim} className="flex items-center space-x-2 cursor-pointer">
                   <input 
                     type="checkbox" 
                     checked={dimensions.includes(dim)} 
                     onChange={() => toggleDim(dim)}
                     className="rounded text-indigo-600 focus:ring-indigo-500"
                   />
                   <span className="text-sm text-gray-700 capitalize">
                     {dim === 'category' ? '科研类别' : (dim === 'year' ? '年份' : '状态')}
                   </span>
                 </label>
               ))}
             </div>
           </div>
           
           <button className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
             生成/刷新报表
           </button>
        </div>

        {/* Preview Panel */}
        <div className="col-span-3">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-gray-900">报表预览</h4>
            <button className="text-indigo-600 text-sm hover:underline flex items-center">
              <Download className="w-4 h-4 mr-1"/> 导出 Excel
            </button>
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
                {reportData.length === 0 && (
                  <tr><td colSpan={3} className="text-center py-8 text-gray-400">请选择维度生成数据</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 4. Notice Publisher - 科研指挥舱发布中心
 */
export const NoticePublisher = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'normal' | 'high'>('normal');
  const [recipients, setRecipients] = useState<string[]>(['all']);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);

  const handlePublish = () => {
    if (!title || !content) {
      toast.warning('请输入通知标题和正文');
      return;
    }
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      toast.success('通知已全校发布！');
      setTitle('');
      setContent('');
      setAttachments([]);
    }, 1500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachments(prev => [...prev, e.target.files![0]]);
    }
  };

  const toggleRecipient = (id: string) => {
    if (id === 'all') {
      setRecipients(['all']);
    } else {
      let newRecipients = recipients.includes('all') ? [] : [...recipients];
      if (newRecipients.includes(id)) {
        newRecipients = newRecipients.filter(r => r !== id);
      } else {
        newRecipients.push(id);
      }
      if (newRecipients.length === 0) newRecipients = ['all'];
      setRecipients(newRecipients);
    }
  };

  const recipientOptions = [
    { id: 'all', label: '全体教职工' },
    { id: 'dept_heads', label: '各院系负责人' },
    { id: 'professors', label: '正高级职称人员' },
    { id: 'young_scholars', label: '青年骨干教师' },
  ];

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center tracking-tight">
            <div className="p-2 bg-indigo-600 rounded-lg mr-4 shadow-lg shadow-indigo-500/30 text-white">
              <Megaphone className="w-6 h-6" />
            </div>
            通知发布中心
          </h2>
          <p className="text-slate-500 mt-2 ml-14 font-medium">向全校科研人员传达重要政策与公告</p>
        </div>
        <div className="hidden md:flex gap-3">
          <button className="flex items-center px-4 py-2 bg白 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition shadow-sm">
            <Eye className="w-4 h-4 mr-2" /> 预览效果
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col min-h-[600px]">
          <div className={`h-2 w-full transition-colors duration-500 ${priority === 'high' ? 'bg-orange-500' : 'bg-indigo-500'}`}></div>
          <div className="p-8 flex-1 flex flex-col">
            <input
              type="text"
              placeholder="请输入通知标题..."
              className="text-3xl font-bold text-slate-800 placeholder-slate-300 border-none outline-none w-full bg-transparent mb-6"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <div className="w-16 h-1 bg-slate-100 rounded-full mb-8"></div>
            <textarea
              placeholder="在此撰写通知正文。支持 Markdown 格式..."
              className="flex-1 w-full resize-none border-none outline-none text-base text-slate-600 leading-relaxed placeholder-slate-300 bg-transparent"
              value={content}
              onChange={e => setContent(e.target.value)}
            />
            {attachments.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {attachments.map((file, idx) => (
                  <div key={idx} className="flex items-center px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 animate-in zoom-in">
                    <Paperclip className="w-3 h-3 mr-2 text-slate-400" />
                    {file.name}
                    <button onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))} className="ml-2 hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-slate-50 border-t border-slate-100 px-6 py-3 flex items-center justify-between">
            <div className="flex gap-4 text-slate-400">
              <button className="hover:text-indigo-600 transition"><FileText className="w-5 h-5"/></button>
              <button className="hover:text-indigo-600 transition relative">
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
                <Paperclip className="w-5 h-5"/>
              </button>
            </div>
            <div className="text-xs text-slate-400 font-mono">{content.length} 字</div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center">
              <Users className="w-4 h-4 mr-2 text-indigo-500" /> 接收对象
            </h3>
            <div className="flex flex-wrap gap-2">
              {recipientOptions.map(opt => {
                const isActive = recipients.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => toggleRecipient(opt.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-200 ${
                      isActive
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-400 mt-3 leading-tight">* 默认发送给全体人员，点击上方标签可精准推送。</p>
          </div>

          <div className={`rounded-2xl border p-6 shadow-sm transition-colors duration-300 ${priority === 'high' ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-200'}`}>
            <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center ${priority === 'high' ? 'text-orange-700' : 'text-slate-900'}`}>
              <AlertTriangle className={`w-4 h-4 mr-2 ${priority === 'high' ? 'text-orange-600' : 'text-slate-400'}`} />
              紧急程度
            </h3>
            <div className="flex bg-white/50 p-1 rounded-xl border border-slate-200/50">
              <button onClick={() => setPriority('normal')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${priority === 'normal' ? 'bg-white shadow-sm text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}>
                普通通知
              </button>
              <button onClick={() => setPriority('high')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center ${priority === 'high' ? 'bg-orange-500 text-white shadow-md shadow-orange-200' : 'text-slate-400 hover:text-orange-600'}`}>
                <AlertTriangle className="w-3 h-3 mr-1" />
                紧急置顶
              </button>
            </div>
            {priority === 'high' && (
              <div className="mt-3 flex items-start gap-2 text-xs text-orange-600 animate-in fade-in">
                <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <p>紧急通知将通过短信和邮件同步推送，并置顶显示 3 天。</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center justify-between cursor-not-allowed opacity-60 grayscale">
            <div className="flex items-center">
              <div className="p-2 bg-slate-100 rounded-lg mr-3">
                <Clock className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-700">定时发送</div>
                <div className="text-[10px] text-slate-400">高级版功能</div>
              </div>
            </div>
            <div className="w-8 h-4 bg-slate-200 rounded-full relative">
              <div className="w-4 h-4 bg-white rounded-full shadow-sm absolute left-0"></div>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handlePublish}
              disabled={isSending}
              className={`w-full py-4 rounded-xl font-bold text白 shadow-xl flex items-center justify-center transition-all active:scale-95 duration-300 ${
                isSending
                  ? 'bg-slate-400 cursor-not-allowed'
                  : priority === 'high'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 shadow-orange-500/30 hover:shadow-orange-500/50'
                  : 'bg-gradient-to-r from-indigo-600 to-blue-600 shadow-indigo-500/30 hover:shadow-indigo-500/50'
              }`}
            >
              {isSending ? <>正在推送...</> : (<><Send className="w-5 h-5 mr-2" /> 确认发布通知</>)}
            </button>
            <p className="text-center text-xs text-slate-400 mt-4">发布即生效，请仔细核对内容。</p>
          </div>
        </div>
      </div>
    </div>
  );
};
