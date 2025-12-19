import React, { useEffect, useState } from 'react';
import { ResearchItem, User } from '../types';
import { FileText, Clock, Edit, Eye, Plus, ClipboardList } from 'lucide-react';
import { projectAPI } from '../logic/api';

interface Props {
  researchItems: ResearchItem[];
  currentUser: User;
  onViewDetail: (item: ResearchItem) => void;
  onAddNew: () => void;
  onEdit: (item: ResearchItem) => void; // Placeholder for future edit functionality
}

interface PhaseSubmission {
  id: number;
  phase_id: number;
  applicant_id: number;
  status: 'not_started' | 'submitted' | 'returned';
  submitted_at?: Date;
  file_url?: string;
  remarks?: string;
  phase: {
    id: number;
    notice_id: number;
    name: string;
    deadline: Date;
    description?: string;
    notice: {
      id: number;
      title: string;
      content: string;
      publish_by: number;
      created_at: Date;
    }
  };
}

export const TeacherDashboard: React.FC<Props> = ({ researchItems, currentUser, onViewDetail, onAddNew, onEdit }) => {
  const draftItems = researchItems.filter(item => item.status === 'Draft');
  const pendingItems = researchItems.filter(item => item.status === 'Pending');
  const [projectSubmissions, setProjectSubmissions] = useState<PhaseSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Get project submissions for the current teacher
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const submissions = await projectAPI.getMySubmissions(parseInt(currentUser.id));
        setProjectSubmissions(submissions);
      } catch (error) {
        console.error('Failed to fetch project submissions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser.id) {
      fetchSubmissions();
    }
  }, [currentUser.id]);
  
  // Get status display color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_started': return 'text-gray-500';
      case 'submitted': return 'text-blue-600';
      case 'returned': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };
  
  // Get status display text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'not_started': return '未开始';
      case 'submitted': return '已提交';
      case 'returned': return '已退回';
      default: return '未知状态';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header and Quick Action */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">我的工作台</h2>
          <p className="text-sm text-slate-500 mt-1">在这里快速查看和管理您正在进行中的项目。</p>
        </div>
        <button 
          onClick={onAddNew}
          className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center text-sm font-medium transition shadow-lg shadow-indigo-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4 mr-2" />
          申报新成果
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Drafts Section */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center mb-4">
            <FileText className="w-6 h-6 text-amber-600 mr-3" />
            <h3 className="text-lg font-bold text-gray-900">我的草稿 ({draftItems.length})</h3>
          </div>
          <div className="space-y-3">
            {draftItems.length > 0 ? (
              draftItems.map(item => (
                <div key={item.id} className="p-4 bg-gray-50 rounded-lg flex justify-between items-center hover:bg-amber-50 transition">
                  <div>
                    <p className="font-medium text-gray-800 truncate w-60">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.category} - {item.date}</p>
                  </div>
                  <button onClick={() => onEdit(item)} className="text-sm text-amber-700 hover:underline flex items-center">
                    <Edit className="w-3 h-3 mr-1" /> 继续编辑
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 py-4">暂无草稿</p>
            )}
          </div>
        </div>

        {/* Pending Section */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center mb-4">
            <Clock className="w-6 h-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-bold text-gray-900">审核中 ({pendingItems.length})</h3>
          </div>
          <div className="space-y-3">
            {pendingItems.length > 0 ? (
              pendingItems.map(item => (
                <div key={item.id} className="p-4 bg-gray-50 rounded-lg flex justify-between items-center hover:bg-blue-50 transition">
                  <div>
                    <p className="font-medium text-gray-800 truncate w-60">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.category} - {item.date}</p>
                  </div>
                  <button onClick={() => onViewDetail(item)} className="text-sm text-blue-700 hover:underline flex items-center">
                    <Eye className="w-3 h-3 mr-1" /> 查看状态
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 py-4">没有正在审核的项目</p>
            )}
          </div>
        </div>
        
        {/* Project Application Status Section */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center mb-4">
            <ClipboardList className="w-6 h-6 text-green-600 mr-3" />
            <h3 className="text-lg font-bold text-gray-900">项目申报状态</h3>
          </div>
          <div className="space-y-3">
            {loading ? (
              <p className="text-center text-gray-400 py-4">加载中...</p>
            ) : projectSubmissions.length > 0 ? (
              projectSubmissions.map(submission => (
                <div key={submission.id} className="p-4 bg-gray-50 rounded-lg hover:bg-green-50 transition">
                  <div>
                    <p className="font-medium text-gray-800 truncate w-60">{submission.phase.notice.title}</p>
                    <p className="text-xs text-gray-500">{submission.phase.name} - 截止: {new Date(submission.phase.deadline).toLocaleDateString()}</p>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className={`text-sm font-medium ${getStatusColor(submission.status)}`}>
                      {getStatusText(submission.status)}
                    </span>
                    {submission.remarks && (
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                        有审核意见
                      </span>
                    )}
                  </div>
                  {submission.remarks && (
                    <div className="mt-2 p-2 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                      <p className="text-xs text-yellow-800">{submission.remarks}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 py-4">暂无项目申报记录</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

