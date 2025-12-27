import React, { useState, useEffect } from 'react';
import { Filter, X, Calendar, DollarSign, Tag, CheckCircle2 } from 'lucide-react'; // 引入图标

export interface Filters {
  status: 'all' | 'pending' | 'approved' | 'rejected' | 'draft';
  category: 'all' | '纵向项目' | '横向项目' | '学术论文' | '出版著作' | '专利' | '科技奖励';
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string;   // YYYY-MM-DD
  fundingMin?: number;
  fundingMax?: number;
}

interface Props {
  value: Filters;
  onChange: (next: Filters) => void;
}

const FilterBar: React.FC<Props> = ({ value, onChange }) => {
  const [local, setLocal] = useState<Filters>(value);
  const [isExpanded, setIsExpanded] = useState(false); // 控制高级筛选展开

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const apply = () => onChange(local);
  const reset = () => {
    const defaultFilters: Filters = { status: 'all', category: 'all' };
    setLocal(defaultFilters);
    onChange(defaultFilters);
  };

  // 样式类常量
  const selectClass = "w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow shadow-sm appearance-none";
  const inputClass = "w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow shadow-sm";
  const labelClass = "block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1";

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 transition-all duration-300 hover:shadow-md">
      
      {/* 顶部标题栏 & 基础操作 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-indigo-900">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Filter className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="font-bold text-base">数据筛选</h3>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={() => setIsExpanded(!isExpanded)} 
             className="text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
           >
             {isExpanded ? '收起更多' : '更多筛选'}
           </button>
           <div className="h-4 w-px bg-slate-200"></div>
           <button 
             onClick={reset} 
             className="flex items-center px-3 py-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-md text-sm transition-colors"
           >
             <X className="w-3.5 h-3.5 mr-1.5" /> 重置
           </button>
           <button 
             onClick={apply} 
             className="flex items-center px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-md shadow-indigo-200 transition-all active:scale-95"
           >
             <CheckCircle2 className="w-4 h-4 mr-1.5" /> 应用
           </button>
        </div>
      </div>

      {/* 基础筛选区域 (Grid Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* 状态 */}
        <div className="relative group">
          <label className={labelClass}>审核状态</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CheckCircle2 className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <select
              className={selectClass}
              value={local.status}
              onChange={e => setLocal({ ...local, status: e.target.value as Filters['status'] })}
            >
              <option value="all">全部状态</option>
              <option value="pending">⏳ 审核中</option>
              <option value="approved">✅ 已通过</option>
              <option value="rejected">❌ 已驳回</option>
              <option value="draft">📝 草稿</option>
            </select>
          </div>
        </div>

        {/* 类别 */}
        <div className="relative group">
          <label className={labelClass}>科研类别</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Tag className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <select
              className={selectClass}
              value={local.category}
              onChange={e => setLocal({ ...local, category: e.target.value as Filters['category'] })}
            >
              <option value="all">全部分类</option>
              <option value="纵向项目">🏛️ 纵向项目</option>
              <option value="横向项目">🤝 横向项目</option>
              <option value="学术论文">📄 学术论文</option>
              <option value="出版著作">📚 出版著作</option>
              <option value="专利">💡 专利</option>
              <option value="科技奖励">🏆 科技奖励</option>
            </select>
          </div>
        </div>

        {/* 时间范围 (合并为一个视觉组) */}
        <div className={`col-span-2 grid grid-cols-2 gap-4 ${isExpanded ? '' : 'hidden lg:grid'}`}>
           <div className="relative group">
             <label className={labelClass}>起始日期</label>
             <div className="relative">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <Calendar className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
               </div>
               <input
                 type="date"
                 className={inputClass}
                 value={local.dateFrom || ''}
                 onChange={e => setLocal({ ...local, dateFrom: e.target.value || undefined })}
               />
             </div>
           </div>
           <div className="relative group">
             <label className={labelClass}>截止日期</label>
             <div className="relative">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <Calendar className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
               </div>
               <input
                 type="date"
                 className={inputClass}
                 value={local.dateTo || ''}
                 onChange={e => setLocal({ ...local, dateTo: e.target.value || undefined })}
               />
             </div>
           </div>
        </div>
      </div>

      {/* 高级筛选区域 (展开动画) */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-40 mt-5 opacity-100' : 'max-h-0 mt-0 opacity-0'}`}>
        <div className="relative group">
          <label className={labelClass}>最小经费 (万元)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            </div>
            <input
              type="number"
              placeholder="0"
              className={inputClass}
              value={local.fundingMin ?? ''}
              onChange={e => setLocal({ ...local, fundingMin: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
        </div>
        <div className="relative group">
          <label className={labelClass}>最大经费 (万元)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            </div>
            <input
              type="number"
              placeholder="不限"
              className={inputClass}
              value={local.fundingMax ?? ''}
              onChange={e => setLocal({ ...local, fundingMax: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
        </div>
      </div>

    </div>
  );
};

export default FilterBar;