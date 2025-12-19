import React, { useState, useEffect } from 'react';

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

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const apply = () => onChange(local);
  const reset = () => onChange({ status: 'all', category: 'all' });

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row md:items-end gap-3">
      <div>
        <label className="block text-xs text-gray-500 mb-1">状态</label>
        <select
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          value={local.status}
          onChange={e => setLocal({ ...local, status: e.target.value as Filters['status'] })}
        >
          <option value="all">全部</option>
          <option value="pending">审核中</option>
          <option value="approved">已通过</option>
          <option value="rejected">已驳回</option>
          <option value="draft">草稿</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">类别</label>
        <select
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          value={local.category}
          onChange={e => setLocal({ ...local, category: e.target.value as Filters['category'] })}
        >
          <option value="all">全部</option>
          <option value="纵向项目">纵向项目</option>
          <option value="横向项目">横向项目</option>
          <option value="学术论文">学术论文</option>
          <option value="出版著作">出版著作</option>
          <option value="专利">专利</option>
          <option value="科技奖励">科技奖励</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">起始日期</label>
        <input
          type="date"
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          value={local.dateFrom || ''}
          onChange={e => setLocal({ ...local, dateFrom: e.target.value || undefined })}
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">截止日期</label>
        <input
          type="date"
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          value={local.dateTo || ''}
          onChange={e => setLocal({ ...local, dateTo: e.target.value || undefined })}
        />
      </div>

      <div className="flex items-center gap-2">
        <div>
          <label className="block text-xs text-gray-500 mb-1">经费(万) ≥</label>
          <input
            type="number"
            className="w-28 px-3 py-2 border border-gray-300 rounded-md text-sm"
            value={local.fundingMin ?? ''}
            onChange={e => setLocal({ ...local, fundingMin: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">经费(万) ≤</label>
          <input
            type="number"
            className="w-28 px-3 py-2 border border-gray-300 rounded-md text-sm"
            value={local.fundingMax ?? ''}
            onChange={e => setLocal({ ...local, fundingMax: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm" onClick={reset}>重置</button>
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm" onClick={apply}>应用筛选</button>
      </div>
    </div>
  );
};

export default FilterBar;

