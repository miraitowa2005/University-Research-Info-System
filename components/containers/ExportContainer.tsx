import React from 'react';
import { DataExportCenter } from '../TeacherTools';
import { User, ResearchItem } from '../../types';

export default function ExportContainer({
  user,
  researchItems,
}: {
  user: User;
  researchItems: ResearchItem[];
}) {
  return <DataExportCenter user={user} researchItems={researchItems} />;
}

