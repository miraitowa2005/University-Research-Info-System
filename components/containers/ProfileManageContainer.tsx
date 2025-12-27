import React, { useState } from 'react';
import { User, Role } from '../../types';
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

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
        <button
          className={`px-3 py-2 rounded ${accountTab === 'basic' ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}
          onClick={() => onAccountTabChange('basic')}
        >
          基本信息
        </button>
        <button
          className={`px-3 py-2 rounded ${accountTab === 'academic' ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}
          onClick={() => onAccountTabChange('academic')}
        >
          学术信息
        </button>
        <button
          className={`px-3 py-2 rounded ${accountTab === 'experience' ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}
          onClick={() => onAccountTabChange('experience')}
        >
          教育与工作经历
        </button>
        <button
          className={`px-3 py-2 rounded ${accountTab === 'security' ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}
          onClick={() => onAccountTabChange('security')}
        >
          隐私与安全
        </button>
        <div className="flex-1" />
        <button
          className="px-3 py-2 bg-indigo-600 text-white rounded text-sm"
          onClick={async () => {
            try {
              const deptCode = currentUser?.department ? await departmentAPI.normalize(currentUser!.department!) : null;
              await usersAPI.updateMe({
                full_name: currentUser!.name,
                email: currentUser!.email,
                department: currentUser!.department,
                department_code: deptCode || undefined,
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
              });
              const me = await usersAPI.getMe();
              onCurrentUserChange(me);
              toast.success('已更新个人档案');
            } catch (e: any) {
              toast.error(e.message || '更新失败');
            }
          }}
        >
          保存档案
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">基本信息维护</h3>
        {accountTab === 'basic' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">工号</label>
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                value={(currentUser as any)?.employee_id || ''}
                onChange={(e) => onCurrentUserChange({ ...(currentUser as any), employee_id: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">姓名</label>
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                value={currentUser?.name || ''}
                onChange={(e) => onCurrentUserChange({ ...currentUser!, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">性别</label>
              <select
                className="w-full border rounded px-3 py-2 text-sm"
                value={(currentUser as any)?.gender || ''}
                onChange={(e) => onCurrentUserChange({ ...(currentUser as any), gender: e.target.value })}
              >
                <option value="">未填写</option>
                <option value="男">男</option>
                <option value="女">女</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">出生日期</label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2 text-sm"
                value={(currentUser as any)?.birth_date || ''}
                onChange={(e) => onCurrentUserChange({ ...(currentUser as any), birth_date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">联系电话</label>
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                value={(currentUser as any)?.phone || ''}
                onChange={(e) => onCurrentUserChange({ ...(currentUser as any), phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">电子邮箱</label>
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                value={currentUser?.email || ''}
                onChange={(e) => onCurrentUserChange({ ...currentUser!, email: e.target.value })}
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs text-gray-500 mb-1">学院/部门</label>
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                value={currentUser?.department || ''}
                onChange={(e) => onCurrentUserChange({ ...currentUser!, department: e.target.value })}
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs text-gray-500 mb-1">办公地点</label>
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                value={(currentUser as any)?.office_location || ''}
                onChange={(e) => onCurrentUserChange({ ...(currentUser as any), office_location: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">学术信息</h3>
        {accountTab === 'academic' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">最高学历</label>
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                value={(currentUser as any)?.highest_education || ''}
                onChange={(e) => onCurrentUserChange({ ...(currentUser as any), highest_education: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">授予学位</label>
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                value={(currentUser as any)?.degree || ''}
                onChange={(e) => onCurrentUserChange({ ...(currentUser as any), degree: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">毕业院校</label>
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                value={(currentUser as any)?.alma_mater || ''}
                onChange={(e) => onCurrentUserChange({ ...(currentUser as any), alma_mater: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">所学专业</label>
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                value={(currentUser as any)?.major || ''}
                onChange={(e) => onCurrentUserChange({ ...(currentUser as any), major: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">研究方向（用于推荐项目申报）</label>
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                value={(currentUser as any)?.research_direction || ''}
                onChange={(e) => onCurrentUserChange({ ...(currentUser as any), research_direction: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">导师资格</label>
              <select
                className="w-full border rounded px-3 py-2 text-sm"
                value={(currentUser as any)?.advisor_qualification || ''}
                onChange={(e) => onCurrentUserChange({ ...(currentUser as any), advisor_qualification: e.target.value })}
              >
                <option value="">未填写</option>
                <option value="博导">博导</option>
                <option value="硕导">硕导</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">教育与工作经历</h3>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 border rounded text-sm"
              onClick={async () => {
                try {
                  const list = await usersAPI.getMyExperiences();
                  onExperiencesChange(list);
                } catch (e: any) {
                  toast.error(e.message || '加载失败');
                }
              }}
            >
              同步服务器数据
            </button>
          </div>
        </div>
        {accountTab === 'experience' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <select
              className="border rounded px-3 py-2 text-sm"
              value={expForm.type}
              onChange={(e) => onExpFormChange({ ...expForm, type: e.target.value })}
            >
              <option value="education">教育经历</option>
              <option value="work">工作经历</option>
            </select>
            <input
              type="date"
              className="border rounded px-3 py-2 text-sm"
              value={expForm.start_date}
              onChange={(e) => onExpFormChange({ ...expForm, start_date: e.target.value })}
            />
            <input
              type="date"
              className="border rounded px-3 py-2 text-sm"
              value={expForm.end_date}
              onChange={(e) => onExpFormChange({ ...expForm, end_date: e.target.value })}
            />
            <input
              className="border rounded px-3 py-2 text-sm"
              placeholder="标题/岗位或学位"
              value={expForm.title}
              onChange={(e) => onExpFormChange({ ...expForm, title: e.target.value })}
            />
            <input
              className="border rounded px-3 py-2 text-sm"
              placeholder="单位/学校"
              value={expForm.institution}
              onChange={(e) => onExpFormChange({ ...expForm, institution: e.target.value })}
            />
            <input
              className="border rounded px-3 py-2 text-sm md:col-span-2"
              placeholder="描述"
              value={expForm.description}
              onChange={(e) => onExpFormChange({ ...expForm, description: e.target.value })}
            />
          </div>
        )}
        {accountTab === 'experience' && (
          <div className="flex justify-end mb-4">
            <button
              className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm"
              onClick={async () => {
                try {
                  const created = await usersAPI.addMyExperience(expForm);
                  onExperiencesChange([...(experiences || []), created]);
                  toast.success('已新增经历');
                } catch (e: any) {
                  toast.error(e.message || '新增失败');
                }
              }}
            >
              新增经历
            </button>
          </div>
        )}
        {accountTab === 'experience' && (
          <div className="relative border-l-2 border-gray-200 ml-3 space-y-4 pl-8 py-2">
            {(experiences || []).map((exp: any) => (
              <div key={exp.id} className="relative group">
                <div className="absolute -left-[9px] bg-white border-2 border-gray-200 rounded-full w-4 h-4 group-hover:border-indigo-500 transition-colors"></div>
                <div className="bg-gray-50 p-4 rounded-lg hover:bg-white hover:shadow-md border border-transparent hover:border-gray-100 transition-all">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-gray-900">{exp.title || (exp.type === 'education' ? '教育经历' : '工作经历')}</h4>
                    <span className="text-xs font-mono text-gray-500 bg-white px-2 py-1 rounded border">
                      {exp.start_date || ''} ~ {exp.end_date || ''}
                    </span>
                  </div>
                  <div className="text-sm text-indigo-600 font-medium mt-1">{exp.institution || ''}</div>
                  <p className="text-sm text-gray-600 mt-2">{exp.description || ''}</p>
                  <div className="mt-2 text-right space-x-3">
                    <button
                      className="text-indigo-600 hover:text-indigo-900 text-xs"
                      onClick={async () => {
                        const title = prompt('修改标题', exp.title || '') || exp.title;
                        const institution = prompt('修改单位', exp.institution || '') || exp.institution;
                        const description = prompt('修改描述', exp.description || '') || exp.description;
                        try {
                          const updated = await usersAPI.updateMyExperience(exp.id, { ...exp, title, institution, description });
                          onExperiencesChange((experiences || []).map((e: any) => (e.id === exp.id ? updated : e)));
                          toast.success('已更新');
                        } catch (e: any) {
                          toast.error(e.message || '更新失败');
                        }
                      }}
                    >
                      编辑
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900 text-xs"
                      onClick={async () => {
                        if (!confirm('确认删除该经历？')) return;
                        try {
                          await usersAPI.deleteMyExperience(exp.id);
                          onExperiencesChange((experiences || []).filter((e: any) => e.id !== exp.id));
                          toast.success('已删除');
                        } catch (e: any) {
                          toast.error(e.message || '删除失败');
                        }
                      }}
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {(experiences || []).length === 0 && <p className="text-gray-500 italic">暂无经历，点击“同步服务器数据”或新增</p>}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">隐私与安全</h3>
        {accountTab === 'security' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 flex items-center">
              <label className="text-sm text-gray-700 mr-3">个人主页对外公开</label>
              <button
                onClick={() =>
                  onCurrentUserChange({
                    ...(currentUser as any),
                    profile_public: !((currentUser as any)?.profile_public),
                  } as any)
                }
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  (currentUser as any)?.profile_public ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    (currentUser as any)?.profile_public ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <div />
            <div>
              <label className="block text-xs text-gray-500 mb-1">旧密码</label>
              <input type="password" className="w-full border rounded px-3 py-2 text-sm" value={oldPwd} onChange={(e) => setOldPwd(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">新密码</label>
              <input type="password" className="w-full border rounded px-3 py-2 text-sm" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
            </div>
            <div className="flex items-end">
              <button
                className="px-4 py-2 border rounded text-sm"
                onClick={async () => {
                  if (!oldPwd || !newPwd) {
                    toast.error('请输入旧密码与新密码');
                    return;
                  }
                  try {
                    await usersAPI.changeMyPassword(oldPwd, newPwd);
                    toast.success('密码已修改');
                    setOldPwd('');
                    setNewPwd('');
                  } catch (e: any) {
                    toast.error(e.message || '修改失败');
                  }
                }}
              >
                修改密码
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded text-sm"
          onClick={async () => {
            try {
              const deptCode = currentUser?.department ? await departmentAPI.normalize(currentUser!.department!) : null;
              await usersAPI.updateMe({
                full_name: currentUser!.name,
                email: currentUser!.email,
                department: currentUser!.department,
                department_code: deptCode || undefined,
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
              });
              const me = await usersAPI.getMe();
              onCurrentUserChange(me);
              toast.success('已更新个人档案');
            } catch (e: any) {
              toast.error(e.message || '更新失败');
            }
          }}
        >
          保存档案
        </button>
      </div>
    </>
  );
}

