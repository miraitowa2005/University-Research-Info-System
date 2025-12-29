import React, { useState } from 'react';
import { User } from '../../types';
import { usersAPI, departmentAPI } from '../../logic/api';
import { toast } from 'react-toastify';

export default function ProfileManageContainer({
  currentUser,
  onCurrentUserChange,
  accountTab,
  onAccountTabChange,
  experiences,
  onExperiencesChange,
  expForm,
  onExpFormChange,
}: {
  currentUser: User;
  onCurrentUserChange: (u: User) => void;
  accountTab: 'basic' | 'academic' | 'experience' | 'security';
  onAccountTabChange: (tab: 'basic' | 'academic' | 'experience' | 'security') => void;
  experiences: any[];
  onExperiencesChange: (list: any[]) => void;
  expForm: any;
  onExpFormChange: (form: any) => void;
}) {
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // 提取保存逻辑，并增加防抖和错误处理
  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault(); // 🛑 核心修复：阻止浏览器刷新页面
    e.stopPropagation();
    
    if (isSaving) return;
    setIsSaving(true);

    try {
      // 1. 尝试标准化部门代码（如果前端没带 code，尝试获取）
      let deptCode = (currentUser as any).department_code; 
      if (!deptCode && currentUser?.department) {
         try {
            deptCode = await departmentAPI.normalize(currentUser.department);
         } catch (err) {
            console.warn("部门标准化失败，将尝试仅提交名称让后端处理", err);
         }
      }

      // 2. 构造干净的 Payload
      const payload = {
        full_name: currentUser!.name,
        email: currentUser!.email,
        department: currentUser!.department, // 后端会尝试根据这个名字找 Code
        department_code: deptCode,
        employee_id: (currentUser as any)?.employee_id,
        gender: (currentUser as any)?.gender,
        birth_date: (currentUser as any)?.birth_date,
        phone: (currentUser as any)?.phone,
        office_location: (currentUser as any)?.office_location,
        highest_education: (currentUser as any)?.highest_education,
        degree: (currentUser as any)?.degree,
        alma_mater: (currentUser as any)?.alma_mater,
        major: (currentUser as any)?.major,
        research_direction: (currentUser as any)?.research_direction,
        advisor_qualification: (currentUser as any)?.advisor_qualification,
        profile_public: (currentUser as any)?.profile_public,
      };

      console.log("Submitting Profile Update:", payload);

      // 3. 发送请求
      await usersAPI.updateMe(payload);
      
      // 4. 刷新本地数据
      const me = await usersAPI.getMe();
      onCurrentUserChange(me);
      toast.success('个人档案已保存成功！');
    } catch (e: any) {
      console.error("Save failed:", e);
      toast.error(e.message || '保存失败，请检查网络');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* 顶部 Tab 栏 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-wrap items-center gap-3">
        {['basic', 'academic', 'experience', 'security'].map((tab) => (
          <button
            key={tab}
            type="button" // 🛑 核心修复：防止点击 Tab 刷新页面
            className={`px-3 py-2 rounded transition-colors ${
              accountTab === tab ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => onAccountTabChange(tab as any)}
          >
            {tab === 'basic' && '基本信息'}
            {tab === 'academic' && '学术信息'}
            {tab === 'experience' && '教育与工作经历'}
            {tab === 'security' && '隐私与安全'}
          </button>
        ))}
        
        <div className="flex-1" />
        
        {/* 顶部保存按钮 */}
        <button
          type="button" // 🛑 核心修复
          className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? '保存中...' : '保存档案'}
        </button>
      </div>

      {/* 内容区域：基本信息 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-4 animate-in fade-in duration-300">
        <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">基本信息维护</h3>
        {accountTab === 'basic' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">工号 (不可修)</label>
              <input
                className="w-full border rounded px-3 py-2 text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                value={(currentUser as any)?.employee_id || ''}
                readOnly
                disabled
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">姓名</label>
              <input
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={currentUser?.name || ''}
                onChange={(e) => onCurrentUserChange({ ...currentUser!, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">性别</label>
              <select
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={(currentUser as any)?.gender || ''}
                onChange={(e) => onCurrentUserChange({ ...(currentUser as any), gender: e.target.value })}
              >
                <option value="">未填写</option>
                <option value="男">男</option>
                <option value="女">女</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">出生日期</label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={(currentUser as any)?.birth_date || ''}
                onChange={(e) => onCurrentUserChange({ ...(currentUser as any), birth_date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">联系电话</label>
              <input
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={(currentUser as any)?.phone || ''}
                onChange={(e) => onCurrentUserChange({ ...(currentUser as any), phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">电子邮箱</label>
              <input
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={currentUser?.email || ''}
                onChange={(e) => onCurrentUserChange({ ...currentUser!, email: e.target.value })}
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-gray-500 mb-1">学院/部门</label>
              <input
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="例如：计算机科学与技术学院"
                value={currentUser?.department || ''}
                onChange={(e) => onCurrentUserChange({ ...currentUser!, department: e.target.value })}
              />
              <p className="text-[10px] text-gray-400 mt-1">输入学院全称，系统将自动匹配部门编号。</p>
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-gray-500 mb-1">办公地点</label>
              <input
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="例如：信息楼 A302"
                value={(currentUser as any)?.office_location || ''}
                onChange={(e) => onCurrentUserChange({ ...(currentUser as any), office_location: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>

      {/* 学术信息 */}
      {accountTab === 'academic' && (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-4 animate-in fade-in duration-300">
        <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">学术信息</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">最高学历</label>
              <input
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={(currentUser as any)?.highest_education || ''}
                onChange={(e) => onCurrentUserChange({ ...(currentUser as any), highest_education: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">授予学位</label>
              <input
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={(currentUser as any)?.degree || ''}
                onChange={(e) => onCurrentUserChange({ ...(currentUser as any), degree: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">毕业院校</label>
              <input
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={(currentUser as any)?.alma_mater || ''}
                onChange={(e) => onCurrentUserChange({ ...(currentUser as any), alma_mater: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">所学专业</label>
              <input
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={(currentUser as any)?.major || ''}
                onChange={(e) => onCurrentUserChange({ ...(currentUser as any), major: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 mb-1">研究方向</label>
              <input
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="例如：人工智能、大数据分析"
                value={(currentUser as any)?.research_direction || ''}
                onChange={(e) => onCurrentUserChange({ ...(currentUser as any), research_direction: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">导师资格</label>
              <select
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={(currentUser as any)?.advisor_qualification || ''}
                onChange={(e) => onCurrentUserChange({ ...(currentUser as any), advisor_qualification: e.target.value })}
              >
                <option value="">未填写</option>
                <option value="博导">博士生导师</option>
                <option value="硕导">硕士生导师</option>
              </select>
            </div>
          </div>
      </div>
      )}

      {/* 经历部分 */}
      {accountTab === 'experience' && (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-4 animate-in fade-in duration-300">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="text-lg font-bold text-gray-900">教育与工作经历</h3>
          <button
            type="button" // 🛑 核心修复
            className="px-3 py-1.5 border border-slate-200 rounded text-xs hover:bg-gray-50 transition-colors"
            onClick={async () => {
              try {
                const list = await usersAPI.getMyExperiences();
                onExperiencesChange(list);
                toast.info("数据已从服务器同步");
              } catch (e: any) {
                toast.error(e.message || '加载失败');
              }
            }}
          >
            同步服务器数据
          </button>
        </div>
        
        {/* 新增表单 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <select className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" value={expForm.type} onChange={(e) => onExpFormChange({ ...expForm, type: e.target.value })}>
            <option value="education">教育经历</option>
            <option value="work">工作经历</option>
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input type="date" className="border rounded px-3 py-2 text-sm" value={expForm.start_date} onChange={(e) => onExpFormChange({ ...expForm, start_date: e.target.value })} />
            <input type="date" className="border rounded px-3 py-2 text-sm" value={expForm.end_date} onChange={(e) => onExpFormChange({ ...expForm, end_date: e.target.value })} />
          </div>
          <input className="border rounded px-3 py-2 text-sm" placeholder="职称/学位 (如：副教授、博士)" value={expForm.title} onChange={(e) => onExpFormChange({ ...expForm, title: e.target.value })} />
          <input className="border rounded px-3 py-2 text-sm" placeholder="单位/学校名称" value={expForm.institution} onChange={(e) => onExpFormChange({ ...expForm, institution: e.target.value })} />
          <input className="border rounded px-3 py-2 text-sm md:col-span-2" placeholder="详细描述 (选填)" value={expForm.description} onChange={(e) => onExpFormChange({ ...expForm, description: e.target.value })} />
          
          <div className="md:col-span-2 text-right">
            <button 
              type="button" // 🛑 核心修复
              className="px-4 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 shadow-sm"
              onClick={async () => {
                try {
                  const created = await usersAPI.addMyExperience(expForm);
                  onExperiencesChange([...(experiences || []), created]);
                  toast.success('已新增经历');
                } catch (e: any) { toast.error(e.message || '新增失败'); }
              }}
            >
              + 确认添加
            </button>
          </div>
        </div>
        
        {/* 列表展示 */}
        <div className="space-y-4">
          {(experiences || []).map((exp: any) => (
            <div key={exp.id} className="relative pl-6 border-l-2 border-slate-200 hover:border-indigo-400 transition-colors pb-1">
              <div className="absolute -left-[9px] top-0 bg-white border-2 border-slate-300 rounded-full w-4 h-4"></div>
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs font-mono text-slate-500 mb-1">{exp.start_date || 'N/A'} ~ {exp.end_date || '至今'}</div>
                  <h4 className="font-bold text-gray-900 text-sm">{exp.title}</h4>
                  <div className="text-sm text-indigo-600">{exp.institution}</div>
                  {exp.description && <p className="text-xs text-gray-500 mt-1 bg-slate-50 p-2 rounded">{exp.description}</p>}
                </div>
                <div className="flex gap-2">
                  <button 
                    type="button" // 🛑 核心修复
                    className="text-slate-400 hover:text-indigo-600 text-xs" 
                    onClick={async () => {
                      const title = prompt('修改标题', exp.title || '') || exp.title;
                      const institution = prompt('修改单位', exp.institution || '') || exp.institution;
                      try {
                        const updated = await usersAPI.updateMyExperience(exp.id, { ...exp, title, institution });
                        onExperiencesChange((experiences || []).map((e: any) => (e.id === exp.id ? updated : e)));
                        toast.success('已更新');
                      } catch (e: any) { toast.error(e.message || '更新失败'); }
                    }}
                  >编辑</button>
                  <button 
                    type="button" // 🛑 核心修复
                    className="text-slate-400 hover:text-red-600 text-xs" 
                    onClick={async () => {
                        if (!confirm('确认删除?')) return;
                        try { await usersAPI.deleteMyExperience(exp.id); onExperiencesChange(experiences.filter(e => e.id !== exp.id)); toast.success('已删除'); } catch(e) {}
                    }}
                  >删除</button>
                </div>
              </div>
            </div>
          ))}
          {(experiences || []).length === 0 && <div className="text-center py-8 text-gray-400 text-sm">暂无经历记录</div>}
        </div>
      </div>
      )}

      {/* 隐私与安全 */}
      {accountTab === 'security' && (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-4 animate-in fade-in duration-300">
        <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">隐私与安全</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-3 flex items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div>
                <label className="text-sm font-bold text-gray-800">个人主页公开性</label>
                <p className="text-xs text-gray-500 mt-1">开启后，其他用户可以查看您的学术档案和联系方式。</p>
              </div>
              <button
                type="button" // 🛑 核心修复
                onClick={() => onCurrentUserChange({ ...(currentUser as any), profile_public: !((currentUser as any)?.profile_public) } as any)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${ (currentUser as any)?.profile_public ? 'bg-indigo-600' : 'bg-gray-300' }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${ (currentUser as any)?.profile_public ? 'translate-x-5' : 'translate-x-0' }`} />
              </button>
            </div>
            
            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
               <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">旧密码</label>
                  <input type="password" className="w-full border rounded px-3 py-2 text-sm" value={oldPwd} onChange={(e) => setOldPwd(e.target.value)} />
               </div>
               <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">新密码</label>
                  <input type="password" className="w-full border rounded px-3 py-2 text-sm" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
               </div>
               <div className="md:col-span-2 flex justify-end">
                  <button 
                    type="button" // 🛑 核心修复
                    className="px-4 py-2 border border-slate-300 rounded text-sm hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                    onClick={async () => {
                      if(!oldPwd || !newPwd) return toast.error('请填写完整密码');
                      try { await usersAPI.changeMyPassword(oldPwd, newPwd); toast.success('密码修改成功'); setOldPwd(''); setNewPwd(''); } catch(e:any) { toast.error(e.message || '修改失败'); }
                    }}
                  >
                    确认修改密码
                  </button>
               </div>
            </div>
          </div>
      </div>
      )}

      {/* 底部保存按钮 (再次提供入口) */}
      <div className="flex justify-end mt-6 pb-10">
        <button
          type="button" // 🛑 核心修复
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? '正在保存...' : '保存所有更改'}
        </button>
      </div>
    </>
  );
}