import React, { useState, useRef, useEffect } from 'react';
import { 
  Check, ChevronRight, FileText, DollarSign, Users, UploadCloud, 
  ArrowLeft, ArrowRight, Save, Calendar, Plus, Trash2, X, Paperclip, File,
  Briefcase, BookOpen, Award, PenTool
} from 'lucide-react';
import { projectAPI } from '../logic/api';

// --- DEFINITIONS: Project Types & Steps ---
const PROJECT_TYPES = [
  { id: 'vertical', label: '纵向科研项目', icon: FileText },
  { id: 'horizontal', label: '横向科研项目', icon: Briefcase },
  { id: 'paper', label: '科研论文', icon: BookOpen },
  { id: 'book', label: '专著/著作', icon: PenTool },
  { id: 'patent', label: '专利成果', icon: File },
  { id: 'award', label: '科研获奖', icon: Award },
];

const STEPS = [
  { id: 1, title: '基本信息', icon: FileText, desc: '类别与核心元数据' },
  { id: 2, title: '详细指标', icon: DollarSign, desc: '特定类别详细数据' }, // Renamed from "Budget" to be more generic, or keep as Budget if applicable
  { id: 3, title: '团队成员', icon: Users, desc: '人员贡献与分工' },
  { id: 4, title: '附件材料', icon: UploadCloud, desc: '证明材料上传' },
];

