import React, { useState, useMemo } from 'react';
import FilterBar, { Filters } from '../FilterBar';
import { ResearchItem, User } from '../../types';
import { 
  CheckCircle2, XCircle, Clock, Eye, MoreHorizontal, 
  User as UserIcon, Calendar, Shield, Search, 
  CheckSquare, Square, ArrowUpRight, Filter as FilterIcon,
  LayoutList
} from 'lucide-react';

/**
 * 🎨 AuditContainer - 极简主义科研审核清单
 * 设计风格：Linear / Notion 风格的高效列表，强调阅读流畅性与操作便捷性。
 */
export default function AuditContainer({
  data,
  currentUser,
  filters,
  onFiltersChange,
  onApprove,
  onReject,
  onViewDetail,
  onExport,
}: {
  data: ResearchItem[];
  currentUser: User;
  filters: Filters;
  onFiltersChange: (f: Filters) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onViewDetail: (item: ResearchItem) => void;
  onExport: () => void;
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // --- 1. 数据统计 (顶部仪表盘) ---
  const stats = useMemo(() => {
    const pending = data.filter(i => i.status.toLowerCase() === 'pending');
    return {
      pendingCount: pending.length,
      urgentCount: pending.filter(i => i.category.includes('项目')).length, // 假设项目类优先级更高
      passRate: '85%', // 模拟数据
    };
  }, [data]);

  // --- 2. 选择逻辑 ---
  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === data.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(data.map(i => i.id)));
  };

  const handleBatchApprove = () => {
    if (confirm(`确定要批量通过选中的 ${selectedIds.size} 项吗？`)) {
      selectedIds.forEach(id => onApprove(id));
      setSelectedIds(new Set());
    }
  };

  // --- 3. 辅助组件：状态徽标 ---
  const StatusBadge = ({ status }: { status: string }) => {
    const s = status.toLowerCase();
    if (s === 'approved') return (
      <span className="flex items-center px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></div>已通过
      </span>
    );
    if (s === 'rejected') return (
      <span className="flex items-center px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-100">
        <div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2"></div>已驳回
      </span>
    );
    return (
      <span className="flex items-center px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 animate-pulse"></div>审核中
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* === Header: 数据概览 === */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-100 transition-colors">
          <div>
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">待审核任务</div>
            <div className="text-3xl font-black text-slate-800 mt-1">{stats.pendingCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <LayoutList className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-amber-100 transition-colors">
          <div>
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">加急/重点项目</div>
            <div className="text-3xl font-black text-amber-600 mt-1">{stats.urgentCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-emerald-100 transition-colors">
          <div>
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">本月通过率</div>
            <div className="text-3xl font-black text-emerald-600 mt-1">65%</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* === Filter Bar === */}
      <FilterBar value={filters} onChange={onFiltersChange} />

      {/* === Main List View === */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* List Header */}
        <div className="flex items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <div className="w-10 flex justify-center cursor-pointer" onClick={toggleSelectAll}>
            {selectedIds.size > 0 && selectedIds.size === data.length ? (
              <CheckSquare className="w-4 h-4 text-indigo-600" />
            ) : (
              <Square className="w-4 h-4 hover:text-slate-800" />
            )}
          </div>
          <div className="flex-1 pl-2">项目 / 成果详情</div>
          <div className="w-32 hidden md:block">类别</div>
          <div className="w-40 hidden md:block">负责人 & 部门</div>
          <div className="w-28 text-center">状态</div>
          <div className="w-32 text-right pr-4">操作</div>
        </div>

        {/* List Items */}
        <div className="divide-y divide-slate-50">
          {data.map((item) => {
            const isSelected = selectedIds.has(item.id);
            const isPending = item.status.toLowerCase() === 'pending';

            return (
              <div 
                key={item.id} 
                className={`
                  group flex items-center px-6 py-4 transition-all duration-200 hover:bg-slate-50 relative
                  ${isSelected ? 'bg-indigo-50/30' : ''}
                `}
              >
                {/* 选中高亮条 */}
                {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>}

                {/* Checkbox */}
                <div className="w-10 flex justify-center flex-shrink-0 cursor-pointer text-slate-300 hover:text-indigo-500" onClick={() => toggleSelect(item.id)}>
                  {isSelected ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : <Square className="w-4 h-4" />}
                </div>

                {/* Content: Title & Meta */}
                <div className="flex-1 pl-2 min-w-0 pr-6">
                  <div className="flex items-baseline gap-3 mb-1">
                    <h4 
                      className="text-sm font-bold text-slate-800 truncate hover:text-indigo-600 cursor-pointer transition-colors"
                      onClick={() => onViewDetail(item)}
                    >
                      {item.title}
                    </h4>
                    {/* 经费Tag (如果有) */}
                    {(item as any).content_json?.funding && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-100">
                        ¥{(item as any).content_json.funding}万
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center font-mono">
                      <Clock className="w-3 h-3 mr-1" /> {item.date}
                    </span>
                    <span className="truncate max-w-[200px] hidden sm:block">
                      {item.details || '暂无详细描述...'}
                    </span>
                  </div>
                </div>

                {/* Category */}
                <div className="w-32 hidden md:flex flex-shrink-0">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold">
                    {item.category}
                  </span>
                </div>

                {/* Author */}
                <div className="w-40 hidden md:block flex-shrink-0">
                  <div className="flex items-center">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-100 to-white border border-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-600 mr-2">
                      {item.authorName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-700">{item.authorName}</div>
                      <div className="text-[10px] text-slate-400">计算机学院</div>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="w-28 flex justify-center flex-shrink-0">
                  <StatusBadge status={item.status} />
                </div>

                {/* Actions (Hover Reveal) */}
                <div className="w-32 flex justify-end items-center gap-2 pl-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isPending ? (
                    <>
                      <button 
                        onClick={() => onApprove(item.id)} 
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:scale-105 transition border border-emerald-100"
                        title="快速通过"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onReject(item.id)} 
                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:scale-105 transition border border-red-100"
                        title="快速驳回"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <span className="text-[10px] text-slate-300">已归档</span>
                  )}
                  <button 
                    onClick={() => onViewDetail(item)}
                    className="p-1.5 rounded-lg bg-slate-50 text-slate-500 hover:bg-white hover:text-indigo-600 hover:shadow-sm border border-transparent hover:border-slate-200 transition"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {data.length === 0 && (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-sm font-medium">没有找到相关记录</p>
            </div>
          )}
        </div>
      </div>

      {/* === 底部浮动批量操作栏 (Floating Batch Actions) === */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 transition-all duration-300 z-50 ${selectedIds.size > 0 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
        <div className="text-sm font-bold flex items-center">
          <div className="bg-indigo-500 w-5 h-5 rounded-full flex items-center justify-center text-[10px] mr-2">
            {selectedIds.size}
          </div>
          项已选择
        </div>
        <div className="h-4 w-px bg-white/20"></div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleBatchApprove}
            className="flex items-center px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-full text-xs font-bold transition active:scale-95"
          >
            <CheckCircle2 className="w-3 h-3 mr-1.5" /> 批量通过
          </button>
          <button 
            className="flex items-center px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-xs font-bold transition active:scale-95"
          >
            <MoreHorizontal className="w-3 h-3 mr-1.5" /> 其他操作
          </button>
        </div>
        <button 
          onClick={() => setSelectedIds(new Set())}
          className="ml-2 text-slate-400 hover:text-white"
        >
          <XCircle className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
}
