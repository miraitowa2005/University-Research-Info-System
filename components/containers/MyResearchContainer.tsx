import React, { useState } from 'react';
import FilterBar, { Filters } from '../FilterBar';
import { ResearchTable } from '../QuadTable';
import { User, ResearchItem } from '../../types';
import { Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

export default function MyResearchContainer({
  data,
  currentUser,
  filters,
  onFiltersChange,
  onSubmit,
  onViewDetail,
  onExport,
  onDelete,
}: {
  data: ResearchItem[];
  currentUser: User;
  filters: Filters;
  onFiltersChange: (f: Filters) => void;
  onSubmit: (id: string) => void;
  onViewDetail: (item: ResearchItem) => void;
  onExport: () => void;
  onDelete: (id: string) => Promise<void> | void;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelect = (id: string, selected: boolean) => {
    setSelectedIds(prev => {
      const set = new Set(prev);
      if (selected) set.add(id); else set.delete(id);
      return Array.from(set);
    });
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedIds(data.map(d => d.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleBatchDelete = async () => {
    if (!selectedIds.length) return;
    if (!confirm(`确认删除选中的 ${selectedIds.length} 条记录？`)) return;
    const targets = data.filter(d => selectedIds.includes(d.id)).map(d => d.id);
    if (!targets.length) { toast.warn('没有可删除的记录'); return; }
    try {
      for (const id of targets) {
        await Promise.resolve(onDelete(id));
      }
      setSelectedIds([]);
      toast.success('已删除选中记录');
    } catch (e: any) {
      toast.error(e?.message || '删除失败');
    }
  };

  return (
    <>
      <FilterBar value={filters} onChange={onFiltersChange} />
      <div className="h-4" />
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm text-slate-500">
          {selectedIds.length > 0 ? `已选中 ${selectedIds.length} 项` : ''}
        </div>
        {selectedIds.length > 0 && (
          <button onClick={handleBatchDelete} className="flex items-center gap-2 px-3 py-2 bg-white border border-red-300 text-red-700 rounded-md shadow-sm text-sm font-medium hover:bg-red-50 transition">
            <Trash2 className="w-4 h-4" /> 删除选中
          </button>
        )}
      </div>
      <ResearchTable
        data={data}
        currentUser={currentUser}
        selectedIds={selectedIds}
        onSelect={handleSelect}
        onSelectAll={handleSelectAll}
        onSubmit={onSubmit}
        onViewDetail={onViewDetail}
        onExport={onExport}
      />
    </>
  );
}
