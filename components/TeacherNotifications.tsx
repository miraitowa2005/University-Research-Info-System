import React from 'react';

interface Notice {
  id: number;
  title: string;
  content: string;
  target_role: string;
  target_department?: string;
  publisher?: string;
  created_at: string;
}

interface Props {
  notices: Notice[];
  onMarkRead?: (id: number) => void;
  unreadCount?: number;
}

const fmt = (s?: string) => {
  if (!s) return '';
  try {
    const d = new Date(s);
    return d.toLocaleString();
  } catch {
    return s;
  }
};

export const TeacherNotifications: React.FC<Props> = ({ notices, onMarkRead, unreadCount }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">通知中心</h3>
        <span className="text-sm text-gray-500">共 {notices.length} 条{typeof unreadCount === 'number' ? ` · 未读 ${unreadCount}` : ''}</span>
      </div>
      <div className="divide-y divide-gray-100">
        {notices.map(n => (
          <div key={n.id} className="p-4 hover:bg-gray-50 transition">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-gray-900 font-medium">{n.title}</div>
                <div className="text-xs text-gray-500 mt-1">{fmt(n.created_at)} · {n.publisher || '科研管理员'}</div>
              </div>
              {n.target_department && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                  {n.target_department}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-700 mt-3 whitespace-pre-wrap">{n.content}</p>
            {onMarkRead && (
              <div className="mt-3">
                <button onClick={() => onMarkRead!(n.id)} className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200">标记为已读</button>
              </div>
            )}
          </div>
        ))}
        {notices.length === 0 && (
          <div className="p-8 text-center text-gray-500">暂无通知</div>
        )}
      </div>
    </div>
  );
};

export default TeacherNotifications;
