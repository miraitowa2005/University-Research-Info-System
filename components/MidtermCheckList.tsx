import React from 'react';
import { ResearchItem, User } from '../types';

interface Props {
  data: ResearchItem[];
  onViewDetail: (item: ResearchItem) => void;
}

const daysUntil = (dateStr?: string) => {
  if (!dateStr) return null;
  try {
    const now = new Date();
    const target = new Date(dateStr);
    const ms = target.getTime() - now.getTime();
    return Math.ceil(ms / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
};

export const MidtermCheckList: React.FC<Props> = ({ data, onViewDetail }) => {
  const projectItems = data.filter(i => String(i.category || '').includes('项目'));
  const enriched = projectItems.map(it => {
    const cj: any = (it as any)?.content_json || {};
    const mid = cj.midterm_date || cj.midterm_due || cj.end_date;
    const d = daysUntil(mid);
    return { item: it, midterm_date: mid, days_left: d };
  }).filter(x => typeof x.days_left === 'number');

  const upcoming = enriched
    .filter(x => (x.days_left as number) <= 30)
    .sort((a, b) => (a.days_left as number) - (b.days_left as number));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">即将到期的项目中期检查</h3>
        <span className="text-sm text-gray-500">未来30天 · {upcoming.length} 项</span>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">项目名称</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类别</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">负责人</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">中期检查日期</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">剩余天数</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {upcoming.map(({ item, midterm_date, days_left }) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.title}</td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-600">{item.category}</td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-600">{item.authorName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-600">{midterm_date || '-'}</td>
              <td className={`px-6 py-4 whitespace-nowrap font-medium ${typeof days_left === 'number' && days_left <= 7 ? 'text-red-600' : 'text-amber-600'}`}>{typeof days_left === 'number' ? days_left : '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <button onClick={() => onViewDetail(item)} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">查看</button>
              </td>
            </tr>
          ))}
          {upcoming.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-gray-500">未来30天内暂无需要中期检查的项目</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MidtermCheckList;
