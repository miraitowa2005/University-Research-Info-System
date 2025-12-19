
import React from 'react';
import { ResearchItem } from '../types';
import { PieChart, TrendingUp, Award, BookOpen } from 'lucide-react';

interface Props {
  data: ResearchItem[];
}

export const StatsOverview: React.FC<Props> = ({ data }) => {
  const safeData = Array.isArray(data) ? data : [];

  const normStatus = (s: any) => String(s || '').toLowerCase();
  const getCategory = (i: ResearchItem): string => {
    // 前端老数据有 category，新后台数据可能没有；做一些合理推断
    // 1) 直接用已有的 category
    const cat: any = (i as any).category;
    if (typeof cat === 'string' && cat.length > 0) return cat;
    // 2) 根据标题/内容推断（演示数据标题含“纵向/横向”或项目号前缀）
    const title = (i as any).title || '';
    const projectNo = (i as any)?.content_json?.project_no || '';
    if (title.includes('纵向') || String(projectNo).startsWith('VUSR')) return '纵向项目';
    if (title.includes('横向') || String(projectNo).startsWith('HUSR')) return '横向项目';
    // 3) 没法推断则归为“其他”
    return '其他';
  };

  const total = safeData.length;
  const pending = safeData.filter(i => normStatus((i as any).status) === 'pending').length;

  // 分类统计（防御式）
  const papers = safeData.filter(i => getCategory(i) === '学术论文').length;
  const projects = safeData.filter(i => getCategory(i).includes('项目')).length;
  const awards = safeData.filter(i => getCategory(i) === '科技奖励').length;
  const patents = safeData.filter(i => getCategory(i) === '专利').length;
  const books = safeData.filter(i => getCategory(i) === '出版著作').length;

  const others = Math.max(0, total - papers - projects - awards - patents - books);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="科研总数" 
          value={total} 
          icon={<BookOpen className="h-6 w-6 text-blue-600" />} 
          color="bg-blue-50"
        />
        <StatCard 
          title="待审核项目" 
          value={pending} 
          icon={<TrendingUp className="h-6 w-6 text-amber-600" />} 
          color="bg-amber-50"
        />
        <StatCard 
          title="获奖成果" 
          value={awards} 
          icon={<Award className="h-6 w-6 text-purple-600" />} 
          color="bg-purple-50"
        />
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <PieChart className="h-5 w-5 text-gray-500" />
          科研成果分布
        </h3>
        {total === 0 ? (
          <div className="text-sm text-gray-500">暂无数据</div>
        ) : (
          <div className="space-y-6">
            <ProgressBar label="纵向/横向项目" value={projects} total={total} color="bg-indigo-600" />
            <ProgressBar label="学术论文" value={papers} total={total} color="bg-emerald-500" />
            <ProgressBar label="专利" value={patents} total={total} color="bg-blue-500" />
            <ProgressBar label="出版著作" value={books} total={total} color="bg-orange-500" />
            {others > 0 && <ProgressBar label="其他" value={others} total={total} color="bg-gray-400" />}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }: any) => (
  <div className="
    bg-white p-6 rounded-2xl border border-slate-100 
    shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] 
    hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] 
    hover:-translate-y-1 transition-all duration-300 ease-out
    flex items-center space-x-5 group
  ">
    <div className={`
      p-3.5 rounded-xl transition-transform duration-300 group-hover:scale-110 
      ${color.replace('50', '50/50')} ring-1 ring-inset ring-black/5
    `}>
      {React.cloneElement(icon as React.ReactElement<any>, { className: `w-6 h-6 ${(icon as React.ReactElement<any>).props.className?.split(' ')[0] || ''}` })}
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="text-2xl font-bold text-slate-800 mt-1 tracking-tight">{value}</p>
    </div>
  </div>
);

const ProgressBar = ({ label, value, total, color }: any) => {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500 font-mono">{value} ({percentage}%)</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
        <div className={`h-2.5 rounded-full ${color} transition-all duration-1000 ease-out`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};
