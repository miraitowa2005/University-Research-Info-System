import React, { useEffect, useState } from 'react';
import { X, CheckCircle, XCircle, FileText } from 'lucide-react';
import { templatesAPI } from '../logic/api';

interface ReviewTemplate {
  id: number;
  title: string;
  content: string;
  is_shared: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  selectedCount: number;
  defaultAction: 'Approved' | 'Rejected';
  onConfirm: (action: 'Approved' | 'Rejected', remarks: string) => void;
}

export const BatchReviewModal: React.FC<Props> = ({ open, onClose, selectedCount, defaultAction, onConfirm }) => {
  const [action, setAction] = useState<'Approved' | 'Rejected'>(defaultAction);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<ReviewTemplate[]>([]);

  useEffect(() => {
    setAction(defaultAction);
  }, [defaultAction]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    templatesAPI.list()
      .then(setTemplates)
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false));
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">批量审核（{selectedCount} 项）</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-4">
            {/* Action select */}
            <div className="flex items-center gap-4">
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 cursor-pointer">
                <input type="radio" name="action" className="mr-2" checked={action === 'Approved'} onChange={() => setAction('Approved')} />
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>通过</span>
              </label>
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 cursor-pointer">
                <input type="radio" name="action" className="mr-2" checked={action === 'Rejected'} onChange={() => setAction('Rejected')} />
                <XCircle className="w-4 h-4 text-red-600" />
                <span>驳回</span>
              </label>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">审核意见</label>
              <textarea
                rows={8}
                className="w-full rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-sm p-3"
                placeholder="请输入审核意见，或从右侧模板选择"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          </div>

          {/* Templates */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-2 text-gray-700">
              <FileText className="w-4 h-4" />
              <span className="text-sm font-medium">审核意见模板</span>
            </div>
            <div className="space-y-2 max-h-64 overflow-auto">
              {loading && <div className="text-sm text-gray-400">加载模板中...</div>}
              {!loading && templates.length === 0 && (
                <div className="text-sm text-gray-400">暂无模板</div>
              )}
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => setRemarks(tpl.content)}
                  className="w-full text-left p-2 rounded-lg border border-gray-200 hover:bg-indigo-50 hover:border-indigo-200"
                >
                  <div className="text-sm font-medium text-gray-800">{tpl.title}</div>
                  <div className="text-xs text-gray-500 line-clamp-2">{tpl.content}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">取消</button>
          <button
            onClick={() => onConfirm(action, remarks)}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            确认批量{action === 'Approved' ? '通过' : '驳回'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BatchReviewModal;

