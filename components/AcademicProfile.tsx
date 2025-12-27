import React, { useState, useEffect } from 'react';
import { User, ResearchItem } from '../types';
import { usersAPI, departmentAPI } from '../logic/api';
import { 
  User as UserIcon, Mail, Phone, MapPin, Briefcase, GraduationCap, 
  Lock, Save, Plus, Trash2, Calendar, Shield, Layout,
  Award, BookOpen, Layers, Edit3, Camera, Eye, Settings, ChevronRight,
  Globe, Link as LinkIcon, CheckCircle2
} from 'lucide-react';
import { toast } from 'react-toastify';

interface Props {
  user: User | null;
  researchItems: ResearchItem[];
  impactItems?: ResearchItem[];
  categoryFilterValue?: string;
  onCategoryChange?: (value: string) => void;
  onProfileUpdate?: () => void;
}

export const AcademicProfile: React.FC<Props> = ({ user, researchItems, onProfileUpdate }) => {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  
  // 编辑模式子页面
  const [settingTab, setSettingTab] = useState<'basic' | 'academic' | 'experience' | 'security'>('basic');
  
  const [loading, setLoading] = useState(false);
  const [profileForm, setProfileForm] = useState<Partial<User>>({});
  const [pwdForm, setPwdForm] = useState({ old: '', new: '' });
  const [experiences, setExperiences] = useState<any[]>([]);
  
  // 经历编辑状态
  const [isAddingExp, setIsAddingExp] = useState(false);
  const [expForm, setExpForm] = useState({
    type: 'work',
    start_date: '',
    end_date: '',
    title: '',
    institution: '',
    description: ''
  });

  useEffect(() => {
    if (user) {
      setProfileForm({ ...user });
      fetchExperiences();
    }
  }, [user]);

  const fetchExperiences = async () => {
    try {
      const list = await usersAPI.getMyExperiences();
      setExperiences(list);
    } catch {}
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const deptCode = profileForm.department ? await departmentAPI.normalize(profileForm.department) : null;
      await usersAPI.updateMe({
        ...profileForm,
        department_code: deptCode || undefined
      });
      toast.success('个人档案已保存');
      if (onProfileUpdate) onProfileUpdate();
    } catch (e: any) {
      toast.error(e.message || '更新失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExperience = async () => {
    if (!expForm.title || !expForm.institution) {
      toast.warning('请填写完整的经历信息');
      return;
    }
    try {
      const created = await usersAPI.addMyExperience(expForm);
      setExperiences([...experiences, created]);
      setExpForm({ type: 'work', start_date: '', end_date: '', title: '', institution: '', description: '' });
      setIsAddingExp(false);
      toast.success('经历已添加');
    } catch (e: any) {
      toast.error(e.message || '添加失败');
    }
  };

  const handleDeleteExperience = async (id: any) => {
    if (!confirm('确认删除该经历？')) return;
    try {
      await usersAPI.deleteMyExperience(id as any);
      setExperiences(experiences.filter(e => e.id !== id));
      toast.success('已删除');
    } catch (e: any) {
      toast.error(e.message || '删除失败');
    }
  };

  const handleChangePassword = async () => {
    if (!pwdForm.old || !pwdForm.new) {
      toast.warning('请输入旧密码与新密码');
      return;
    }
    try {
      await usersAPI.changeMyPassword(pwdForm.old, pwdForm.new);
      setPwdForm({ old: '', new: '' });
      toast.success('密码已修改');
    } catch (e: any) {
      toast.error(e.message || '修改失败');
    }
  };

  if (!user) return <div className="p-12 text-center text-gray-400">正在加载用户信息...</div>;

  // --- 样式组件 ---

  const ViewToggle = () => (
    <div className="flex justify-center mb-8">
      <div className="bg-slate-100 p-1.5 rounded-full inline-flex shadow-inner border border-slate-200/60">
        <button
          onClick={() => setMode('view')}
          className={`flex items-center px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
            mode === 'view' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Layout className="w-4 h-4 mr-2" /> 学术主页
        </button>
        <button
          onClick={() => setMode('edit')}
          className={`flex items-center px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
            mode === 'edit' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Settings className="w-4 h-4 mr-2" /> 资料管理
        </button>
      </div>
    </div>
  );

  const StatCard = ({ label, value, icon: Icon, color }: any) => (
    <div className="flex items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} bg-opacity-10 text-opacity-100 mr-4`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-800">{value}</div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</div>
      </div>
    </div>
  );

  // 现代化的输入框组件
  const ModernInput = ({ label, value, onChange, icon: Icon, type = "text", placeholder, disabled, className }: any) => (
    <div className={`group ${className}`}>
      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">{label}</label>
      <div className={`relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 transition-all duration-200 focus-within:bg-white focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 hover:border-slate-300 ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-100' : ''}`}>
        {Icon && <Icon className="w-4 h-4 text-slate-400 mr-3 group-focus-within:text-indigo-500 transition-colors" />}
        <input 
          type={type}
          disabled={disabled}
          className="bg-transparent border-none outline-none text-sm text-slate-800 placeholder-slate-400 w-full font-medium"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </div>
    </div>
  );

  // === 视图模式：学术主页 (Profile View) ===
  if (mode === 'view') {
    return (
      <div className="max-w-5xl mx-auto pb-12 animate-in fade-in duration-500">
        <ViewToggle />
        
        {/* Hero Section */}
        <div className="relative mb-24">
          {/* Banner */}
          <div className="h-64 rounded-3xl bg-gradient-to-br from-slate-900 via-[#0B1120] to-indigo-900 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            {/* Action Buttons on Banner */}
            <div className="absolute top-6 right-6 flex gap-3">
              <button 
                onClick={() => setMode('edit')}
                className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white px-4 py-2 rounded-full text-xs font-bold transition flex items-center"
              >
                <Edit3 className="w-3.5 h-3.5 mr-2" /> 编辑资料
              </button>
            </div>
          </div>

          {/* Profile Info Overlay */}
          <div className="absolute -bottom-16 left-8 md:left-12 flex items-end">
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white bg-white shadow-xl overflow-hidden">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} className="w-full h-full object-cover" alt={user.name} />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center text-5xl font-bold text-slate-300">
                    {user.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full"></div>
            </div>
            
            <div className="mb-2 ml-6 text-slate-800">
              <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-3">
                {user.name}
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md border border-indigo-200 align-middle">
                  {(user as any).title || '教职工'}
                </span>
              </h1>
              <div className="flex items-center text-slate-500 mt-2 font-medium">
                <Briefcase className="w-4 h-4 mr-1.5" /> {(user as any).department || '未分配院系'}
                <span className="mx-2 text-slate-300">|</span>
                <Mail className="w-4 h-4 mr-1.5" /> {user.email}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2">
          {/* Left Column: Stats & About */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                <Globe className="w-4 h-4 mr-2 text-indigo-500" /> 科研概况
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                  <div className="text-xl font-bold text-slate-800">{researchItems.length}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold mt-1">成果总数</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                  <div className="text-xl font-bold text-emerald-600">
                    {researchItems.filter(i => i.status === 'Approved').length}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold mt-1">已通过</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-400 uppercase mb-3">研究方向</div>
                <div className="flex flex-wrap gap-2">
                  {((user as any).research_direction?.split(/[,，]/) || ['暂无标签']).map((tag: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium border border-indigo-100">
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Introduction */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-3">个人简介</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {(user as any).research_direction ? 
                  `专注于${(user as any).research_direction}领域的研究。` : 
                  '暂无详细个人简介，请在资料管理中完善信息。'}
              </p>
            </div>
          </div>

          {/* Right Column: Timeline & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard label="学术论文" value={researchItems.filter(i => i.category === '学术论文').length} icon={BookOpen} color="bg-blue-500" />
              <StatCard label="主持项目" value={researchItems.filter(i => i.category.includes('项目')).length} icon={Layers} color="bg-purple-500" />
              <StatCard label="授权专利" value={researchItems.filter(i => i.category === '专利').length} icon={Shield} color="bg-emerald-500" />
              <StatCard label="获奖成果" value={researchItems.filter(i => i.category === '科技奖励').length} icon={Award} color="bg-amber-500" />
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-indigo-500" /> 近期科研动态
                </h3>
              </div>
              <div className="p-6">
                <div className="relative pl-6 border-l-2 border-slate-100 space-y-8">
                  {researchItems.slice(0, 5).map(item => (
                    <div key={item.id} className="relative group">
                      <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white bg-slate-300 group-hover:bg-indigo-500 group-hover:scale-125 transition-all shadow-sm"></div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{item.title}</h4>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                            <span className="font-medium bg-slate-100 px-1.5 py-0.5 rounded">{item.category}</span>
                            <span>•</span>
                            <span>{item.date}</span>
                          </div>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border whitespace-nowrap self-start ${
                          item.status === 'Approved' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}>
                          {item.status === 'Approved' ? '已发布' : item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {researchItems.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-sm">暂无动态记录</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === 视图模式：资料管理 (Settings Edit) ===
  // 采用 Linear/Notion 风格的侧边栏布局
  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ViewToggle />
      
      <div className="flex flex-col lg:flex-row gap-8 items-start min-h-[600px]">
        {/* 左侧导航栏 */}
        <div className="w-full lg:w-64 flex-shrink-0 lg:sticky lg:top-24">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 bg-slate-50/50 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">账户设置</h3>
            </div>
            <nav className="p-2 space-y-1">
              {[
                { id: 'basic', label: '基本信息', icon: UserIcon, desc: '姓名、部门、联系方式' },
                { id: 'academic', label: '学术背景', icon: GraduationCap, desc: '学历、学位、研究方向' },
                { id: 'experience', label: '履历管理', icon: Briefcase, desc: '工作与教育经历' },
                { id: 'security', label: '安全与隐私', icon: Shield, desc: '密码修改、主页公开' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setSettingTab(item.id as any)}
                  className={`w-full flex items-start p-3 rounded-xl transition-all duration-200 text-left group ${
                    settingTab === item.id 
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200' 
                    : 'hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <div className={`mt-0.5 mr-3 transition-colors ${settingTab === item.id ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm">{item.label}</div>
                    <div className={`text-[10px] mt-0.5 leading-tight ${settingTab === item.id ? 'text-indigo-500/80' : 'text-slate-400'}`}>{item.desc}</div>
                  </div>
                  {settingTab === item.id && <ChevronRight className="w-4 h-4 ml-auto mt-1 text-indigo-400" />}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* 右侧表单区域 */}
        <div className="flex-1 min-w-0 bg-white rounded-2xl border border-slate-200 shadow-sm p-8 relative">
          
          {/* 保存按钮 (悬浮在右上角) */}
          {(settingTab === 'basic' || settingTab === 'academic') && (
            <div className="absolute top-6 right-6 z-10">
              <button 
                onClick={handleUpdateProfile}
                disabled={loading}
                className="flex items-center px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-bold shadow-lg shadow-slate-900/20 active:scale-95 transition-all disabled:opacity-70"
              >
                {loading ? '保存中...' : (<><Save className="w-4 h-4 mr-2" /> 保存更改</>)}
              </button>
            </div>
          )}

          {/* 1. 基本信息面板 */}
          {settingTab === 'basic' && (
            <div className="space-y-8 animate-in fade-in">
              <div>
                <h2 className="text-xl font-bold text-slate-900">基本信息</h2>
                <p className="text-sm text-slate-500 mt-1">管理您的基础账号信息和联系方式。</p>
              </div>
              <div className="w-full h-px bg-slate-100"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ModernInput label="真实姓名" value={profileForm.name} onChange={(v: string) => setProfileForm({...profileForm, name: v})} icon={UserIcon} />
                <ModernInput label="工号/职工号" value={(profileForm as any).employee_id} onChange={(v: string) => setProfileForm({...profileForm, employee_id: v})} icon={CreditCardIcon} disabled />
                <ModernInput label="电子邮箱" value={profileForm.email} onChange={(v: string) => setProfileForm({...profileForm, email: v})} icon={Mail} />
                <ModernInput label="联系电话" value={(profileForm as any).phone} onChange={(v: string) => setProfileForm({...profileForm, phone: v})} icon={Phone} />
                <ModernInput className="md:col-span-2" label="办公地点" value={(profileForm as any).office_location} onChange={(v: string) => setProfileForm({...profileForm, office_location: v})} icon={MapPin} />
                <ModernInput className="md:col-span-2" label="所属院系/部门" value={profileForm.department} onChange={(v: string) => setProfileForm({...profileForm, department: v})} icon={Briefcase} />
              </div>
            </div>
          )}

          {/* 2. 学术背景面板 */}
          {settingTab === 'academic' && (
            <div className="space-y-8 animate-in fade-in">
              <div>
                <h2 className="text-xl font-bold text-slate-900">学术背景</h2>
                <p className="text-sm text-slate-500 mt-1">展示您的学历、学位及主要研究领域。</p>
              </div>
              <div className="w-full h-px bg-slate-100"></div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ModernInput label="最高学历" value={(profileForm as any).highest_education} onChange={(v: string) => setProfileForm({...profileForm, highest_education: v})} />
                <ModernInput label="学位" value={(profileForm as any).degree} onChange={(v: string) => setProfileForm({...profileForm, degree: v})} />
                <ModernInput label="导师资格" value={(profileForm as any).advisor_qualification} onChange={(v: string) => setProfileForm({...profileForm, advisor_qualification: v})} placeholder="如：博导/硕导" />
                
                <ModernInput className="md:col-span-2" label="毕业院校" value={(profileForm as any).alma_mater} onChange={(v: string) => setProfileForm({...profileForm, alma_mater: v})} icon={GraduationCap} />
                <ModernInput label="所学专业" value={(profileForm as any).major} onChange={(v: string) => setProfileForm({...profileForm, major: v})} />
                
                <div className="md:col-span-3">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">研究方向简介</label>
                  <textarea 
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 px-4 py-3 text-sm transition outline-none resize-none min-h-[120px] font-medium text-slate-700"
                    value={(profileForm as any).research_direction || ''}
                    onChange={e => setProfileForm({...profileForm, research_direction: e.target.value})}
                    placeholder="请简要描述您的主要研究领域，建议使用逗号分隔关键词..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3. 履历管理面板 */}
          {settingTab === 'experience' && (
            <div className="space-y-8 animate-in fade-in">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">履历管理</h2>
                  <p className="text-sm text-slate-500 mt-1">维护您的教育与工作经历时间轴。</p>
                </div>
                {!isAddingExp && (
                  <button onClick={() => setIsAddingExp(true)} className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-100 transition border border-indigo-100">
                    <Plus className="w-3.5 h-3.5 mr-1.5"/> 新增经历
                  </button>
                )}
              </div>
              <div className="w-full h-px bg-slate-100"></div>

              {/* Add Form */}
              {isAddingExp && (
                <div className="bg-slate-50 border border-indigo-100 rounded-xl p-6 mb-6 animate-in zoom-in-95 shadow-sm">
                  <h4 className="font-bold text-slate-800 mb-4 text-sm flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2"></div> 新增经历记录
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="md:col-span-2 flex gap-6 bg-white p-3 rounded-lg border border-slate-200">
                      <label className="flex items-center text-sm font-medium cursor-pointer text-slate-700">
                        <input type="radio" name="type" className="mr-2 accent-indigo-600 w-4 h-4" checked={expForm.type === 'work'} onChange={() => setExpForm({...expForm, type: 'work'})} /> 工作经历
                      </label>
                      <label className="flex items-center text-sm font-medium cursor-pointer text-slate-700">
                        <input type="radio" name="type" className="mr-2 accent-indigo-600 w-4 h-4" checked={expForm.type === 'education'} onChange={() => setExpForm({...expForm, type: 'education'})} /> 教育经历
                      </label>
                    </div>
                    <ModernInput label="标题/职位/学位" value={expForm.title} onChange={(v: string) => setExpForm({...expForm, title: v})} />
                    <ModernInput label="单位/学校名称" value={expForm.institution} onChange={(v: string) => setExpForm({...expForm, institution: v})} />
                    <ModernInput type="date" label="开始时间" value={expForm.start_date} onChange={(v: string) => setExpForm({...expForm, start_date: v})} />
                    <ModernInput type="date" label="结束时间" value={expForm.end_date} onChange={(v: string) => setExpForm({...expForm, end_date: v})} />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button onClick={() => setIsAddingExp(false)} className="px-4 py-2 text-slate-500 hover:bg-white hover:text-slate-700 rounded-lg text-sm font-medium transition border border-transparent hover:border-slate-200">取消</button>
                    <button onClick={handleAddExperience} className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition shadow-md active:scale-95">确认添加</button>
                  </div>
                </div>
              )}

              {/* Experience List */}
              <div className="space-y-4">
                {experiences.sort((a,b) => (b.start_date > a.start_date ? 1 : -1)).map((exp) => (
                  <div key={exp.id} className="group relative pl-8 pb-4 border-l-2 border-slate-100 last:border-0 last:pb-0">
                    <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white ${exp.type === 'education' ? 'bg-emerald-400' : 'bg-blue-400'} shadow-sm`}></div>
                    
                    <div className="flex justify-between items-start bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all duration-300 group-hover:translate-x-1">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-800">{exp.title}</h4>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${exp.type === 'education' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                            {exp.type === 'education' ? '教育' : '工作'}
                          </span>
                        </div>
                        <p className="text-sm text-indigo-600 font-medium mt-0.5">{exp.institution}</p>
                        <div className="flex items-center text-xs text-slate-400 mt-2 font-mono">
                          <Calendar className="w-3 h-3 mr-1.5"/> 
                          {exp.start_date} <span className="mx-1.5 text-slate-300">→</span> {exp.end_date || '至今'}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteExperience(exp.id)} 
                        className="text-slate-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {experiences.length === 0 && !isAddingExp && (
                  <div className="flex flex-col items-center justify-center py-12 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 text-slate-400">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <p className="text-slate-500 text-sm font-medium">暂无履历记录</p>
                    <p className="text-slate-400 text-xs mt-1">点击上方按钮完善您的职业生涯信息</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. 安全设置面板 */}
          {settingTab === 'security' && (
            <div className="space-y-8 animate-in fade-in">
              <div>
                <h2 className="text-xl font-bold text-slate-900">安全与隐私</h2>
                <p className="text-sm text-slate-500 mt-1">管理密码及个人主页可见性。</p>
              </div>
              <div className="w-full h-px bg-slate-100"></div>

              <div className="flex items-start justify-between p-6 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex gap-4">
                  <div className="p-3 bg-white rounded-xl text-indigo-600 shadow-sm border border-slate-100 h-fit">
                    <Eye className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 text-base">公开个人主页</h5>
                    <p className="text-sm text-slate-500 mt-1 max-w-sm leading-relaxed">
                      开启后，您的科研成果和简介将对校内其他人员可见，这有助于促进学术交流。
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setProfileForm({ ...profileForm, profile_public: !profileForm.profile_public });
                    toast.info('请点击右上角保存以生效', { autoClose: 1500 });
                  }}
                  className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none border-2 border-transparent ${ (profileForm as any).profile_public ? 'bg-indigo-600' : 'bg-slate-300'}`}
                >
                  <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${ (profileForm as any).profile_public ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="pt-6">
                <h4 className="font-bold text-slate-800 mb-6 text-sm uppercase tracking-wider flex items-center">
                  <Lock className="w-4 h-4 mr-2 text-slate-400"/> 修改密码
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                  <ModernInput type="password" label="当前旧密码" value={pwdForm.old} onChange={(v: string) => setPwdForm({...pwdForm, old: v})} placeholder="••••••" />
                  <ModernInput type="password" label="新密码" value={pwdForm.new} onChange={(v: string) => setPwdForm({...pwdForm, new: v})} placeholder="••••••" />
                  <div className="md:col-span-2 pt-2 flex justify-start">
                    <button onClick={handleChangePassword} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition shadow-sm">
                      更新密码
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

// 辅助图标组件（用于 ModernInput）
const CreditCardIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>
);