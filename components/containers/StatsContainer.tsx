import React from 'react';
import { StatsOverview } from '../TreeVisualizer';
import { ResearchItem } from '../../types';

export default function StatsContainer({ data }: { data: ResearchItem[] }) {
  return <StatsOverview data={data} />;
}

