
import React, { useState } from 'react';
import { CalendarEvent, ResearchItem, User } from '../types';
import { Calendar as CalendarIcon, Download, FileText, Users, Clock, ChevronLeft, ChevronRight, AlertCircle, CheckCircle2, FileArchive } from 'lucide-react';
import { INITIAL_EVENTS } from '../logic/compiler';

/**
 * 1. Research Calendar
 * Visualizes deadlines and events.
 */
export const ResearchCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date('2024-03-01')); 
  const events = INITIAL_EVENTS;

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'deadline': return 'bg-red-100 text-red-700 border-red-200';
      case 'conference': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
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

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(parseInt(e.target.value));
    setCurrentDate(newDate);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(parseInt(e.target.value));
    setCurrentDate(newDate);
  };

  // Generate options
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i); // Current year +/- 5
  const months = [
    '1月', '2月', '3月', '4月', '5月', '6月', 
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center">
          <CalendarIcon className="w-5 h-5 mr-2 text-indigo-600"/> 科研工作日历
        </h3>
        <div className="flex items-center space-x-2">
           <div className="flex space-x-2 bg-gray-50 rounded-lg p-1 border border-gray-200">
             <select 
               value={currentDate.getFullYear()} 
               onChange={handleYearChange}
               className="bg-transparent text-sm font-medium text-gray-700 focus:outline-none border-none py-1 pr-6 cursor-pointer"
             >
               {years.map(year => (
                 <option key={year} value={year}>{year}年</option>
               ))}
             </select>
             <div className="w-px bg-gray-300 my-1"></div>
             <select 
               value={currentDate.getMonth()} 
               onChange={handleMonthChange}
               className="bg-transparent text-sm font-medium text-gray-700 focus:outline-none border-none py-1 pr-6 cursor-pointer"
             >
               {months.map((m, idx) => (
                 <option key={idx} value={idx}>{m}</option>
               ))}
             </select>
           </div>
           
           <div className="flex space-x-1 ml-2">
             <button onClick={handlePrevMonth} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 hover:text-indigo-600 transition"><ChevronLeft className="w-4 h-4"/></button>
             <button onClick={handleNextMonth} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 hover:text-indigo-600 transition"><ChevronRight className="w-4 h-4"/></button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
        {['日', '一', '二', '三', '四', '五', '六'].map(day => (
          <div key={day} className="bg-gray-50 p-2 text-center text-xs font-semibold text-gray-500">
            {day}
          </div>
        ))}
        
        {blanks.map(blank => <div key={`blank-${blank}`} className="bg-white h-32"></div>)}
        
        {days.map(day => {
          const dayEvents = getEventsForDay(day);
          const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
          
          return (
            <div key={day} className={`bg-white h-32 p-2 relative group hover:bg-gray-50 transition ${isToday ? 'bg-indigo-50/30' : ''}`}>
              <span className={`flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium ${dayEvents.length > 0 ? 'text-indigo-600' : 'text-gray-700'} ${isToday ? 'bg-indigo-600 text-white shadow-sm' : ''}`}>
                {day}
              </span>
              <div className="mt-1 space-y-1 overflow-y-auto max-h-[75%] scrollbar-hide">
                {dayEvents.map(event => (
                  <div key={event.id} className={`text-xs p-1 rounded border mb-1 truncate cursor-pointer shadow-sm ${getTypeStyle(event.type)}`} title={event.title}>
                    {event.title}
                  </div>
                ))}
              </div>
              {/* Hover Add Button */}
              <button className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-indigo-600 transition">
                <Clock className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 flex gap-4 text-xs text-gray-500">
        <div className="flex items-center"><span className="w-3 h-3 bg-red-100 border border-red-200 rounded mr-1"></span> 重要截止</div>
        <div className="flex items-center"><span className="w-3 h-3 bg-blue-100 border border-blue-200 rounded mr-1"></span> 会议/活动</div>
        <div className="flex items-center"><span className="w-3 h-3 bg-gray-100 border border-gray-200 rounded mr-1"></span> 日常事务</div>
      </div>
    </div>
  );
};

/**
 * 2. Data Export Center
 * Allows teachers to export their data securely.
 */
export const DataExportCenter = ({ user, researchItems }: { user: User, researchItems: ResearchItem[] }) => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['projects', 'papers']);
  const [isExporting, setIsExporting] = useState(false);

  const handleToggle = (type: string) => {
    setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert('数据打包成功！下载已开始。');
    }, 1500);
  };

  const exportOptions = [
    { id: 'projects', label: '科研项目信息 (CSV)', icon: FileText, count: researchItems.filter(i => i.category.includes('项目')).length },
    { id: 'papers', label: '学术论文清单 (CSV)', icon: FileText, count: researchItems.filter(i => i.category.includes('论文')).length },
    { id: 'patents', label: '专利与软著 (CSV)', icon: FileText, count: researchItems.filter(i => i.category.includes('专利')).length },
    { id: 'attachments', label: '关联附件材料 (ZIP)', icon: FileArchive, count: '120MB' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
       <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 flex items-start space-x-4">
         <AlertCircle className="w-6 h-6 text-indigo-600 mt-0.5" />
         <div>
           <h3 className="text-lg font-bold text-indigo-900">科研数据资产导出</h3>
           <p className="text-sm text-indigo-700 mt-1">
             根据《个人信息保护法》及学校数据管理规定，您有权导出本人的全部科研数据。
             <br/>导出文件包含敏感信息，请妥善保管，严禁上传至非密环境。
           </p>
         </div>
       </div>

       <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
         <div className="p-6 border-b border-gray-200">
           <h4 className="font-bold text-gray-900">选择导出内容</h4>
         </div>
         <div className="divide-y divide-gray-100">
           {exportOptions.map(option => (
             <label key={option.id} className="flex items-center justify-between p-6 hover:bg-gray-50 cursor-pointer transition">
               <div className="flex items-center">
                 <input 
                   type="checkbox" 
                   checked={selectedTypes.includes(option.id)}
                   onChange={() => handleToggle(option.id)}
                   className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-4"
                 />
                 <div className="p-2 bg-gray-100 rounded-lg mr-4 text-gray-500">
                   <option.icon className="w-5 h-5" />
                 </div>
                 <div>
                   <div className="font-medium text-gray-900">{option.label}</div>
                   <div className="text-xs text-gray-500 mt-0.5">包含数据记录与元数据</div>
                 </div>
               </div>
               <div className="text-sm font-medium text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                 {option.count} {typeof option.count === 'number' ? '项' : ''}
               </div>
             </label>
           ))}
         </div>
         <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
           <span className="text-sm text-gray-500">
             上次导出: 2023-12-10 14:20 (IP: 10.20.1.5)
           </span>
           <button 
             onClick={handleExport}
             disabled={isExporting || selectedTypes.length === 0}
             className={`flex items-center px-6 py-2.5 rounded-lg text-white font-medium transition shadow-sm ${isExporting || selectedTypes.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
           >
             {isExporting ? (
               <>正在打包...</>
             ) : (
               <>
                 <Download className="w-4 h-4 mr-2" /> 
                 立即导出
               </>
             )}
           </button>
         </div>
       </div>
    </div>
  );
};
