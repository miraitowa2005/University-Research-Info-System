
import React, { useState, useEffect } from 'react';
import { ResearchSubtype, User, ResearchItem } from '../types';

interface Props {
  subtypes: ResearchSubtype[];
  currentUser: User;
  onSubmit: (item: ResearchItem) => void;
  onCancel: () => void;
}

export const DynamicForm: React.FC<Props> = ({ subtypes, currentUser, onSubmit, onCancel }) => {
  const [selectedTypeId, setSelectedTypeId] = useState<string>(subtypes[0]?.id || '');
  const [baseData, setBaseData] = useState({
    title: '',
    teamMembers: '',
  });
  const [dynamicData, setDynamicData] = useState<Record<string, any>>({});
  const [backendSubtypeMap, setBackendSubtypeMap] = useState<Record<string, number>>({});

  const activeSubtype = subtypes.find(s => s.id === selectedTypeId);

  // Reset dynamic data when type changes
  useEffect(() => {
    setDynamicData({});
  }, [selectedTypeId]);

  useEffect(() => {
    (async () => {
      try {
        const subs = await (await import('../logic/api')).researchAPI.listSubtypes();
        const map: Record<string, number> = {};
        subs.forEach((s: any) => { map[s.name] = s.id; });
        setBackendSubtypeMap(map);
      } catch {}
    })();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubtype) return;

    // Create a summary detail string based on the first few dynamic fields
    const details = activeSubtype.fields
      .slice(0, 2)
      .map(f => `${f.label}: ${dynamicData[f.key] || '-'}`)
      .join(', ');

    const newItem: ResearchItem = {
      id: `r${Date.now()}`,
      title: baseData.title,
      authorId: currentUser.id,
      authorName: currentUser.name,
      category: activeSubtype.category,
      subtype_id: backendSubtypeMap[activeSubtype.name] ?? activeSubtype.db_id,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      details: details,
      content_json: dynamicData,
      teamMembers: baseData.teamMembers.split(/[,，、]/).map(s => s.trim()).filter(Boolean)
    };

    onSubmit(newItem);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-3xl mx-auto">
      <div className="border-b border-gray-100 pb-6 mb-6">
        <h3 className="text-lg font-bold text-gray-900">申报新科研项目/成果</h3>
        <p className="text-sm text-gray-500 mt-1">动态表单引擎会自动根据选择的成果类型加载所需字段。</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">成果具体类型 <span className="text-red-500">*</span></label>
          <select
            className="block w-full rounded-lg bg-gray-50 border border-gray-200 px-4 py-2.5 text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all text-sm"
            value={selectedTypeId}
            onChange={e => setSelectedTypeId(e.target.value)}
          >
            {subtypes.map(st => (
              <option key={st.id} value={st.id}>{st.name}</option>
            ))}
          </select>
        </div>

        {/* Base Fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">标题/名称 <span className="text-red-500">*</span></label>
          <input
            required
            type="text"
            className="block w-full rounded-lg bg-gray-50 border border-gray-200 px-4 py-2.5 text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all text-sm"
            value={baseData.title}
            onChange={e => setBaseData({ ...baseData, title: e.target.value })}
            placeholder="请输入项目或论文全称"
          />
        </div>

        {/* Dynamic Fields */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-5">
           <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">详细信息 ({activeSubtype?.name})</h4>
           {activeSubtype?.fields.map(field => (
             <div key={field.key}>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 {field.label} {field.required && <span className="text-red-500">*</span>}
                 {field.isSensitive && <span className="ml-2 text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">敏感数据</span>}
               </label>
               
               {field.type === 'textarea' ? (
                 <textarea
                   required={field.required}
                   rows={3}
                   className="block w-full rounded-lg bg-white border border-gray-200 px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all text-sm"
                   value={dynamicData[field.key] || ''}
                   onChange={e => setDynamicData({...dynamicData, [field.key]: e.target.value})}
                 />
               ) : field.type === 'select' ? (
                 <select
                    required={field.required}
                    className="block w-full rounded-lg bg-white border border-gray-200 px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all text-sm"
                    onChange={e => setDynamicData({...dynamicData, [field.key]: e.target.value})}
                    defaultValue=""
                 >
                   <option value="" disabled>请选择</option>
                   {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                 </select>
               ) : (
                 <input
                   type={field.type}
                   required={field.required}
                   placeholder={field.placeholder}
                   className="block w-full rounded-lg bg-white border border-gray-200 px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all text-sm"
                   onChange={e => setDynamicData({...dynamicData, [field.key]: e.target.value})}
                 />
               )}
             </div>
           ))}
        </div>

        {/* Team Members */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">合作成员</label>
          <input
            type="text"
            className="block w-full rounded-lg bg-gray-50 border border-gray-200 px-4 py-2.5 text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all text-sm"
            value={baseData.teamMembers}
            onChange={e => setBaseData({ ...baseData, teamMembers: e.target.value })}
            placeholder="姓名1, 姓名2 (选填)"
          />
        </div>

        <div className="flex justify-end pt-6 gap-3">
          <button type="button" onClick={onCancel} className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium transition">
            取消
          </button>
          <button type="submit" className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition shadow-sm text-sm font-medium">
            保存提交
          </button>
        </div>
      </form>
    </div>
  );
};
