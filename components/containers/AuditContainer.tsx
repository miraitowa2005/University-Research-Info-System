import React from 'react';
import FilterBar, { Filters } from '../FilterBar';
import { ResearchTable } from '../QuadTable';
import { User, ResearchItem } from '../../types';

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
  return (
    <>
      <FilterBar value={filters} onChange={onFiltersChange} />
      <div className="h-4" />
      <ResearchTable
        data={data}
        currentUser={currentUser}
        onApprove={onApprove}
        onReject={onReject}
        onViewDetail={onViewDetail}
        onExport={onExport}
      />
    </>
  );
}

