import React, { useState } from 'react';
import { CheckCircle2, XCircle, Clock, ChevronRight } from 'lucide-react';

const MOCK_MY_PROJECTS = [
  { id: 'PROJ_001', title: '基于深度学习的图像识别研究', type: '纵向科研项目', status: 'pending', date: '2024-03-20', funding: 50000 },
  { id: 'PROJ_002', title: '分布式系统高并发优化', type: '横向科研项目', status: 'approved', date: '2024-02-15', funding: 120000 },
  { id: 'PROJ_003', title: '一种新型数据加密算法', type: '专利', status: 'rejected', date: '2024-01-10', funding: 0 },
];

export default function TeacherProjectList() {
  const [projects, setProjects] = useState(MOCK_MY_PROJECTS);
  const [filterStatus, setFilterStatus] = useState('all');

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'approved': return <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded flex items-center"><CheckCircle2 className="w-3 h-3 mr-1"/>已立项</span>;
      case 'rejected': return <span className="px-2 py-1 bg-red-50 text-red-600 text-xs font-bold rounded flex items-center"><XCircle className="w-3 h-3 mr-1"/>被驳回</span>;
      default: return <span className="px-2 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded flex items-center"><Clock className="w-3 h-3 mr-1"/>审核中</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">我的申报记录</h2>
          <p className="text-slate-500 text-sm mt-1">您共提交了 {projects.length} 项申请，其中 {projects.filter(p=>p.status==='approved').length} 项已通过。</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition">
          + 新增申报
        </button>
      </div>

      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex gap-2">
        {['all', 'pending', 'approved', 'rejected'].map(status => (
          <button 
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${filterStatus === status ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            {status === 'all' ? '全部项目' : status}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {projects
          .filter(p => filterStatus === 'all' || p.status === filterStatus)
          .map(project => (
          <div key={project.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group cursor-pointer relative overflow-hidden">
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${project.status === 'approved' ? 'bg-emerald-500' : project.status === 'rejected' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
            
            <div className="flex justify-between items-start pl-3">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{project.type}</span>
                  <span className="text-xs text-slate-400">{project.date}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{project.title}</h3>
                {project.funding > 0 && (
                  <div className="mt-2 text-sm font-mono text-slate-600">
                    预算: <span className="font-bold">¥ {project.funding.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end gap-3">
                {getStatusBadge(project.status)}
                <div className="p-2 rounded-full bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

