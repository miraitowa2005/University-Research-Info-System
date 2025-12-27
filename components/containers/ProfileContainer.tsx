import React from 'react';
import { AcademicProfile } from '../AcademicProfile';
import TeacherNotifications from '../TeacherNotifications';
import { User, ResearchItem } from '../../types';
import { noticeAPI } from '../../logic/api';
import { toast } from 'react-toastify';

export default function ProfileContainer({
  user,
  filteredItems,
  impactItems,
  notices,
  unreadCount,
  onNoticesRefresh,
  onUnreadChange,
  category,
  onCategoryChange,
}: {
  user: User;
  filteredItems: ResearchItem[];
  impactItems: ResearchItem[];
  notices: any[];
  unreadCount: number;
  onNoticesRefresh: (ns: any[]) => void;
  onUnreadChange: (n: number) => void;
  category: string;
  onCategoryChange: (v: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-500">类别</label>
          <select
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            value={category}
            onChange={e => onCategoryChange(e.target.value)}
          >
            <option value="all">全部</option>
            <option value="纵向项目">纵向项目</option>
            <option value="横向项目">横向项目</option>
            <option value="学术论文">学术论文</option>
            <option value="出版著作">出版著作</option>
            <option value="专利">专利</option>
            <option value="科技奖励">科技奖励</option>
          </select>
        </div>
      </div>
      <AcademicProfile user={user} researchItems={filteredItems} impactItems={impactItems} />
      <TeacherNotifications
        notices={notices}
        onMarkRead={async (id) => {
          try {
            await noticeAPI.markRead(id);
            const ns = await noticeAPI.my();
            onNoticesRefresh(ns);
            onUnreadChange(Math.max(0, unreadCount - 1));
            toast.success('已标记为已读');
          } catch (e: any) {
            toast.error((e as any)?.message || '操作失败');
          }
        }}
        unreadCount={unreadCount}
      />
    </div>
  );
}

