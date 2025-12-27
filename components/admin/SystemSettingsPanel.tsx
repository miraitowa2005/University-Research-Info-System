import React, { useState, useMemo } from 'react';
import { SystemSetting } from '../../types';
import { INITIAL_SETTINGS } from '../../logic/compiler';
import { toast } from 'react-toastify';
import { Settings, Shield, HardDrive, Bell, Globe } from 'lucide-react';

export const SystemSettingsPanel = () => {
  const [settings, setSettings] = useState<SystemSetting[]>(INITIAL_SETTINGS);
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'storage' | 'notification'>('general');
  const [isSaving, setIsSaving] = useState(false);

  const displaySettings = useMemo(() => {
    return {
      general: [
        { key: 'site_name', value: '高校科研管理系统 Pro', type: 'text', description: '系统显示的全局名称' },
        { key: 'maintenance_mode', value: 'false', type: 'boolean', description: '开启后仅管理员可访问' },
        { key: 'default_language', value: 'zh-CN', type: 'text', description: '新用户的默认语言设置' },
      ],
      security: [
        { key: 'password_min_length', value: '8', type: 'number', description: '用户密码的最小字符数' },
        { key: '2fa_enforced', value: 'false', type: 'boolean', description: '强制所有管理员启用双因素认证' },
        { key: 'session_timeout', value: '30', type: 'number', description: '闲置多少分钟后自动登出' },
      ],
      storage: [
        { key: 'max_upload_size', value: '50', type: 'number', description: '单文件上传限制 (MB)' },
        { key: 'auto_backup', value: 'true', type: 'boolean', description: '每日凌晨自动备份数据库' },
      ],
      notification: [
        { key: 'smtp_host', value: 'smtp.university.edu.cn', type: 'text', description: '邮件服务器地址' },
        { key: 'enable_sms', value: 'true', type: 'boolean', description: '启用短信通知服务' },
      ],
    };
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('系统参数已更新并生效');
    }, 800);
  };

  const TabButton = ({ id, label, icon: Icon }: any) => (
    <button onClick={() => setActiveTab(id)} className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === id ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
      <Icon className={`w-4 h-4 mr-3 ${activeTab === id ? 'text-indigo-600' : 'text-slate-400'}`} />
      {label}
    </button>
  );

  const currentSettings = displaySettings[activeTab];

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-200px)] min-h-[600px] animate-in fade-in duration-500">
      <div className="w-full lg:w-64 flex-shrink-0">
        <div className="bg白 rounded-2xl border border-slate-200 shadow-sm p-2 space-y-1">
          <div className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Settings Menu</div>
          <TabButton id="general" label="基础配置" icon={Settings} />
          <TabButton id="security" label="安全策略" icon={Shield} />
          <TabButton id="storage" label="存储与备份" icon={HardDrive} />
          <TabButton id="notification" label="通知服务" icon={Bell} />
        </div>
        <div className="mt-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 text-indigo-800">
          <div className="text-xs font-bold uppercase tracking-wider flex items-center">
            <Globe className="w-3 h-3 mr-2" /> Online Docs
          </div>
          <div className="text-xs mt-1">配置项说明与最佳实践。</div>
        </div>
      </div>
      <div className="flex-1 bg白 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-500" />
            <h3 className="text-lg font-bold text-slate-900">系统参数设置</h3>
          </div>
          <button onClick={handleSave} disabled={isSaving} className={`px-4 py-2 rounded-lg text-sm font-bold text-white ${isSaving ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
            保存更改
          </button>
        </div>
        <div className="space-y-6">
          {currentSettings.map((setting: any) => (
            <div key={setting.key} className="flex items-start pb-6 border-b border-slate-100 last:border-0 last:pb-0">
              <div className="w-1/3 pr-4">
                <div className="text-sm font-bold text-slate-900">{setting.key}</div>
                <div className="text-xs text-slate-500 mt-1">{setting.description}</div>
              </div>
              <div className="w-2/3">
                {setting.type === 'boolean' ? (
                  <div className="flex items-center">
                    <button
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors ${setting.value === 'true' ? 'bg-indigo-600' : 'bg-slate-300'}`}
                      onClick={() => {
                        setting.value = setting.value === 'true' ? 'false' : 'true';
                        const newSettings = settings.map(s => (s.key === setting.key ? { ...s, value: setting.value } : s));
                        setSettings(newSettings);
                      }}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg白 shadow transition ${setting.value === 'true' ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                    <span className="ml-3 text-sm text-slate-600">{setting.value === 'true' ? '已启用' : '已禁用'}</span>
                  </div>
                ) : (
                  <input
                    type={setting.type === 'number' ? 'number' : 'text'}
                    defaultValue={setting.value}
                    onBlur={e => {
                      const newSettings = settings.map(s => (s.key === setting.key ? { ...s, value: e.target.value } : s));
                      setSettings(newSettings);
                    }}
                    className="block w-full max-w-md rounded-lg bg-slate-50 border border-slate-200 text-slate-900 px-3 py-2 focus:bg白 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition"
                  />
                )}
              </div>
            </div>
          ))}
          <div className="mt-4 bg-red-50 border border-red-100 rounded-xl p-4 flex items-center justify之间">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-red-600" />
              <div>
                <div className="text-sm font-bold text-red-700">危险操作区</div>
                <div className="text-xs text-red-600/80">请谨慎执行，可能影响系统稳定性。</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => toast.warning('已恢复为默认配置（演示）')} className="px-3 py-2 bg白 border border-red-200 text-red-700 rounded-lg text-xs font-bold hover:bg-red-100 transition">
                恢复默认
              </button>
              <button onClick={() => toast.success('维护模式已开启（演示）')} className="px-3 py-2 bg-red-600 text白 rounded-lg text-xs font-bold hover:bg-red-700 transition">
                开启维护模式
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

