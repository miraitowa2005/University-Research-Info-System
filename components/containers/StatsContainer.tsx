import React from 'react';
import { StatsOverview } from '../TreeVisualizer';
import { ResearchItem, User } from '../../types';
import { YearEndDeptReport } from '../EnhancedAdminTools';

export default function StatsContainer({ data, currentUser }: { data: ResearchItem[]; currentUser?: User | null }) {
  return (
    <div className="space-y-6">
      <YearEndDeptReport currentUser={currentUser} />
      <StatsOverview data={data} />
    </div>
  );
}
