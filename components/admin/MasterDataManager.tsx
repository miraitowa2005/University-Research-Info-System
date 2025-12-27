import React, { useState, useMemo } from 'react';
import { Department } from '../../types';
import { INITIAL_DEPARTMENTS } from '../../logic/compiler';
import { Users, GraduationCap, Briefcase, Building2, MoreVertical, Search, FileSpreadsheet, Plus } from 'lucide-react';

interface ExtendedDepartment extends Department {
  type: 'academic' | 'administrative';
  memberCount: number;
  projectsCount: number;
}

const MOCK_DEPARTMENTS_EXT: ExtendedDepartment[] = INITIAL_DEPARTMENTS.map(d => ({
  ...d,
  type: 'academic',
  memberCount: d.code === 'CS' ? 120 : d.code === 'PHYS' ? 80 : 65,
  projectsCount: d.code === 'CS' ? 24 : d.code === 'PHYS' ? 12 : 9,
}));

export const MasterDataManager = () => {
  const [departments, setDepartments] = useState<ExtendedDepartment[]>(MOCK_DEPARTMENTS_EXT);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'academic' | 'administrative'>('all');

  const filteredDepts = useMemo(() => {
    return departments.filter(d => {
      const matchSearch = d.name.includes(searchTerm) || d.code.includes(searchTerm);
      const matchType = filterType === 'all' || d.type === filterType;
      return matchSearch && matchType;
    });
  }, [departments, searchTerm, filterType]);

  const stats = useMemo(
    () => ({
      total: departments.length,
      academic: departments.filter(d => d.type === 'academic').length,
      admin: departments.filter(d => d.type === 'administrative').length,
      totalPeople: departments.reduce((acc, curr) => acc + curr.memberCount, 0),
    }),
    [departments]
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg白 p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">总机构数</div>
          <div className="text-2xl font-black text-slate-800 mt-1">{stats.total}</div>
        </div>
        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 shadow-sm">
          <div className="text-xs font-bold text-indigo-600/70 uppercase tracking-wider">教学科研单位</div>
          <div className="text-2xl font-black text-indigo-700 mt-1">{stats.academic}</div>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500/70 uppercase tracking-wider">行政职能部门</div>
          <div className="text-2xl font-black text-slate-600 mt-1">{stats.admin}</div>
        </div>
        <div className="bg白 p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">覆盖教职工</div>
          <div className="text-2xl font黑 text-slate-800 mt-1">
            {stats.totalPeople} <span className="text-sm text-slate-400 font-medium">人</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify之间">
        <div className="flex gap-2 p-1 bg白 border border-slate-200 rounded-xl shadow-sm">
          {['all', 'academic', 'administrative'].map(t => (
            <button key={t} onClick={() => setFilterType(t as any)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filterType === t ? 'bg-slate-800 text白 shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
              {t === 'all' ? '全部' : t === 'academic' ? '教学科研' : '行政职能'}
            </button>
          ))}
        </div>
        <div className="flex-1 w-full md:max-w-md relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="输入部门名称或编码搜索..." className="w-full pl-10 pr-4 py-2.5 bg白 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm" />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center px-4 py-2.5 bg白 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition shadow-sm">
            <FileSpreadsheet className="w-4 h-4 mr-2" /> 导入数据
          </button>
          <button className="flex items-center px-4 py-2.5 bg-indigo-600 text白 rounded-xl text-xs font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/20 active:scale-95">
            <Plus className="w-4 h-4 mr-2" /> 新增部门
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepts.map(dept => (
          <div key={dept.id} className="group bg白 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 relative overflow-hidden cursor-pointer">
            <div className={`h-2 w-full ${dept.type === 'academic' ? 'bg-indigo-500' : 'bg-slate-400'}`}></div>
            <div className="p-6">
              <div className="flex justify之间 items-start mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify中心 text-2xl shadow-sm ${dept.type === 'academic' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>{dept.type === 'academic' ? <GraduationCap className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}</div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Code</span>
                  <span className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-mono font-bold text-slate-600">{dept.code}</span>
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">{dept.name}</h3>
              <p className="text-xs text-slate-400 mb-6">{dept.type === 'academic' ? 'Academic Unit' : 'Administrative Unit'}</p>
              <div className="flex items-center justify之间 pt-4 border-t border-slate-50">
                <div className="flex gap-4">
                  <div className="flex items-center text-xs text-slate-500 font-medium" title="人员数量">
                    <Users className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                    {dept.memberCount}
                  </div>
                  {dept.projectsCount > 0 && (
                    <div className="flex items-center text-xs text-slate-500 font-medium" title="在研项目">
                      <Briefcase className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                      {dept.projectsCount}
                    </div>
                  )}
                </div>
                <button className="p-1.5 rounded-lg text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 transition">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

