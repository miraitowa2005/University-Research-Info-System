import React from 'react';
import FilterBar, { Filters } from '../FilterBar';
import { ResearchTable } from '../QuadTable';
import { User, ResearchItem } from '../../types';

export default function MyResearchContainer({
  data,
  currentUser,
  filters,
  onFiltersChange,
  onSubmit,
  onViewDetail,
  onExport,
}: {
  data: ResearchItem[];
  currentUser: User;
  filters: Filters;
  onFiltersChange: (f: Filters) => void;
  onSubmit: (id: string) => void;
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
        onSubmit={onSubmit}
        onViewDetail={onViewDetail}
        onExport={onExport}
      />
    </>
  );
}

