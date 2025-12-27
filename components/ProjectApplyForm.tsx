import React, { useState, useRef } from 'react';
import { 
  Check, ChevronRight, FileText, DollarSign, Users, UploadCloud, 
  ArrowLeft, ArrowRight, Save, Calendar, Plus, Trash2, X, Paperclip, File
} from 'lucide-react';

// 定义表单步骤
const STEPS = [
  { id: 1, title: '基本信息', icon: FileText, desc: '项目名称与周期' },
  { id: 2, title: '经费预算', icon: DollarSign, desc: '预算明细编制' },
  { id: 3, title: '团队成员', icon: Users, desc: '人员分工配置' },
  { id: 4, title: '附件上传', icon: UploadCloud, desc: '申报材料提交' },
];

export default function ProjectApplyForm() {
  const [currentStep, setCurrentStep] = useState(1);
  
  // --- 1. 基本信息状态 ---
  const [basicInfo, setBasicInfo] = useState({
    projectName: '',
    projectType: '纵向项目',
    startDate: '',
    endDate: '',
    abstract: '',
  });

  // --- 2. 经费预算状态 ---
  const [budgetItems, setBudgetItems] = useState([
    { id: 1, subject: '设备购置费', amount: 50000, remark: '高性能GPU服务器' },
    { id: 2, subject: '材料费', amount: 12000, remark: '实验耗材' },
  ]);
  const [newBudget, setNewBudget] = useState({ subject: '', amount: '', remark: '' });

  // --- 3. 团队成员状态 ---
  const [members, setMembers] = useState([
    { id: 1, name: '张三', role: '项目负责人', unit: '计算机学院', task: '统筹规划' }
  ]);
  const [newMember, setNewMember] = useState({ name: '', role: '主要参与者', unit: '', task: '' });
  const [isAddingMember, setIsAddingMember] = useState(false);

  // --- 4. 附件文件状态 ---
  const [files, setFiles] = useState<Array<{name: string, size: string}>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 辅助逻辑函数 ---

  // 预算：添加与删除
  const addBudget = () => {
    if (!newBudget.subject || !newBudget.amount) return;
    setBudgetItems([...budgetItems, { id: Date.now(), subject: newBudget.subject, amount: Number(newBudget.amount), remark: newBudget.remark }]);
    setNewBudget({ subject: '', amount: '', remark: '' });
  };
  const removeBudget = (id: number) => setBudgetItems(budgetItems.filter(i => i.id !== id));
  const totalBudget = budgetItems.reduce((sum, item) => sum + item.amount, 0);

  // 成员：添加与删除
  const addMember = () => {
    if (!newMember.name) return;
    setMembers([...members, { id: Date.now(), ...newMember }]);
    setNewMember({ name: '', role: '主要参与者', unit: '', task: '' });
    setIsAddingMember(false);
  };
  const removeMember = (id: number) => setMembers(members.filter(m => m.id !== id));

  // 文件：模拟上传
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFiles([...files, { name: file.name, size: `${(file.size / 1024 / 1024).toFixed(2)} MB` }]);
    }
  };
  const removeFile = (idx: number) => setFiles(files.filter((_, i) => i !== idx));

  // 步骤导航
  const nextStep = () => { if (currentStep < STEPS.length) setCurrentStep(c => c + 1); };
  const prevStep = () => { if (currentStep > 1) setCurrentStep(c => c - 1); };

  // 通用样式类
  const inputClass = "w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-100 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-medium text-slate-700";
  const labelClass = "block text-sm font-bold text-slate-700 mb-2";

  return (
    <div className="max-w-6xl mx-auto p-6 animate-in fade-in duration-500">
      
      {/* --- 顶部进度条 --- */}
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

      {/* --- 表单主体卡片 --- */}
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden relative min-h-[600px] flex flex-col">
        {/* 顶部彩色装饰条 */}
        <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        
        <div className="p-8 md:p-10 flex-1">
          
          {/* === 步骤 1: 基本信息 === */}
          {currentStep === 1 && (
            <div className="animate-in slide-in-from-right-8 fade-in duration-300 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">项目基本信息</h2>
                <p className="text-slate-500 mt-1">请填写项目的核心元数据，带 * 号为必填项。</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className={labelClass}>项目名称 <span className="text-red-500">*</span></label>
                  <input type="text" className={inputClass} placeholder="请输入完整的科研项目名称" value={basicInfo.projectName} onChange={e => setBasicInfo({...basicInfo, projectName: e.target.value})} />
                </div>

                <div>
                  <label className={labelClass}>项目类别</label>
                  <div className="relative">
                    <select className={`${inputClass} appearance-none`} value={basicInfo.projectType} onChange={e => setBasicInfo({...basicInfo, projectType: e.target.value})}>
                      <option>纵向项目 (国家级/省部级)</option>
                      <option>横向项目 (企事业单位委托)</option>
                      <option>校级课题</option>
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none rotate-90" />
                  </div>
                </div>

                {/* 日期选择区域 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>开始日期</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-slate-400" />
                      </div>
                      <input type="date" className={`${inputClass} pl-10`} value={basicInfo.startDate} onChange={e => setBasicInfo({...basicInfo, startDate: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>截止日期</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-slate-400" />
                      </div>
                      <input type="date" className={`${inputClass} pl-10`} value={basicInfo.endDate} onChange={e => setBasicInfo({...basicInfo, endDate: e.target.value})} />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>项目摘要</label>
                  <textarea rows={5} className={`${inputClass} resize-none`} placeholder="简述研究背景、目标及意义 (500字以内)..." value={basicInfo.abstract} onChange={e => setBasicInfo({...basicInfo, abstract: e.target.value})}></textarea>
                </div>
              </div>
            </div>
          )}

          {/* === 步骤 2: 经费预算 === */}
          {currentStep === 2 && (
            <div className="animate-in slide-in-from-right-8 fade-in duration-300 space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">经费预算方案</h2>
                  <p className="text-slate-500 mt-1">请添加各科目的预算明细。</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">预算总额</div>
                  <div className="text-3xl font-extrabold text-indigo-600">¥ {totalBudget.toLocaleString()}</div>
                </div>
              </div>

              {/* 预算表格 */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">预算科目</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">金额 (元)</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">备注说明</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {budgetItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4 font-medium text-slate-800">{item.subject}</td>
                        <td className="px-6 py-4 font-mono text-slate-600">¥ {item.amount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-slate-500 text-sm">{item.remark}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => removeBudget(item.id)} className="text-slate-400 hover:text-red-500 transition p-2 rounded-full hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {/* 添加行 */}
                    <tr className="bg-indigo-50/30">
                      <td className="px-6 py-3">
                        <input type="text" placeholder="科目名称" className="w-full bg-transparent border-b border-indigo-200 focus:border-indigo-500 outline-none py-1 text-sm" 
                          value={newBudget.subject} onChange={e => setNewBudget({...newBudget, subject: e.target.value})}
                        />
                      </td>
                      <td className="px-6 py-3">
                        <input type="number" placeholder="0.00" className="w-full bg-transparent border-b border-indigo-200 focus:border-indigo-500 outline-none py-1 text-sm font-mono"
                          value={newBudget.amount} onChange={e => setNewBudget({...newBudget, amount: e.target.value})}
                        />
                      </td>
                      <td className="px-6 py-3">
                        <input type="text" placeholder="用途说明" className="w-full bg-transparent border-b border-indigo-200 focus:border-indigo-500 outline-none py-1 text-sm"
                          value={newBudget.remark} onChange={e => setNewBudget({...newBudget, remark: e.target.value})}
                        />
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button onClick={addBudget} disabled={!newBudget.subject || !newBudget.amount} className="text-indigo-600 hover:text-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm flex items-center justify-end ml-auto">
                          <Plus className="w-4 h-4 mr-1" /> 添加
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* === 步骤 3: 团队成员 === */}
          {currentStep === 3 && (
            <div className="animate-in slide-in-from-right-8 fade-in duration-300 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">团队成员管理</h2>
                <p className="text-slate-500 mt-1">添加项目参与人员并分配具体任务。</p>
              </div>

              {/* 成员列表 (Grid Card Layout) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {members.map((member) => (
                  <div key={member.id} className="border border-slate-200 rounded-xl p-5 flex items-start gap-4 hover:shadow-md hover:border-indigo-200 transition bg-white">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg border border-slate-200">
                      {member.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-800">{member.name}</h4>
                          <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-100 font-medium mt-1 inline-block">{member.role}</span>
                        </div>
                        {member.role !== '项目负责人' && (
                          <button onClick={() => removeMember(member.id)} className="text-slate-300 hover:text-red-500 transition">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-2">单位: {member.unit}</p>
                      <p className="text-xs text-slate-500">任务: {member.task}</p>
                    </div>
                  </div>
                ))}
                
                {/* 添加按钮卡片 */}
                <button 
                  onClick={() => setIsAddingMember(true)}
                  className="border-2 border-dashed border-slate-200 rounded-xl p-5 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/50 transition h-full min-h-[140px]"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-indigo-100 transition">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-sm">添加新成员</span>
                </button>
              </div>

              {/* 添加成员 Modal (Inline) */}
              {isAddingMember && (
                <div className="mt-6 bg-slate-50 border border-indigo-100 p-6 rounded-xl animate-in zoom-in-95">
                  <h4 className="font-bold text-slate-800 mb-4 text-sm">录入新成员信息</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input type="text" placeholder="姓名" className="px-3 py-2 rounded-lg border border-slate-300 text-sm outline-none focus:border-indigo-500" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} />
                    <select className="px-3 py-2 rounded-lg border border-slate-300 text-sm outline-none focus:border-indigo-500" value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value})}>
                      <option>主要参与者</option>
                      <option>研究生</option>
                      <option>外部专家</option>
                    </select>
                    <input type="text" placeholder="所属单位" className="px-3 py-2 rounded-lg border border-slate-300 text-sm outline-none focus:border-indigo-500" value={newMember.unit} onChange={e => setNewMember({...newMember, unit: e.target.value})} />
                    <input type="text" placeholder="分工任务" className="px-3 py-2 rounded-lg border border-slate-300 text-sm outline-none focus:border-indigo-500" value={newMember.task} onChange={e => setNewMember({...newMember, task: e.target.value})} />
                  </div>
                  <div className="flex justify-end mt-4 gap-3">
                    <button onClick={() => setIsAddingMember(false)} className="px-4 py-2 text-slate-500 text-sm hover:bg-white rounded-lg transition">取消</button>
                    <button onClick={addMember} className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 shadow-sm transition">确认添加</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* === 步骤 4: 附件上传 === */}
          {currentStep === 4 && (
            <div className="animate-in slide-in-from-right-8 fade-in duration-300 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">附件上传</h2>
                <p className="text-slate-500 mt-1">请上传项目申报书及相关证明材料（支持 PDF, Word, ZIP）。</p>
              </div>

              {/* 拖拽上传区域 */}
              <div 
                className="border-2 border-dashed border-indigo-200 rounded-2xl bg-indigo-50/30 hover:bg-indigo-50 transition-colors p-10 flex flex-col items-center justify-center text-center cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-8 h-8 text-indigo-500" />
                </div>
                <h4 className="text-lg font-bold text-slate-700 mb-1">点击或拖拽文件到此处上传</h4>
                <p className="text-slate-400 text-sm">单文件最大支持 50MB</p>
              </div>

              {/* 文件列表 */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-2">已上传文件 ({files.length})</h4>
                {files.length === 0 && <p className="text-slate-400 italic text-sm">暂无上传文件</p>}
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800">{file.name}</div>
                        <div className="text-xs text-slate-400">{file.size} · 上传成功</div>
                      </div>
                    </div>
                    <button onClick={() => removeFile(idx)} className="text-slate-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* --- 底部操作栏 --- */}
        <div className="bg-slate-50 px-8 md:px-10 py-6 flex justify-between items-center border-t border-slate-100 mt-auto">
          <button 
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center px-6 py-2.5 rounded-xl font-bold transition-all ${currentStep === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-white hover:shadow-sm hover:text-indigo-600'}`}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> 上一步
          </button>

          <div className="flex gap-3">
            <button className="hidden md:flex items-center px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all border border-transparent hover:border-slate-200">
              <Save className="w-4 h-4 mr-2" /> 保存草稿
            </button>
            <button 
              onClick={currentStep === STEPS.length ? () => alert('提交成功！') : nextStep}
              className="flex items-center px-8 py-2.5 rounded-xl font-bold bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:shadow-indigo-500/50 hover:-translate-y-0.5 active:scale-95 transition-all"
            >
              {currentStep === STEPS.length ? '提交申请' : '下一步'}
              {currentStep !== STEPS.length && <ArrowRight className="w-4 h-4 ml-2" />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}