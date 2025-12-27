import React from 'react';
import { CustomReportBuilder } from '../EnhancedAdminTools';
import { ResearchItem } from '../../types';

export default function ReportsContainer({ data }: { data: ResearchItem[] }) {
  return <CustomReportBuilder data={data} />;
}

