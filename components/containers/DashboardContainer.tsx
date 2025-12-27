import React from 'react';
import FilterBar, { Filters } from '../FilterBar';

export default function DashboardContainer({
  filters,
  onFiltersChange,
  children,
}: {
  filters: Filters;
  onFiltersChange: (f: Filters) => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <FilterBar value={filters} onChange={onFiltersChange} />
      <div className="h-4" />
      {children}
    </>
  );
}
