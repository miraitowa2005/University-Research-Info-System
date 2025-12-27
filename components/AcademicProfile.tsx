import React, { useState, useEffect } from 'react';
import { User, ResearchItem } from '../types';
import { usersAPI, departmentAPI } from '../logic/api';
import { 
  User as UserIcon, Mail, Phone, MapPin, Briefcase, GraduationCap, 
  Lock, Save, Plus, Trash2, Calendar, Shield, Layout,
  Award, BookOpen, Layers, Edit2, Camera, Eye, Settings, ChevronRight
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
  const [settingTab, setSettingTab] = useState<'basic' | 'academic' | 'experience' | 'security'>('basic');
  const [loading, setLoading] = useState(false);
  const [profileForm, setProfileForm] = useState<Partial<User>>({});
  const [pwdForm, setPwdForm] = useState({ old: '', new: '' });
  const [experiences, setExperiences] = useState<any[]>([]);
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
      toast.success('个人档案已更新');
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

  if (!user) return <div className="p-8 text-center text-gray-500">加载中...</div>;

  const ModeSwitcher = () => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex p-1 bg-slate-200/60 rounded-xl">
        <button
          onClick={() => setMode('view')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center ${mode === 'view' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
        >
          <Layout className="w-4 h-4 mr-2" /> 学术主页
        </button>
        <button
          onClick={() => setMode('edit')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center ${mode === 'edit' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
        >
          <Settings className="w-4 h-4 mr-2" /> 资料管理
        </button>
      </div>
      {mode === 'edit' && (
        <button className="text-sm text-indigo-600 font-medium hover:underline" onClick={() => window.open(`/u/${user.id}`, '_blank')}>
          预览公开主页
        </button>
      )}
    </div>
  );

  const ModernInput = ({ label, value, onChange, icon: Icon, type = "text", placeholder, disabled }: any) => (
    <div className="group">
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">{label}</label>
      <div className={`flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:bg-white focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition duration-200 ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}>
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

  if (mode === 'view') {
    return (
      <div className="max-w-5xl mx-auto">
        <ModeSwitcher />
        <div className="relative rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-xl shadow-slate-200/50 mb-8">
          <div className="h-48 bg-gradient-to-r from-indigo-900 via-blue-800 to-indigo-900 relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
            <button className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-2 rounded-lg backdrop-blur-sm transition">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row items-end -mt-16 mb-6 relative">
              <div className="w-32 h-32 rounded-2xl border-4 border-white bg-slate-100 shadow-lg flex items-center justify-center text-4xl font-bold text-slate-400 overflow-hidden">
                 {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" /> : user.name[0]}
              </div>
              <div className="md:ml-6 mb-2 flex-1">
                <h1 className="text-3xl font-bold text-slate-900">{user.name}</h1>
                <p className="text-slate-500 font-medium">{(user as any).title || '教职工'} · {(user as any).department || '未分配院系'}</p>
              </div>
              <div className="flex gap-3 mb-2">
                 <button onClick={() => setMode('edit')} className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold hover:bg-indigo-100 transition">
                   <Edit2 className="w-4 h-4 mr-2" /> 编辑资料
                 </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="flex flex-col items-center justify-center p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <div className="p-3 rounded-full bg-blue-500 text-white mb-3 shadow-sm">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-slate-800">{researchItems.filter(i => i.category === '学术论文').length}</div>
                <div className="text-xs font-medium text-slate-400 uppercase mt-1">发表论文</div>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <div className="p-3 rounded-full bg-purple-500 text-white mb-3 shadow-sm">
                  <Layers className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-slate-800">{researchItems.filter(i => i.category.includes('项目')).length}</div>
                <div className="text-xs font-medium text-slate-400 uppercase mt-1">主持项目</div>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <div className="p-3 rounded-full bg-amber-500 text-white mb-3 shadow-sm">
                  <Award className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-slate-800">{researchItems.filter(i => i.category === '科技奖励').length}</div>
                <div className="text-xs font-medium text-slate-400 uppercase mt-1">获奖成果</div>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <div className="p-3 rounded-full bg-emerald-500 text-white mb-3 shadow-sm">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-slate-800">{researchItems.filter(i => i.category === '专利').length}</div>
                <div className="text-xs font-medium text-slate-400 uppercase mt-1">授权专利</div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">个人简介 & 研究方向</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {(user as any).research_direction || '暂无简介。请切换到“资料管理”完善您的学术信息。'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
           <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
             <Calendar className="w-5 h-5 mr-2 text-indigo-500"/> 近期科研动态
           </h3>
           <div className="space-y-6 pl-4 border-l-2 border-slate-100">
             {researchItems.slice(0, 5).map(item => (
               <div key={item.id} className="relative pl-6">
                 <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-white bg-indigo-500 shadow-sm"></div>
                 <div className="flex justify-between items-start">
                   <div>
                     <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
                     <p className="text-xs text-slate-500 mt-1">{item.category} · {item.date}</p>
                   </div>
                   <span className="text-[10px] px-2 py-0.5 rounded-full border bg-slate-50 border-slate-200 text-slate-500">{item.status}</span>
                 </div>
               </div>
             ))}
             {researchItems.length === 0 && <div className="text-slate-400 text-sm italic pl-6">暂无动态</div>}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <ModeSwitcher />
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-24">
            <div className="p-4 bg-slate-50 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">账号设置</h3>
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
                  className={`w-full flex items-start p-3 rounded-xl transition-all text-left group ${settingTab === item.id ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200' : 'hover:bg-slate-50 text-slate-600'}`}
                >
                  <div className={`mt-0.5 mr-3 ${settingTab === item.id ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">{item.label}</div>
                    <div className={`text-xs mt-0.5 ${settingTab === item.id ? 'text-indigo-500/80' : 'text-slate-400'}`}>{item.desc}</div>
                  </div>
                  {settingTab === item.id && <ChevronRight className="w-4 h-4 ml-auto mt-1 text-indigo-400" />}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="flex-1 min-w-0 bg-white rounded-2xl border border-slate-200 shadow-sm p-8 relative">
          {(settingTab === 'basic' || settingTab === 'academic') && (
            <div className="absolute top-8 right-8">
              <button 
                onClick={handleUpdateProfile}
                disabled={loading}
                className="flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-70"
              >
                {loading ? '保存中...' : (<><Save className="w-4 h-4 mr-2" /> 保存更改</>)}
              </button>
            </div>
          )}

          {settingTab === 'basic' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">基本信息</h2>
                <p className="text-sm text-slate-500">管理您的基础账号信息和联系方式。</p>
              </div>
              <div className="border-t border-slate-100"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ModernInput label="真实姓名" value={profileForm.name} onChange={v => setProfileForm({...profileForm, name: v})} icon={UserIcon} />
                <ModernInput label="工号/职工号" value={(profileForm as any).employee_id} onChange={v => setProfileForm({...profileForm, employee_id: v})} disabled />
                <ModernInput label="电子邮箱" value={profileForm.email} onChange={v => setProfileForm({...profileForm, email: v})} icon={Mail} />
                <ModernInput label="联系电话" value={(profileForm as any).phone} onChange={v => setProfileForm({...profileForm, phone: v})} icon={Phone} />
                <div className="md:col-span-2">
                  <ModernInput label="办公地点" value={(profileForm as any).office_location} onChange={v => setProfileForm({...profileForm, office_location: v})} icon={MapPin} />
                </div>
                <div className="md:col-span-2">
                  <ModernInput label="所属院系/部门" value={profileForm.department} onChange={v => setProfileForm({...profileForm, department: v})} icon={Briefcase} />
                </div>
              </div>
            </div>
          )}

          {settingTab === 'academic' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">学术背景</h2>
                <p className="text-sm text-slate-500">展示您的学历、学位及研究领域。</p>
              </div>
              <div className="border-t border-slate-100"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ModernInput label="最高学历" value={(profileForm as any).highest_education} onChange={v => setProfileForm({...profileForm, highest_education: v})} />
                <ModernInput label="学位" value={(profileForm as any).degree} onChange={v => setProfileForm({...profileForm, degree: v})} />
                <ModernInput label="导师资格" value={(profileForm as any).advisor_qualification} onChange={v => setProfileForm({...profileForm, advisor_qualification: v})} placeholder="如：博导/硕导" />
                <div className="md:col-span-2">
                  <ModernInput label="毕业院校" value={(profileForm as any).alma_mater} onChange={v => setProfileForm({...profileForm, alma_mater: v})} icon={GraduationCap} />
                </div>
                <ModernInput label="所学专业" value={(profileForm as any).major} onChange={v => setProfileForm({...profileForm, major: v})} />
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">研究方向简介</label>
                  <textarea 
                    className="w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 px-4 py-3 text-sm transition outline-none resize-none min-h-[120px]"
                    value={(profileForm as any).research_direction || ''}
                    onChange={e => setProfileForm({...profileForm, research_direction: e.target.value})}
                    placeholder="请简要描述您的主要研究领域，这将显示在您的个人主页上..."
                  />
                </div>
              </div>
            </div>
          )}

          {settingTab === 'experience' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">履历管理</h2>
                  <p className="text-sm text-slate-500">维护您的教育与工作经历时间轴。</p>
                </div>
                {!isAddingExp && (
                  <button onClick={() => setIsAddingExp(true)} className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold hover:bg-indigo-100 transition">
                    <Plus className="w-4 h-4 mr-2"/> 新增经历
                  </button>
                )}
              </div>
              <div className="border-t border-slate-100"></div>
              {isAddingExp && (
                <div className="bg-slate-50 border border-indigo-100 rounded-2xl p-6 mb-6">
                  <h4 className="font-bold text-slate-800 mb-4 text-sm">新增一条经历</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="md:col-span-2 flex gap-6">
                      <label className="flex items-center text-sm font-medium cursor-pointer">
                        <input type="radio" name="type" className="mr-2 accent-indigo-600" checked={expForm.type === 'work'} onChange={() => setExpForm({...expForm, type: 'work'})} /> 工作经历
                      </label>
                      <label className="flex items-center text-sm font-medium cursor-pointer">
                        <input type="radio" name="type" className="mr-2 accent-indigo-600" checked={expForm.type === 'education'} onChange={() => setExpForm({...expForm, type: 'education'})} /> 教育经历
                      </label>
                    </div>
                    <ModernInput label="标题/职位/学位" value={expForm.title} onChange={v => setExpForm({...expForm, title: v})} />
                    <ModernInput label="单位/学校名称" value={expForm.institution} onChange={v => setExpForm({...expForm, institution: v})} />
                    <ModernInput type="date" label="开始时间" value={expForm.start_date} onChange={v => setExpForm({...expForm, start_date: v})} />
                    <ModernInput type="date" label="结束时间" value={expForm.end_date} onChange={v => setExpForm({...expForm, end_date: v})} />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button onClick={() => setIsAddingExp(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-200/50 rounded-lg text-sm font-medium transition">取消</button>
                    <button onClick={handleAddExperience} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition shadow-md">确认添加</button>
                  </div>
                </div>
              )}
              <div className="space-y-4">
                {experiences.sort((a,b) => (b.start_date > a.start_date ? 1 : -1)).map((exp) => (
                  <div key={exp.id} className="group flex items-start p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-slate-50/50 transition duration-200">
                    <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${exp.type === 'education' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                      {exp.type === 'education' ? <GraduationCap className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-800">{exp.title}</h4>
                          <p className="text-sm text-indigo-600 font-medium">{exp.institution}</p>
                        </div>
                        <button onClick={() => handleDeleteExperience(exp.id)} className="text-slate-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100 p-2">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded text-xs font-mono bg-slate-100 text-slate-500 border border-slate-200">
                        <Calendar className="w-3 h-3 mr-1.5"/> {exp.start_date} <span className="mx-1">→</span> {exp.end_date || '至今'}
                      </div>
                    </div>
                  </div>
                ))}
                {experiences.length === 0 && !isAddingExp && (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-slate-400 text-sm">暂无履历记录，点击上方按钮添加。</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {settingTab === 'security' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">安全与隐私</h2>
                <p className="text-sm text-slate-500">管理密码及个人主页可见性。</p>
              </div>
              <div className="border-t border-slate-100"></div>
              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex gap-4">
                  <div className="p-3 bg-white rounded-xl text-indigo-600 shadow-sm border border-slate-100 h-fit">
                    <Eye className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 text-base">公开个人主页</h5>
                    <p className="text-sm text-slate-500 mt-1 max-w-md">开启后，您的科研成果和简介将对校内其他人员可见。</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setProfileForm({ ...profileForm, profile_public: !profileForm.profile_public });
                    toast.info('请点击右上角保存以生效', { autoClose: 1500 });
                  }}
                  className={`relative inline-flex h-7 w-12 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none border-2 border-transparent ${ (profileForm as any).profile_public ? 'bg-indigo-600' : 'bg-slate-300'}`}
                >
                  <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${ (profileForm as any).profile_public ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              <div className="pt-4">
                <h4 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider flex items-center">
                  <Lock className="w-4 h-4 mr-2 text-slate-400"/> 修改密码
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <ModernInput type="password" label="当前旧密码" value={pwdForm.old} onChange={v => setPwdForm({...pwdForm, old: v})} placeholder="••••••" />
                  <ModernInput type="password" label="新密码" value={pwdForm.new} onChange={v => setPwdForm({...pwdForm, new: v})} placeholder="••••••" />
                  <div className="md:col-span-2 pt-2 flex justify-end">
                    <button onClick={handleChangePassword} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-900/10">
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
