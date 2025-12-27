import React, { useMemo } from 'react';
import { ResearchItem } from '../types';
import { 
  TrendingUp, Award, BookOpen, Layers, DollarSign, 
  PieChart, Activity, ArrowUpRight, Zap, Target
} from 'lucide-react';

/**
 * 🎨 StatsOverview - 科研数据驾驶舱
 * 重构说明：采用 Bento Grid 布局，增强数据可视化的视觉冲击力。
 */
export const StatsOverview = ({ data }: { data: ResearchItem[] }) => {
  
  // --- 1. 数据处理核心逻辑 ---
  const stats = useMemo(() => {
    const totalItems = data.length;
    const approved = data.filter(i => i.status === 'Approved');
    
    // 经费计算 (单位：万)
    const totalFunding = data.reduce((sum, item) => {
      const fund = (item as any)?.content_json?.funding || (item as any)?.content_json?.amount || 0;
      return sum + Number(fund);
    }, 0);

    // 分类统计
    const categories = {
      papers: data.filter(i => i.category.includes('论文')).length,
      projects: data.filter(i => i.category.includes('项目')).length,
      patents: data.filter(i => i.category.includes('专利')).length,
      awards: data.filter(i => i.category.includes('奖励')).length,
    };

    // 模拟的月度趋势 (实际项目中应根据 date 字段聚合)
    const trendData = [12, 19, 15, 25, 32, 28, 40, 35, 50, 45, 60, 55]; // 模拟高度

    return { totalItems, approvedCount: approved.length, totalFunding, categories, trendData };
  }, [data]);

  // --- 2. 辅助组件：动态条形图 ---
  const BarChart = ({ label, value, total, color }: any) => {
    const percent = total > 0 ? Math.round((value / total) * 100) : 0;
    return (
      <div className="group">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">{label}</span>
          <span className="font-mono text-slate-500">{value} 项 ({percent}%)</span>
        </div>
        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full ${color} transition-all duration-1000 ease-out group-hover:brightness-110`} 
            style={{ width: `${percent}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      
      {/* Header: 带有科技感的标题区 */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center">
            <Activity className="w-6 h-6 mr-3 text-indigo-600" />
            科研效能仪表盘
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            实时监控科研产出动态，数据更新于 {new Date().toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full border border-indigo-100">
            2024 年度
          </span>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full border border-emerald-100">
            全校范围
          </span>
        </div>
      </div>

      {/* --- Bento Grid 布局 --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        
        {/* Card 1: 经费总览 (大卡片，深色主题，强调冲击力) */}
        <div className="md:col-span-2 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-900/30 group">
          {/* 背景装饰 */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-400/30 transition-all duration-1000"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 text-indigo-200 text-sm font-bold uppercase tracking-wider mb-2">
                  <DollarSign className="w-4 h-4" /> 累计科研经费
                </div>
                <div className="text-5xl lg:text-6xl font-black tracking-tight text-white mb-2">
                  <span className="text-2xl align-top opacity-60 mr-1">¥</span>
                  {stats.totalFunding.toLocaleString()}
                  <span className="text-lg font-medium opacity-60 ml-2">万</span>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/10">
                <ArrowUpRight className="w-6 h-6 text-emerald-400" />
              </div>
            </div>

            {/* 模拟的波形图 */}
            <div className="mt-8 h-16 flex items-end justify-between gap-1 opacity-80">
              {stats.trendData.map((h, i) => (
                <div 
                  key={i} 
                  className="w-full bg-gradient-to-t from-indigo-500/50 to-indigo-400/80 rounded-t-sm hover:from-indigo-400 hover:to-white transition-all duration-300 cursor-pointer"
                  style={{ height: `${h}%` }}
                  title={`月份 ${i+1}`}
                ></div>
              ))}
            </div>
            <div className="mt-2 text-xs text-indigo-300 flex justify-between">
              <span>1月</span>
              <span>年度趋势概览</span>
              <span>12月</span>
            </div>
          </div>
        </div>

        {/* Card 2: 成果总数 (高亮关键指标) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <div className="text-4xl font-black text-slate-800">{stats.totalItems}</div>
            <div className="text-sm font-bold text-slate-400 mt-1">成果申报总数</div>
          </div>
          <div className="mt-6 flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg w-fit">
            <TrendingUp className="w-3 h-3 mr-1" /> 同比增长 12.5%
          </div>
        </div>

        {/* Card 3: 通过率 (环形图概念) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-4xl font-black text-slate-800">
                {stats.totalItems > 0 ? Math.round((stats.approvedCount / stats.totalItems) * 100) : 0}%
              </div>
              <div className="text-sm font-bold text-slate-400 mt-1">总体通过率</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
          </div>
          
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-xs text-slate-500">
              <span>已通过</span>
              <span className="font-bold text-emerald-600">{stats.approvedCount}</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(stats.approvedCount / (stats.totalItems || 1)) * 100}%` }}></div>
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>待审核/驳回</span>
              <span className="font-bold text-slate-600">{stats.totalItems - stats.approvedCount}</span>
            </div>
          </div>
        </div>

        {/* Card 4: 分类构成 (长列表卡片) */}
        <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg text-slate-800 flex items-center">
              <PieChart className="w-5 h-5 mr-2 text-indigo-500" /> 成果类型分布
            </h3>
            <button className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded-lg transition">查看详情</button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* 左侧：视觉化统计 */}
            <div className="space-y-6">
              <BarChart label="学术论文" value={stats.categories.papers} total={stats.totalItems} color="bg-gradient-to-r from-blue-500 to-cyan-400" />
              <BarChart label="科研项目" value={stats.categories.projects} total={stats.totalItems} color="bg-gradient-to-r from-indigo-600 to-violet-500" />
              <BarChart label="专利软著" value={stats.categories.patents} total={stats.totalItems} color="bg-gradient-to-r from-emerald-500 to-teal-400" />
              <BarChart label="科技奖励" value={stats.categories.awards} total={stats.totalItems} color="bg-gradient-to-r from-amber-500 to-orange-400" />
            </div>

            {/* 右侧：洞察胶囊 */}
            <div className="bg-slate-50 rounded-2xl p-6 flex flex-col justify-center space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-bold uppercase">主要产出</div>
                  <div className="text-sm font-bold text-slate-700 mt-0.5">
                    学术论文占比最高，科研活跃度主要集中在基础研究领域。
                  </div>
                </div>
              </div>
              <div className="w-full h-px bg-slate-200"></div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-bold uppercase">转化潜力</div>
                  <div className="text-sm font-bold text-slate-700 mt-0.5">
                    专利成果较上季度提升 5%，产学研转化趋势向好。
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 5: 学科贡献热度 (占位图概念) */}
        <div className="md:col-span-1 lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
          <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center z-10 relative">
            <Award className="w-5 h-5 mr-2 text-rose-500" /> 学科贡献热度
          </h3>
          
          <div className="grid grid-cols-3 gap-2 mt-4">
             {/* 模拟热力图格子 */}
             {[...Array(12)].map((_, i) => (
               <div key={i} className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-rose-50 hover:border-rose-100 border border-transparent transition-all cursor-default group">
                 <div className="text-xs text-slate-400 mb-1 group-hover:text-rose-400">计算机</div>
                 <div className={`text-lg font-black ${i < 3 ? 'text-rose-500' : 'text-slate-700'}`}>{100 - i * 5}</div>
               </div>
             ))}
          </div>
          {/* 装饰性背景 */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-rose-500/5 rounded-full blur-3xl"></div>
        </div>

      </div>
    </div>
  );
};