import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, X, ChevronDown, SlidersHorizontal } from 'lucide-react';

export interface Filters {
  status: 'all' | 'pending' | 'approved' | 'rejected' | 'draft';
  category: 'all' | '纵向项目' | '横向项目' | '学术论文' | '出版著作' | '专利' | '科技奖励';
  dateFrom?: string;
  dateTo?: string;
  fundingMin?: number;
  fundingMax?: number;
}

interface Props {
  value: Filters;
  onChange: (next: Filters) => void;
}

const FilterBar: React.FC<Props> = ({ value, onChange }) => {
  const [local, setLocal] = useState<Filters>(value);
  const [expandTime, setExpandTime] = useState(false);

  useEffect(() => { setLocal(value); }, [value]);

  const handleApply = () => onChange(local);
  
  // 状态选项映射
  const statusOptions = [
    { value: 'all', label: '全部' },
    { value: 'pending', label: '审核中', color: 'text-amber-600 bg-amber-50' },
    { value: 'approved', label: '已通过', color: 'text-emerald-600 bg-emerald-50' },
    { value: 'rejected', label: '已驳回', color: 'text-red-600 bg-red-50' },
    { value: 'draft', label: '草稿', color: 'text-slate-600 bg-slate-50' },
  ];

  return (
    <div className="w-full mb-8">
      {/* 主搜索条容器 */}
      <div className="bg-white rounded-full shadow-lg shadow-slate-200/50 border border-slate-100 p-2 pl-6 flex flex-wrap items-center gap-4 transition-all hover:shadow-xl hover:border-indigo-100">
        
        {/* 1. 状态筛选 (类似 Tabs) */}
        <div className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-full">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                const newVal = { ...local, status: opt.value as any };
                setLocal(newVal);
                onChange(newVal); // 实时生效
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                local.status === opt.value
                  ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200'
                  : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="w-px h-8 bg-slate-200 mx-2 hidden md:block"></div>

        {/* 2. 类别选择 */}
        <div className="relative group flex items-center">
          <Filter className="w-4 h-4 text-slate-400 mr-2 group-focus-within:text-indigo-500" />
          <select
            className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer hover:text-indigo-600 appearance-none pr-6"
            value={local.category}
            onChange={e => {
                const newVal = { ...local, category: e.target.value as any };
                setLocal(newVal);
                onChange(newVal);
            }}
          >
            <option value="all">全部分类</option>
            <option value="纵向项目">纵向项目</option>
            <option value="横向项目">横向项目</option>
            <option value="学术论文">学术论文</option>
            <option value="专利">专利成果</option>
          </select>
          <ChevronDown className="w-3 h-3 text-slate-400 absolute right-0 pointer-events-none" />
        </div>

        <div className="w-px h-8 bg-slate-200 mx-2 hidden md:block"></div>

        {/* 3. 更多筛选 (时间/经费) 触发器 */}
        <button 
          onClick={() => setExpandTime(!expandTime)}
          className={`flex items-center text-sm font-medium transition-colors ${expandTime ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          {expandTime ? '收起筛选' : '高级筛选'}
        </button>

        <div className="flex-1"></div>

        {/* 4. 搜索/刷新按钮 */}
        <button 
          onClick={handleApply}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full w-10 h-10 flex items-center justify-center transition-transform active:scale-90 shadow-md shadow-indigo-500/30"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      {/* 5. 展开的高级筛选面板 (折叠动画) */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandTime ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
        <div className="bg-white/60 backdrop-blur-sm border border-white rounded-2xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* 时间范围 */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="flex-1 flex items-center gap-2">
              <input 
                type="date" 
                className="bg-white border border-slate-200 text-xs rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition w-full"
                value={local.dateFrom || ''}
                onChange={e => setLocal({...local, dateFrom: e.target.value})}
              />
              <span className="text-slate-300">-</span>
              <input 
                type="date" 
                className="bg-white border border-slate-200 text-xs rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition w-full"
                value={local.dateTo || ''}
                onChange={e => setLocal({...local, dateTo: e.target.value})}
              />
            </div>
          </div>

          {/* 经费范围 */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500 uppercase">经费(万)</span>
            <div className="flex-1 flex items-center gap-2">
              <input 
                type="number" placeholder="Min"
                className="bg-white border border-slate-200 text-xs rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition w-full"
                value={local.fundingMin || ''}
                onChange={e => setLocal({...local, fundingMin: Number(e.target.value)})}
              />
              <span className="text-slate-300">-</span>
              <input 
                type="number" placeholder="Max"
                className="bg-white border border-slate-200 text-xs rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition w-full"
                value={local.fundingMax || ''}
                onChange={e => setLocal({...local, fundingMax: Number(e.target.value)})}
              />
            </div>
            <button onClick={handleApply} className="text-xs text-indigo-600 font-bold hover:underline">确认</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;