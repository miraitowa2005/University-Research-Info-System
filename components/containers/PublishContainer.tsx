import React from 'react';
import { noticeAPI } from '../../logic/api';
import { toast } from 'react-toastify';
import { User } from '../../types';

export default function PublishContainer({
  deptList,
  currentUser,
}: {
  deptList: { code: string; name: string }[];
  currentUser: User | null;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-medium mb-4 text-gray-900">发布新通知</h3>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">通知标题</label>
        <input
          type="text"
          className="block w-full rounded-lg bg-gray-50 border border-gray-200 text-gray-900 px-4 py-2.5 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all sm:text-sm"
          placeholder="请输入标题..."
          id="notice_title"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">通知正文</label>
        <textarea
          className="block w-full rounded-lg bg-gray-50 border border-gray-200 text-gray-900 px-4 py-2.5 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all sm:text-sm"
          rows={6}
          placeholder="请输入通知正文..."
          id="notice_content"
        ></textarea>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">目标群体</label>
          <select
            id="notice_role"
            className="block w-full rounded-lg bg-gray-50 border border-gray-200 px-4 py-2.5 text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all sm:text-sm"
          >
            <option value="teacher">教师/科研人员</option>
            <option value="research_admin">科研管理员</option>
            <option value="sys_admin">系统管理员</option>
            <option value="all">全体</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">目标院系（可选）</label>
          <select
            id="notice_dept_code"
            className="block w-full rounded-lg bg-gray-50 border border-gray-200 px-4 py-2.5 text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all sm:text-sm"
          >
            <option value="">不限定院系</option>
            {deptList.map((d) => (
              <option key={d.code} value={d.code}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-end">
        <button
          onClick={async () => {
            const title = (document.getElementById('notice_title') as HTMLInputElement)?.value || '';
            const content = (document.getElementById('notice_content') as HTMLTextAreaElement)?.value || '';
            const role = (document.getElementById('notice_role') as HTMLSelectElement)?.value || 'teacher';
            const deptCode = (document.getElementById('notice_dept_code') as HTMLSelectElement)?.value || '';
            const dept = deptCode ? deptList.find((d: any) => d.code === deptCode)?.name || undefined : undefined;
            if (!title || !content) {
              toast.error('请填写标题与内容');
              return;
            }
            try {
              await noticeAPI.create({
                title,
                content,
                target_role: role,
                target_department: dept,
                target_department_code: deptCode || undefined,
                publisher: currentUser?.name,
              } as any);
              toast.success('通知已发布');
            } catch (e: any) {
              toast.error(e.message || '发布失败');
            }
          }}
          className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition font-medium"
        >
          发布通知
        </button>
      </div>
    </div>
  );
}

