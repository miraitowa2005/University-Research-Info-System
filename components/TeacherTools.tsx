import React, { useState } from 'react';
import { ResearchItem, User } from '../types';
import { 
  Calendar as CalendarIcon, Download, FileText, 
  ChevronLeft, ChevronRight, AlertCircle, Clock, Plus, Flag, FileArchive,
  CheckCircle2, FileSpreadsheet, ShieldCheck, History, MoreHorizontal
} from 'lucide-react';
import { INITIAL_EVENTS } from '../logic/compiler';


/**
 * 1. Research Calendar (保持您之前满意的双栏设计)
 */
export const ResearchCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const events = INITIAL_EVENTS; 

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const isSelected = (day: number) => {
    return selectedDate.getDate() === day && selectedDate.getMonth() === currentDate.getMonth() && selectedDate.getFullYear() === currentDate.getFullYear();
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
  };

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const selectedEvents = events.filter(e => e.date === `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`);

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[600px] animate-in fade-in duration-500">
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center">
               <CalendarIcon className="w-6 h-6 mr-3 text-indigo-600"/>
               {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
            </h2>
            <div className="flex bg-slate-100 rounded-lg p-1 ml-4">
              <button onClick={handlePrevMonth} className="p-1 hover:bg-white hover:shadow-sm rounded-md transition text-slate-500"><ChevronLeft className="w-5 h-5"/></button>
              <button onClick={() => { setCurrentDate(new Date()); setSelectedDate(new Date()); }} className="px-3 text-sm font-bold text-slate-600 hover:text-indigo-600">今天</button>
              <button onClick={handleNextMonth} className="p-1 hover:bg-white hover:shadow-sm rounded-md transition text-slate-500"><ChevronRight className="w-5 h-5"/></button>
            </div>
          </div>
          <button className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition active:scale-95">
            <Plus className="w-4 h-4 mr-2" /> 新建日程
          </button>
        </div>
        <div className="flex-1 p-6">
          <div className="grid grid-cols-7 mb-4">
            {['周日', '周一', '周二', '周三', '周四', '周五', '周六'].map((d, i) => (
              <div key={i} className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 grid-rows-5 gap-4 h-full min-h-[400px]">
            {blanks.map((b, i) => <div key={`blank-${i}`} />)}
            {days.map(day => {
              const dayEvents = getEventsForDay(day);
              return (
                <div 
                  key={day}
                  onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                  className={`
                    relative p-2 rounded-xl border transition-all cursor-pointer flex flex-col group min-h-[80px]
                    ${isSelected(day) ? 'ring-2 ring-indigo-500 border-transparent bg-indigo-50/30' : 'border-slate-100 hover:border-indigo-200 hover:shadow-md bg-white'}
                  `}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`
                      text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full
                      ${isToday(day) ? 'bg-slate-900 text-white' : (isSelected(day) ? 'text-indigo-700' : 'text-slate-700')}
                    `}>
                      {day}
                    </span>
                    {dayEvents.length > 0 && <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>}
                  </div>
                  <div className="space-y-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev, idx) => (
                      <div key={idx} className={`text-[10px] px-1.5 py-0.5 rounded border truncate font-medium
                        ${ev.type === 'deadline' ? 'bg-red-50 text-red-600 border-red-100' : 
                          ev.type === 'conference' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                          'bg-slate-100 text-slate-600 border-slate-200'}
                      `}>
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && <div className="text-[10px] text-slate-400 pl-1">+{dayEvents.length - 2} 更多</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="w-full lg:w-80 flex flex-col gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex-1 min-h-[300px]">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center border-b border-slate-100 pb-4">
            <span className="text-3xl mr-3 font-extrabold text-indigo-600">{selectedDate.getDate()}</span>
            <div className="flex flex-col text-xs font-medium text-slate-500">
              <span>{selectedDate.getFullYear()}年{selectedDate.getMonth()+1}月</span>
              <span>周{['日','一','二','三','四','五','六'][selectedDate.getDay()]}</span>
            </div>
          </h3>
          <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2">
            {selectedEvents.length > 0 ? selectedEvents.map((event, idx) => (
              <div key={idx} className="flex gap-3 group">
                <div className="flex flex-col items-center mt-1">
                  <div className={`w-2.5 h-2.5 rounded-full ${event.type === 'deadline' ? 'bg-red-500' : 'bg-indigo-500'}`}></div>
                  <div className="w-0.5 h-full bg-slate-100 mt-1 group-last:hidden"></div>
                </div>
                <div className="pb-6 w-full">
                  <h4 className="text-sm font-bold text-slate-800 leading-tight">{event.title}</h4>
                  <div className="text-xs text-slate-500 mt-1.5 flex items-center">
                    <Clock className="w-3 h-3 mr-1" /> 全天
                  </div>
                  {event.type === 'deadline' && <span className="inline-block mt-2 px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 text-[10px] rounded-md font-bold">截止日期</span>}
                </div>
              </div>
            )) : (
              <div className="text-center py-12 flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                   <CalendarIcon className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-slate-500 text-sm font-medium">今日无安排</p>
                <button className="text-indigo-600 text-xs font-bold mt-2 hover:underline">添加事项</button>
              </div>
            )}
          </div>
        </div>
        <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl">
          <h3 className="font-bold text-lg mb-4 flex items-center">
            <Flag className="w-5 h-5 mr-2 text-yellow-400" /> 近期截止
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl backdrop-blur-sm hover:bg-white/15 transition cursor-pointer">
              <div>
                <div className="text-sm font-bold text-slate-100">国自然申报书提交</div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">2024-03-20 截止</div>
              </div>
              <div className="w-9 h-9 rounded-full border border-yellow-400/30 bg-yellow-400/10 flex items-center justify-center text-yellow-400 font-bold text-xs">3d</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-transparent border border-slate-700 rounded-xl hover:border-slate-500 transition cursor-pointer">
              <div>
                <div className="text-sm font-bold text-slate-300">年度进展报告</div>
                <div className="text-[10px] text-slate-500 mt-1 font-mono">2024-03-29 截止</div>
              </div>
              <div className="text-xs text-slate-500 font-medium">12d</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 2. Data Export Center (Redesigned)
 * A modern, dashboard-like interface for data export.
 */
export const DataExportCenter = ({ user, researchItems }: { user: User, researchItems: ResearchItem[] }) => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['projects', 'papers']);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('csv');
  const [isExporting, setIsExporting] = useState(false);

  const handleToggle = (type: string) => {
    setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert(`打包完成！格式：${exportFormat.toUpperCase()}，包含 ${selectedTypes.length} 类数据。`);
    }, 1800);
  };

  const exportOptions = [
    { 
      id: 'projects', 
      label: '科研项目', 
      desc: '立项、在研及结题项目',
      icon: FileText, 
      color: 'text-blue-500 bg-blue-50',
      count: researchItems.filter(i => i.category.includes('项目')).length 
    },
    { 
      id: 'papers', 
      label: '学术论文', 
      desc: '期刊、会议及收录情况',
      icon: FileText, 
      color: 'text-purple-500 bg-purple-50',
      count: researchItems.filter(i => i.category.includes('论文')).length 
    },
    { 
      id: 'patents', 
      label: '专利软著', 
      desc: '授权专利与知识产权',
      icon: FileText, 
      color: 'text-emerald-500 bg-emerald-50',
      count: researchItems.filter(i => i.category.includes('专利')).length 
    },
    { 
      id: 'attachments', 
      label: '附件材料', 
      desc: '证明文件与申报书归档',
      icon: FileArchive, 
      color: 'text-amber-500 bg-amber-50',
      count: '1.2GB' 
    },
  ];

  const recentExports = [
    { id: 1, date: '2024-03-10 14:20', type: '项目 + 论文 (CSV)', size: '2.4 MB' },
    { id: 2, date: '2023-12-01 09:30', type: '全量备份 (ZIP)', size: '1.5 GB' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
       
       {/* 1. 顶部提示卡片 */}
       <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
         <div className="relative z-10 flex items-start gap-4">
           <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
             <ShieldCheck className="w-8 h-8 text-white" />
           </div>
           <div>
             <h2 className="text-2xl font-bold">科研数据资产导出</h2>
             <p className="text-indigo-100 mt-2 max-w-2xl leading-relaxed opacity-90">
               您正在访问敏感数据导出功能。导出的数据包包含您的个人隐私及科研机密信息，请务必妥善保管，严禁上传至非涉密环境。
             </p>
           </div>
         </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* 2. 左侧：选择区域 */}
         <div className="lg:col-span-2 space-y-6">
           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
             <h3 className="font-bold text-slate-800 mb-4 flex items-center">
               <span className="w-1.5 h-6 bg-indigo-600 rounded-full mr-3"></span>
               选择导出内容
             </h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {exportOptions.map(option => {
                 const isSelected = selectedTypes.includes(option.id);
                 return (
                   <div 
                     key={option.id}
                     onClick={() => handleToggle(option.id)}
                     className={`
                       relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-start gap-4 group
                       ${isSelected ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'}
                     `}
                   >
                     <div className={`p-3 rounded-lg ${option.color}`}>
                       <option.icon className="w-6 h-6" />
                     </div>
                     <div className="flex-1">
                       <div className="flex justify-between items-center">
                         <h4 className={`font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>{option.label}</h4>
                         {isSelected && <CheckCircle2 className="w-5 h-5 text-indigo-600 animate-in zoom-in duration-300" />}
                       </div>
                       <p className="text-xs text-slate-500 mt-1">{option.desc}</p>
                       <div className="mt-3 inline-block px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-500">
                         {typeof option.count === 'number' ? `${option.count} 条记录` : option.count}
                       </div>
                     </div>
                   </div>
                 );
               })}
             </div>
           </div>

           {/* 格式选择 */}
           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
             <h3 className="font-bold text-slate-800 mb-4 flex items-center">
               <span className="w-1.5 h-6 bg-indigo-600 rounded-full mr-3"></span>
               选择文件格式
             </h3>
             <div className="flex gap-4">
               {[
                 { id: 'csv', label: 'CSV 表格', desc: '适用于 Excel 分析' },
                 { id: 'json', label: 'JSON 数据', desc: '适用于系统迁移' },
                 { id: 'pdf', label: 'PDF 报表', desc: '适用于打印归档' },
               ].map(fmt => (
                 <label key={fmt.id} className={`flex-1 flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${exportFormat === fmt.id ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:bg-slate-50'}`}>
                   <div className="flex items-center mb-2">
                     <input type="radio" name="format" className="accent-indigo-600 w-4 h-4 mr-2" checked={exportFormat === fmt.id} onChange={() => setExportFormat(fmt.id as any)} />
                     <span className="font-bold text-sm text-slate-800">{fmt.label}</span>
                   </div>
                   <span className="text-xs text-slate-500 ml-6">{fmt.desc}</span>
                 </label>
               ))}
             </div>
           </div>
         </div>

         {/* 3. 右侧：操作与历史 */}
         <div className="space-y-6">
           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
             <h3 className="font-bold text-slate-800 mb-4">导出摘要</h3>
             <div className="space-y-3 mb-6 text-sm text-slate-600">
               <div className="flex justify-between">
                 <span>选中模块</span>
                 <span className="font-bold text-slate-900">{selectedTypes.length} 个</span>
               </div>
               <div className="flex justify-between">
                 <span>目标格式</span>
                 <span className="font-bold text-slate-900 uppercase">{exportFormat}</span>
               </div>
               <div className="flex justify-between border-t border-slate-100 pt-3">
                 <span>预估大小</span>
                 <span className="font-bold text-indigo-600">~ 25 MB</span>
               </div>
             </div>
             
             <button 
               onClick={handleExport}
               disabled={isExporting || selectedTypes.length === 0}
               className={`w-full flex items-center justify-center py-3.5 rounded-xl text-white font-bold text-sm transition-all shadow-lg shadow-indigo-500/30 active:scale-95 ${isExporting || selectedTypes.length === 0 ? 'bg-slate-400 cursor-not-allowed shadow-none' : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5'}`}
             >
               {isExporting ? (
                 <><span className="animate-spin mr-2">⏳</span> 打包处理中...</>
               ) : (
                 <><Download className="w-5 h-5 mr-2" /> 立即生成导出包</>
               )}
             </button>
             <p className="text-xs text-center text-slate-400 mt-3">系统将自动生成下载链接，链接有效期 24 小时</p>
           </div>

           <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
             <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-slate-800 text-sm flex items-center">
                 <History className="w-4 h-4 mr-2 text-slate-500" /> 最近导出
               </h3>
               <button className="text-xs text-indigo-600 hover:underline">查看全部</button>
             </div>
             <div className="space-y-3">
               {recentExports.map(record => (
                 <div key={record.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                       <FileSpreadsheet className="w-4 h-4" />
                     </div>
                     <div>
                       <div className="text-xs font-bold text-slate-700">{record.type}</div>
                       <div className="text-[10px] text-slate-400">{record.date}</div>
                     </div>
                   </div>
                   <button className="text-slate-400 hover:text-indigo-600">
                     <MoreHorizontal className="w-4 h-4" />
                   </button>
                 </div>
               ))}
             </div>
           </div>
         </div>

       </div>
    </div>
  );
};