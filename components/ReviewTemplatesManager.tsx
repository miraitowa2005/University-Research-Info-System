import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Save, FileText } from 'lucide-react';
import { templatesAPI } from '../logic/api';

interface ReviewTemplate {
  id: number;
  title: string;
  content: string;
  is_shared: boolean;
}

const ReviewTemplatesManager: React.FC = () => {
  const [list, setList] = useState<ReviewTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isShared, setIsShared] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await templatesAPI.list();
      setList(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!title || !content) return;
    await templatesAPI.create({ title, content, is_shared: isShared });
    setTitle('');
    setContent('');
    setIsShared(false);
    await load();
  };

  const remove = async (id: number) => {
    await templatesAPI.delete(id);
    await load();
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-gray-800">
          <FileText className="w-5 h-5" />
          <h3 className="text-lg font-semibold">审核意见模板</h3>
        </div>
        <button onClick={load} className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">刷新</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="mb-2 text-sm text-gray-500">新建模板</div>
          <div className="space-y-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="模板标题，如：缺少合同扫描件"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="模板内容"
              rows={8}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={isShared} onChange={(e) => setIsShared(e.target.checked)} />
              全校共享
            </label>
            <div>
              <button onClick={create} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm">
                <Plus className="w-4 h-4" /> 创建模板
              </button>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-2 text-sm text-gray-500">我的模板 / 共享模板</div>
          <div className="space-y-2 max-h-[420px] overflow-auto">
            {loading && <div className="text-sm text-gray-400">加载中...</div>}
            {!loading && list.length === 0 && <div className="text-sm text-gray-400">暂无模板</div>}
            {list.map(tpl => (
              <div key={tpl.id} className="p-3 rounded-lg border border-gray-200 hover:border-indigo-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-800">{tpl.title}</div>
                  <div className="flex items-center gap-2">
                    {tpl.is_shared && <span className="text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">共享</span>}
                    <button onClick={() => remove(tpl.id)} className="text-red-600 hover:text-red-700" title="删除">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1 whitespace-pre-wrap">{tpl.content}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewTemplatesManager;

