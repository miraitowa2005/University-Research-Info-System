import React from 'react';
import MidtermCheckList from '../MidtermCheckList';
import { ResearchItem } from '../../types';

export default function MidtermContainer({
  data,
  onViewDetail,
}: {
  data: ResearchItem[];
  onViewDetail: (item: any) => void;
}) {
  return <MidtermCheckList data={data} onViewDetail={onViewDetail} />;
}