export default function ProjectApplyForm() {
  const [currentStep, setCurrentStep] = useState(1);
  
  // --- 1. Basic Info State ---
  const [basicInfo, setBasicInfo] = useState({
    projectName: '', // Or Title for papers
    projectType: '纵向科研项目',
    projectTypeId: 'vertical', // Helper ID for switch cases
    startDate: '', // Or Publication Date
    endDate: '',   // Optional for papers/awards
    abstract: '',
  });

  // --- 2. Dynamic Category Data State (The "Content JSON") ---
  // This state holds specific fields based on projectTypeId
  const [categoryData, setCategoryData] = useState<Record<string, any>>({});

  // --- 3. Team State ---
  const [members, setMembers] = useState([
    { id: 1, name: '张三', role: '负责人/第一作者', unit: '计算机学院', task: '统筹规划' }
  ]);
  const [newMember, setNewMember] = useState({ name: '', role: '参与人', unit: '', task: '' });
  const [isAddingMember, setIsAddingMember] = useState(false);

  // --- 4. Files State ---
  const [files, setFiles] = useState<Array<{name: string, size: string, url?: string}>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- API & Phases ---
  const [phases, setPhases] = useState<Array<{id:number; name:string; deadline:string; notice_id:number}>>([]);
  const [selectedPhaseId, setSelectedPhaseId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const batches = await projectAPI.getAvailableBatches();
        const ps = (batches || []).map((b: any) => ({ id: b.batch_id, name: b.batch_name, deadline: b.end_time, notice_id: 0 }));
        setPhases(ps);
        const upcoming = (ps || []).sort((a:any,b:any)=>new Date(a.deadline).getTime()-new Date(b.deadline).getTime())[0];
        setSelectedPhaseId(upcoming ? upcoming.id : ((ps||[])[0]?.id ?? null));
      } catch (_) {}
    })();
  }, []);

  // --- Helpers ---
  const handleTypeChange = (label: string) => {
    const typeObj = PROJECT_TYPES.find(t => t.label === label);
    setBasicInfo({ 
      ...basicInfo, 
      projectType: label,
      projectTypeId: typeObj ? typeObj.id : 'vertical'
    });
    setCategoryData({}); // Reset category data on type change
  };

  const addMember = () => {
    if (!newMember.name) return;
    setMembers([...members, { id: Date.now(), ...newMember }]);
    setNewMember({ name: '', role: '参与人', unit: '', task: '' });
    setIsAddingMember(false);
  };
  const removeMember = (id: number) => setMembers(members.filter(m => m.id !== id));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFiles([...files, { name: file.name, size: `${(file.size / 1024 / 1024).toFixed(2)} MB` }]);
    }
  };
  const removeFile = (idx: number) => setFiles(files.filter((_, i) => i !== idx));

  const nextStep = () => { if (currentStep < STEPS.length) setCurrentStep(c => c + 1); };
  const prevStep = () => { if (currentStep > 1) setCurrentStep(c => c - 1); };

  // Styling
  const inputClass = "w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-100 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-medium text-slate-700 placeholder-slate-400";
  const labelClass = "block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide";
  const sectionClass = "bg-white border border-slate-200 rounded-xl p-6 shadow-sm";

  // --- Dynamic Form Renderer ---
  const renderCategoryForm = () => {
    switch (basicInfo.projectTypeId) {
      case 'vertical': // 纵向项目
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
            <div className="md:col-span-2"><h3 className="text-indigo-600 font-bold border-b border-indigo-100 pb-2 mb-2">纵向项目详细指标</h3></div>
            <div>
              <label className={labelClass}>批准号/项目编号 <span className="text-red-500">*</span></label>
              <input className={inputClass} placeholder="如：62302001" value={categoryData.project_no || ''} onChange={e => setCategoryData({...categoryData, project_no: e.target.value})} />
            </div>
            <div>
              <label className={labelClass}>项目来源 <span className="text-red-500">*</span></label>
              <select className={inputClass} value={categoryData.source || ''} onChange={e => setCategoryData({...categoryData, source: e.target.value})}>
                <option value="">请选择来源</option>
                <option>国家自然科学基金(NSFC)</option>
                <option>国家社科基金</option>
                <option>科技部重点研发计划</option>
                <option>教育部人文社科</option>
                <option>省级自然科学基金</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>批准经费 (万元) <span className="text-red-500">*</span></label>
              <input type="number" className={inputClass} placeholder="0.00" value={categoryData.funding || ''} onChange={e => setCategoryData({...categoryData, funding: e.target.value})} />
            </div>
            <div>
              <label className={labelClass}>项目级别</label>
              <select className={inputClass} value={categoryData.level || ''} onChange={e => setCategoryData({...categoryData, level: e.target.value})}>
                <option>国家级</option>
                <option>省部级</option>
                <option>市厅级</option>
                <option>校级</option>
              </select>
            </div>
          </div>
        );
      case 'horizontal': // 横向项目
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
            <div className="md:col-span-2"><h3 className="text-indigo-600 font-bold border-b border-indigo-100 pb-2 mb-2">横向项目合同信息</h3></div>
            <div>
              <label className={labelClass}>委托/合作单位 <span className="text-red-500">*</span></label>
              <input className={inputClass} placeholder="甲方单位名称" value={categoryData.partner_unit || ''} onChange={e => setCategoryData({...categoryData, partner_unit: e.target.value})} />
            </div>
            <div>
              <label className={labelClass}>合同编号</label>
              <input className={inputClass} placeholder="HT-202X-XXX" value={categoryData.contract_no || ''} onChange={e => setCategoryData({...categoryData, contract_no: e.target.value})} />
            </div>
            <div>
              <label className={labelClass}>合同总金额 (万元) <span className="text-red-500">*</span></label>
              <input type="number" className={inputClass} placeholder="0.00" value={categoryData.contract_amount || ''} onChange={e => setCategoryData({...categoryData, contract_amount: e.target.value})} />
            </div>
            <div>
              <label className={labelClass}>签订日期</label>
              <input type="date" className={inputClass} value={categoryData.sign_date || ''} onChange={e => setCategoryData({...categoryData, sign_date: e.target.value})} />
            </div>
          </div>
        );
      case 'paper': // 论文
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
            <div className="md:col-span-2"><h3 className="text-indigo-600 font-bold border-b border-indigo-100 pb-2 mb-2">论文发表信息</h3></div>
            <div className="md:col-span-2">
              <label className={labelClass}>发表期刊/会议名称 <span className="text-red-500">*</span></label>
              <input className={inputClass} placeholder="Journal Name / Conference" value={categoryData.journal || ''} onChange={e => setCategoryData({...categoryData, journal: e.target.value})} />
            </div>
            <div>
              <label className={labelClass}>收录情况 (索引)</label>
              <select className={inputClass} value={categoryData.index_type || ''} onChange={e => setCategoryData({...categoryData, index_type: e.target.value})}>
                <option value="">无/其他</option>
                <option>SCI (Q1)</option>
                <option>SCI (Q2)</option>
                <option>SCI (Q3/Q4)</option>
                <option>EI</option>
                <option>SSCI</option>
                <option>CSSCI</option>
                <option>CCF-A类</option>
                <option>CCF-B类</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>影响因子 (Impact Factor)</label>
              <input type="number" className={inputClass} placeholder="例如: 5.4" value={categoryData.impact_factor || ''} onChange={e => setCategoryData({...categoryData, impact_factor: e.target.value})} />
            </div>
            <div>
              <label className={labelClass}>发表日期 <span className="text-red-500">*</span></label>
              <input type="date" className={inputClass} value={categoryData.publish_date || ''} onChange={e => setCategoryData({...categoryData, publish_date: e.target.value})} />
            </div>
            <div>
              <label className={labelClass}>DOI (Digital Object Identifier)</label>
              <input className={inputClass} placeholder="10.xxxx/xxxx" value={categoryData.doi || ''} onChange={e => setCategoryData({...categoryData, doi: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>卷/期/页码</label>
              <input className={inputClass} placeholder="Vol.xx, No.xx, pp.xxx-xxx" value={categoryData.vol_issue_page || ''} onChange={e => setCategoryData({...categoryData, vol_issue_page: e.target.value})} />
            </div>
          </div>
        );
      case 'book': // 专著
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
            <div className="md:col-span-2"><h3 className="text-indigo-600 font-bold border-b border-indigo-100 pb-2 mb-2">专著/著作信息</h3></div>
            <div>
              <label className={labelClass}>出版社 <span className="text-red-500">*</span></label>
              <input className={inputClass} value={categoryData.publisher || ''} onChange={e => setCategoryData({...categoryData, publisher: e.target.value})} />
            </div>
            <div>
              <label className={labelClass}>ISBN 书号</label>
              <input className={inputClass} placeholder="978-..." value={categoryData.isbn || ''} onChange={e => setCategoryData({...categoryData, isbn: e.target.value})} />
            </div>
            <div>
              <label className={labelClass}>总字数 (千字)</label>
              <input type="number" className={inputClass} value={categoryData.word_count || ''} onChange={e => setCategoryData({...categoryData, word_count: e.target.value})} />
            </div>
            <div>
              <label className={labelClass}>出版语言</label>
              <select className={inputClass} value={categoryData.language || '中文'} onChange={e => setCategoryData({...categoryData, language: e.target.value})}>
                <option>中文</option>
                <option>英文</option>
                <option>其他</option>
              </select>
            </div>
          </div>
        );
      case 'patent': // 专利
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
            <div className="md:col-span-2"><h3 className="text-indigo-600 font-bold border-b border-indigo-100 pb-2 mb-2">专利成果信息</h3></div>
            <div>
              <label className={labelClass}>专利类型 <span className="text-red-500">*</span></label>
              <select className={inputClass} value={categoryData.patent_type || ''} onChange={e => setCategoryData({...categoryData, patent_type: e.target.value})}>
                <option value="">请选择</option>
                <option>发明专利</option>
                <option>实用新型</option>
                <option>外观设计</option>
                <option>软件著作权</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>法律状态</label>
              <select className={inputClass} value={categoryData.status || ''} onChange={e => setCategoryData({...categoryData, status: e.target.value})}>
                <option>已受理 (申请)</option>
                <option>已授权 (证书)</option>
                <option>已转让</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>申请/授权号 <span className="text-red-500">*</span></label>
              <input className={inputClass} placeholder="ZL xxxxx" value={categoryData.patent_no || ''} onChange={e => setCategoryData({...categoryData, patent_no: e.target.value})} />
            </div>
            <div>
              <label className={labelClass}>获批日期</label>
              <input type="date" className={inputClass} value={categoryData.approve_date || ''} onChange={e => setCategoryData({...categoryData, approve_date: e.target.value})} />
            </div>
          </div>
        );
      case 'award': // 获奖
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
            <div className="md:col-span-2"><h3 className="text-indigo-600 font-bold border-b border-indigo-100 pb-2 mb-2">科研获奖详情</h3></div>
            <div className="md:col-span-2">
              <label className={labelClass}>授奖单位 <span className="text-red-500">*</span></label>
              <input className={inputClass} placeholder="例如：教育部、xx省人民政府" value={categoryData.grant_body || ''} onChange={e => setCategoryData({...categoryData, grant_body: e.target.value})} />
            </div>
            <div>
              <label className={labelClass}>获奖等级</label>
              <select className={inputClass} value={categoryData.award_level || ''} onChange={e => setCategoryData({...categoryData, award_level: e.target.value})}>
                <option>国家级一等奖</option>
                <option>国家级二等奖</option>
                <option>省部级一等奖</option>
                <option>省部级二等奖</option>
                <option>省部级三等奖</option>
                <option>其他</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>证书编号</label>
              <input className={inputClass} value={categoryData.cert_no || ''} onChange={e => setCategoryData({...categoryData, cert_no: e.target.value})} />
            </div>
          </div>
        );
      default:
        return <div className="text-slate-400 p-4 text-center">请先选择项目类别</div>;
    }
  };

  // --- RENDER ---
  return (
    <div className="max-w-6xl mx-auto p-6 animate-in fade-in duration-500">
      
      {/* 顶部进度条 */}
      <div className="mb-10">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-100 -z-10 rounded-full"></div>
          <div 
            className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-indigo-600 -z-10 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          ></div>

          {STEPS.map((step) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            return (
              <div key={step.id} className="flex flex-col items-center bg-white px-2 md:px-4 cursor-pointer" onClick={() => setCurrentStep(step.id)}>
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${isActive ? 'border-indigo-100 bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110' : ''} ${isCompleted ? 'border-indigo-600 bg-white text-indigo-600' : ''} ${!isActive && !isCompleted ? 'border-slate-100 bg-slate-50 text-slate-400' : ''}`}>
                  {isCompleted ? <Check className="w-5 h-5 md:w-6 md:h-6" /> : <step.icon className="w-4 h-4 md:w-5 md:h-5" />}
                </div>
                <div className={`hidden md:block mt-3 text-sm font-bold ${isActive || isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>{step.title}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 表单主体 */}
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden relative min-h-[600px] flex flex-col">
        <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        
        <div className="p-8 md:p-10 flex-1">
          
          {/* === STEP 1: Basic Info === */}
          {currentStep === 1 && (
            <div className="animate-in slide-in-from-right-8 fade-in duration-300 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">基本信息录入</h2>
                <p className="text-slate-500 mt-1">请选择准确的申报类别，这将决定后续的数据结构。</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 申报阶段 */}
                <div>
                  <label className={labelClass}>申报批次 <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select className={`${inputClass} appearance-none`} value={selectedPhaseId ?? ''} onChange={e => setSelectedPhaseId(Number(e.target.value))}>
                      <option value="">-- 请选择当前开放的批次 --</option>
                      {phases.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (截止: {p.deadline})</option>
                      ))}
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none rotate-90" />
                  </div>
                </div>

                {/* 类别选择 */}
                <div>
                  <label className={labelClass}>成果/项目类别 <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select className={`${inputClass} appearance-none`} value={basicInfo.projectType} onChange={e => handleTypeChange(e.target.value)}>
                      {PROJECT_TYPES.map(t => <option key={t.id} value={t.label}>{t.label}</option>)}
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none rotate-90" />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>名称/标题 <span className="text-red-500">*</span></label>
                  <input type="text" className={inputClass} placeholder="项目名称 或 论文/专著标题" value={basicInfo.projectName} onChange={e => setBasicInfo({...basicInfo, projectName: e.target.value})} />
                </div>

                {/* 通用日期 */}
                <div>
                  <label className={labelClass}>
                    {['paper', 'book', 'patent', 'award'].includes(basicInfo.projectTypeId) ? '发表/获批日期' : '开始日期'}
                  </label>
                  <input type="date" className={inputClass} value={basicInfo.startDate} onChange={e => setBasicInfo({...basicInfo, startDate: e.target.value})} />
                </div>
                
                {!['paper', 'book', 'patent', 'award'].includes(basicInfo.projectTypeId) && (
                  <div>
                    <label className={labelClass}>计划结束日期</label>
                    <input type="date" className={inputClass} value={basicInfo.endDate} onChange={e => setBasicInfo({...basicInfo, endDate: e.target.value})} />
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className={labelClass}>摘要/简介</label>
                  <textarea rows={4} className={`${inputClass} resize-none`} placeholder="简述主要研究内容、创新点或成果价值..." value={basicInfo.abstract} onChange={e => setBasicInfo({...basicInfo, abstract: e.target.value})}></textarea>
                </div>
              </div>
            </div>
          )}

          {/* === STEP 2: Category Specific Data (Replaced old Budget) === */}
          {currentStep === 2 && (
            <div className="animate-in slide-in-from-right-8 fade-in duration-300">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">详细指标数据</h2>
                <p className="text-slate-500 mt-1">当前类别：<span className="font-bold text-indigo-600">{basicInfo.projectType}</span></p>
              </div>
              
              {/* Dynamic Form Injection */}
              <div className={sectionClass}>
                {renderCategoryForm()}
              </div>

              {/* Keep Budget UI only for Projects, maybe hide for Papers/Awards if not needed */}
              {['vertical', 'horizontal'].includes(basicInfo.projectTypeId) && (
                <div className="mt-8">
                  <h3 className="text-slate-800 font-bold mb-4 flex items-center"><DollarSign className="w-5 h-5 mr-2 text-indigo-500"/> 经费预算概览 (可选)</h3>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-slate-500 text-sm">
                    此类别通常需要详细的预算书，请在“附件上传”步骤提交完整的预算Excel表。
                    <br/>此处仅需填写上方表单中的总经费即可。
                  </div>
                </div>
              )}
            </div>
          )}

          {/* === STEP 3: Team Members (Simplified for brevity, logic kept) === */}
          {currentStep === 3 && (
            <div className="animate-in slide-in-from-right-8 fade-in duration-300 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">作者/成员管理</h2>
                <p className="text-slate-500 mt-1">请按署名顺序列出所有贡献者。</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {members.map((member, idx) => (
                  <div key={member.id} className="border border-slate-200 rounded-xl p-5 flex items-start gap-4 hover:shadow-md transition bg-white relative group">
                    <div className="absolute top-2 right-2 text-xs font-mono text-slate-300">#{idx + 1}</div>
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg border border-slate-200">{member.name.charAt(0)}</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800">{member.name} <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded ml-2">{member.role}</span></h4>
                      <p className="text-xs text-slate-500 mt-1">{member.unit}</p>
                    </div>
                    <button onClick={() => removeMember(member.id)} className="text-slate-300 hover:text-red-500"><X className="w-4 h-4" /></button>
                  </div>
                ))}
                <button onClick={() => setIsAddingMember(true)} className="border-2 border-dashed border-slate-200 rounded-xl p-5 flex items-center justify-center gap-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition min-h-[100px]">
                  <Plus className="w-5 h-5" /> <span>添加成员</span>
                </button>
              </div>
              
              {isAddingMember && (
                <div className="mt-4 bg-slate-50 p-4 rounded-xl border border-indigo-100 grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input className="px-3 py-2 rounded border" placeholder="姓名" value={newMember.name} onChange={e=>setNewMember({...newMember, name:e.target.value})} />
                  <select className="px-3 py-2 rounded border" value={newMember.role} onChange={e=>setNewMember({...newMember, role:e.target.value})}>
                    <option>负责人/第一作者</option><option>通讯作者</option><option>参与人</option>
                  </select>
                  <input className="px-3 py-2 rounded border" placeholder="单位" value={newMember.unit} onChange={e=>setNewMember({...newMember, unit:e.target.value})} />
                  <div className="flex gap-2">
                    <button onClick={addMember} className="flex-1 bg-indigo-600 text-white rounded">确认</button>
                    <button onClick={()=>setIsAddingMember(false)} className="px-3 bg-white border rounded">取消</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* === STEP 4: Files (Logic Kept) === */}
          {currentStep === 4 && (
            <div className="animate-in slide-in-from-right-8 fade-in duration-300 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">证明材料上传</h2>
                <p className="text-slate-500 mt-1">请上传{basicInfo.projectType}相关的申报书、全文PDF、证书扫描件等。</p>
              </div>
              <div className="border-2 border-dashed border-indigo-200 rounded-2xl bg-indigo-50/30 p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-50 transition" onClick={() => fileInputRef.current?.click()}>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                <UploadCloud className="w-12 h-12 text-indigo-400 mb-4" />
                <p className="text-slate-600 font-medium">点击上传或拖拽文件至此</p>
                <p className="text-xs text-slate-400 mt-1">支持 PDF, Word, JPG, ZIP (Max 50MB)</p>
              </div>
              <div className="space-y-2">
                {files.map((f, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-3"><Paperclip className="w-4 h-4 text-slate-400" /><span className="text-sm font-medium text-slate-700">{f.name}</span><span className="text-xs text-slate-400">({f.size})</span></div>
                    <button onClick={()=>removeFile(i)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Buttons */}
        <div className="bg-slate-50 px-8 py-6 flex justify-between items-center border-t border-slate-100 mt-auto">
          <button onClick={prevStep} disabled={currentStep === 1} className={`flex items-center px-6 py-2.5 rounded-xl font-bold transition-all ${currentStep === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm'}`}>
            <ArrowLeft className="w-4 h-4 mr-2" /> 上一步
          </button>
          <div className="flex gap-3">
            <button className="hidden md:flex items-center px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all border border-transparent hover:border-slate-200"
              onClick={() => { /* Save Draft Logic */ alert('草稿已保存'); }}>
              <Save className="w-4 h-4 mr-2" /> 保存草稿
            </button>
            <button onClick={async () => {
                if (currentStep !== STEPS.length) { nextStep(); return; }
                // Submit Logic
                if (!basicInfo.projectName) { alert('请输入名称'); return; }
                try {
                  const payload = {
                    ...basicInfo,
                    categoryDetails: categoryData,
                    members,
                    files
                  };
                  console.log("Submitting:", payload); // Debug
                  // await projectAPI.submit(...)
                  alert('申报提交成功！');
                } catch(e) { alert('提交失败'); }
              }} 
              className="flex items-center px-8 py-2.5 rounded-xl font-bold bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:-translate-y-0.5 active:scale-95 transition-all">
              {currentStep === STEPS.length ? '提交申请' : '下一步'}
              {currentStep !== STEPS.length && <ArrowRight className="w-4 h-4 ml-2" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
