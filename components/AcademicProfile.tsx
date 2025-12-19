
import React from 'react';
import { User, ResearchItem } from '../types';
import { Calendar, Award, Book, FileText } from 'lucide-react';

interface Props {
  user: User;
  researchItems: ResearchItem[];
}

export const AcademicProfile: React.FC<Props> = ({ user, researchItems }) => {
  // Sort items by date descending
  const sortedItems = [...researchItems].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getIcon = (category: string) => {
    if (category.includes('项目')) return <Calendar className="w-5 h-5 text-indigo-600" />;
    if (category.includes('论文')) return <FileText className="w-5 h-5 text-emerald-600" />;
    if (category.includes('奖励')) return <Award className="w-5 h-5 text-amber-600" />;
    return <Book className="w-5 h-5 text-blue-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-500 rounded-2xl shadow-xl shadow-indigo-200 p-8 text-white">
        
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-10 w-32 h-32 rounded-full bg-indigo-400/20 blur-2xl"></div>

        <div className="relative flex items-center space-x-8 z-10">
          <div className="
            h-28 w-28 rounded-full bg-white/10 
            flex items-center justify-center text-4xl font-bold 
            backdrop-blur-md border-4 border-white/20 shadow-2xl
            text-white/90
          ">
            {user.name.charAt(0)}
          </div>
          
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">{user.name}</h2>
            <div className="flex items-center mt-2 text-blue-100 space-x-3">
              <span className="bg-blue-500/30 px-3 py-0.5 rounded-full text-sm border border-blue-400/30">
                {user.department}
              </span>
              <span className="text-sm opacity-80">
                {user.role === 'teacher' ? '教师' : '科研人员'}
              </span>
            </div>
            
            <div className="flex gap-6 mt-6">
              <div className="flex flex-col">
                <span className="text-2xl font-bold">{researchItems.length}</span>
                <span className="text-xs text-blue-100/70 uppercase tracking-wider font-medium">科研成果</span>
              </div>
              <div className="w-px bg-white/20 h-10 self-center"></div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold">{researchItems.filter(i => i.status === 'Approved').length}</span>
                <span className="text-xs text-blue-100/70 uppercase tracking-wider font-medium">已通过</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
             <Calendar className="w-5 h-5 mr-2 text-gray-500" />
             科研学术时间轴
          </h3>
          
          <div className="relative border-l-2 border-gray-200 ml-3 space-y-8 pl-8 py-2">
            {sortedItems.map((item) => (
              <div key={item.id} className="relative group">
                <div className="absolute -left-[41px] bg-white border-2 border-gray-200 rounded-full p-1.5 group-hover:border-indigo-500 transition-colors">
                  {getIcon(item.category)}
                </div>
                <div className="bg-gray-50 p-4 rounded-lg hover:bg-white hover:shadow-md border border-transparent hover:border-gray-100 transition-all">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-gray-900">{item.title}</h4>
                    <span className="text-xs font-mono text-gray-500 bg-white px-2 py-1 rounded border">{item.date}</span>
                  </div>
                  <div className="text-sm text-indigo-600 font-medium mt-1">{item.category}</div>
                  <p className="text-sm text-gray-600 mt-2">{item.details}</p>
                  {item.content_json?.funding && (
                    <div className="mt-2 text-xs font-semibold text-amber-700 bg-amber-50 inline-block px-2 py-0.5 rounded">
                      经费: {item.content_json.funding} 万元
                    </div>
                  )}
                </div>
              </div>
            ))}
            {sortedItems.length === 0 && <p className="text-gray-500 italic">暂无科研记录</p>}
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">影响力概览</h3>
            <div className="space-y-4">
               <div>
                 <div className="flex justify-between text-sm mb-1">
                   <span className="text-gray-600">纵向项目数</span>
                   <span className="font-medium">{researchItems.filter(i => i.category === '纵向项目').length}</span>
                 </div>
                 <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                   <div className="h-full bg-indigo-500 w-3/4"></div>
                 </div>
               </div>
               <div>
                 <div className="flex justify-between text-sm mb-1">
                   <span className="text-gray-600">SCI/EI 论文</span>
                   <span className="font-medium">{researchItems.filter(i => i.category === '学术论文').length}</span>
                 </div>
                 <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                   <div className="h-full bg-emerald-500 w-1/2"></div>
                 </div>
               </div>
            </div>
          </div>
          
          <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-6">
            <h3 className="text-indigo-900 font-bold mb-2">生成学术简历</h3>
            <p className="text-sm text-indigo-700 mb-4">系统将自动提取您的科研数据，生成标准格式的 PDF 简历。</p>
            <button className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-sm">
              一键导出 CV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
