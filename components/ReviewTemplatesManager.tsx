import React, { useEffect, useState, useMemo } from 'react';
import { 
  Plus, Trash2, Save, FileText, Search, Copy, 
  LayoutTemplate, Check, Sparkles, User, Globe, PenTool
} from 'lucide-react';
import { templatesAPI } from '../logic/api';
import { toast } from 'react-toastify';

interface ReviewTemplate {
  id: number;
  title: string;
  content: string;
  is_shared: boolean;
  updated_at?: string;
}

const ReviewTemplatesManager: React.FC = () => {
  const [list, setList] = useState<ReviewTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'personal' | 'shared'>('all');
  
  // 当前选中的模板（null 代表准备新建）
  const [selectedId, setSelectedId] = useState<number | null>(null);
  
  // 编辑表单状态
  const [formData, setFormData] = useState({ title: '', content: '', is_shared: false });

  // 模拟一些智能变量
  const smartVariables = [
    { label: '申请人姓名', value: '{applicant_name}' },
    { label: '项目名称', value: '{project_title}' },
    { label: '缺少材料', value: '{missing_docs}' },
    { label: '截止日期', value: '{deadline}' },
  ];

  const load = async () => {
    setLoading(true);
    try {
      const data = await templatesAPI.list();
      setList(data);
      // 如果没有选中项且列表不为空，默认选中第一个，或者保持新建状态
      if (data.length > 0 && selectedId === null) {
        // Optional: select first
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // 切换选中项时填充表单
  useEffect(() => {
    if (selectedId) {
      const item = list.find(i => i.id === selectedId);
      if (item) setFormData({ title: item.title, content: item.content, is_shared: item.is_shared });
    } else {
      setFormData({ title: '', content: '', is_shared: false }); // 新建模式
    }
  }, [selectedId, list]);

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      toast.warning('请填写完整的模板信息');
      return;
    }
    
    // 这里简化处理：如果是新建则调create，如果是编辑(现有API可能不支持update)则先删后加或提示
    // 假设 api 只有 create 和 delete，实际业务通常会有 update。
    // 为了演示效果，这里模拟更新：
    
    if (selectedId) {
      // 模拟更新：先删后增 (Hack for demo)
      await templatesAPI.delete(selectedId);
    }
    
    await templatesAPI.create(formData);
    toast.success(selectedId ? '模板已更新' : '模板已创建');
    await load();
    if (!selectedId) {
      // 如果是新建，清空表单
      setFormData({ title: '', content: '', is_shared: false });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除此审核模板吗？此操作不可恢复。')) return;
    await templatesAPI.delete(id);
    toast.success('模板已删除');
    if (selectedId === id) setSelectedId(null);
    await load();
  };

  const insertVariable = (val: string) => {
    setFormData({ ...formData, content: formData.content + val });
  };

  // 过滤逻辑
  const filteredList = useMemo(() => {
    return list.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === 'all' ? true : 
                         activeTab === 'shared' ? item.is_shared : 
                         !item.is_shared;
      return matchesSearch && matchesTab;
    });
  }, [list, searchQuery, activeTab]);

  return (
    <div className="flex h-[calc(100vh-140px)] min-h-[600px] bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 animate-in fade-in duration-500">
      
      {/* === 左侧：资源库列表 (Library Sidebar) === */}
      <div className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col flex-shrink-0">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-bold text-slate-800 flex items-center mb-4">
            <LayoutTemplate className="w-5 h-5 mr-2 text-indigo-600" />
            审核标准库
          </h3>
          
          {/* Search */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="搜索模板..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Tabs */}
          <div className="flex bg-slate-200/50 p-1 rounded-lg">
            {['all', 'personal', 'shared'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-all ${
                  activeTab === tab 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab === 'all' ? '全部' : tab === 'personal' ? '私有' : '共享'}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <button 
            onClick={() => setSelectedId(null)}
            className={`w-full text-left p-3 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 mb-2 ${selectedId === null ? 'bg-indigo-50 border-indigo-400 text-indigo-700' : ''}`}
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-bold">新建标准模板</span>
          </button>

          {filteredList.map(tpl => (
            <div 
              key={tpl.id}
              onClick={() => setSelectedId(tpl.id)}
              className={`group p-3 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                selectedId === tpl.id 
                  ? 'bg-white border-indigo-500 ring-1 ring-indigo-500 shadow-sm z-10' 
                  : 'bg-white border-slate-200 hover:border-indigo-300'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <h4 className={`text-sm font-bold truncate pr-2 ${selectedId === tpl.id ? 'text-indigo-900' : 'text-slate-700'}`}>
                  {tpl.title}
                </h4>
                {tpl.is_shared && <Globe className="w-3 h-3 text-indigo-400 flex-shrink-0 mt-1" />}
              </div>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {tpl.content}
              </p>
            </div>
          ))}
          
          {filteredList.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-400">
              未找到相关模板
            </div>
          )}
        </div>
      </div>

      {/* === 右侧：配置终端 (Editor Console) === */}
      <div className="flex-1 flex flex-col bg-white">
        
        {/* Editor Header */}
        <div className="h-16 px-8 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${selectedId === null ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>
              {selectedId === null ? <Plus className="w-5 h-5" /> : <PenTool className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {selectedId === null ? '创建新模板' : '编辑模板配置'}
              </h2>
              <p className="text-xs text-slate-400">
                {selectedId === null ? '定义一个新的审核反馈标准' : '修改现有的审核话术与规则'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {selectedId && (
              <button 
                onClick={() => handleDelete(selectedId)}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                title="删除模板"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <div className="h-6 w-px bg-slate-200 mx-1"></div>
            <button 
              onClick={handleSave}
              className="flex items-center px-6 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-900/20 active:scale-95 transition-all"
            >
              <Save className="w-4 h-4 mr-2" />
              保存配置
            </button>
          </div>
        </div>

        {/* Editor Body */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-3xl mx-auto space-y-6">
            
            {/* Title Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">模板标题 (Keyword)</label>
              <input 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="例如：材料缺失驳回 / 经费预算过高"
                className="w-full text-xl font-bold text-slate-800 placeholder-slate-300 border-b-2 border-slate-100 py-2 focus:border-indigo-500 outline-none transition-colors bg-transparent"
              />
            </div>

            {/* Scope Toggle */}
            <div className="flex items-center gap-4 py-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">适用范围</label>
              <div className="flex bg-slate-100 rounded-lg p-1">
                <button 
                  onClick={() => setFormData({...formData, is_shared: false})}
                  className={`flex items-center px-4 py-1.5 rounded-md text-xs font-bold transition-all ${!formData.is_shared ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <User className="w-3 h-3 mr-2" /> 仅个人可见
                </button>
                <button 
                  onClick={() => setFormData({...formData, is_shared: true})}
                  className={`flex items-center px-4 py-1.5 rounded-md text-xs font-bold transition-all ${formData.is_shared ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Globe className="w-3 h-3 mr-2" /> 全校共享
                </button>
              </div>
            </div>

            {/* Smart Variables */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                  <Sparkles className="w-3 h-3 mr-1 text-amber-500" /> 智能变量 (点击插入)
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                {smartVariables.map(v => (
                  <button
                    key={v.value}
                    onClick={() => insertVariable(v.value)}
                    className="px-2.5 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-mono rounded-md hover:bg-indigo-100 hover:border-indigo-200 transition active:scale-95"
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Textarea */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">回复内容模板</label>
              <div className="relative">
                <textarea 
                  value={formData.content}
                  onChange={e => setFormData({...formData, content: e.target.value})}
                  rows={12}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-5 text-sm text-slate-700 font-medium leading-relaxed focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-y"
                  placeholder="在此输入审核意见。支持使用上方变量，例如：
                  
您好 {applicant_name}，
您提交的《{project_title}》经审核发现..."
                ></textarea>
                <div className="absolute bottom-4 right-4 text-xs text-slate-400 pointer-events-none">
                  支持 Markdown 语法
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewTemplatesManager;