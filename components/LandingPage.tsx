import React from 'react';
import { 
  Hexagon, BookOpen, ClipboardList, CheckCircle, BarChart3, 
  Users, Shield, LogIn, Zap, ChevronRight, Activity, 
  Search, FileText, Layout
} from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export default function LandingPage({
  onLoginClick,
  onRegisterClick,
}: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden relative">
      
      {/* --- 1. 动态背景层 (无需额外图片，使用 CSS 绘制) --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* 顶部流光 */}
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[100px]"></div>
        {/* 底部氛围 */}
        <div className="absolute bottom-[-10%] left-[20%] w-[800px] h-[400px] bg-blue-600/10 rounded-full blur-[120px]"></div>
        {/* 网格纹理 */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
      </div>

      {/* --- 2. 顶部导航栏 --- */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0f172a]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500 blur-md opacity-20 group-hover:opacity-40 transition duration-500 rounded-xl"></div>
              <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-600 flex items-center justify-center shadow-lg">
                <Hexagon className="w-5 h-5 text-white fill-white/20" />
              </div>
            </div>
            <span className="text-xl font-bold tracking-wide text-white group-hover:text-cyan-100 transition">UR System</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={onLoginClick} 
              className="hidden md:block text-sm font-medium text-slate-400 hover:text-white transition px-2"
            >
              已有账号登录
            </button>
            <button 
              onClick={onRegisterClick} 
              className="bg-white text-slate-900 hover:bg-cyan-50 font-bold text-sm rounded-full px-5 py-2 transition-all shadow-[0_0_15px_-3px_rgba(255,255,255,0.3)] hover:shadow-[0_0_20px_-5px_rgba(34,211,238,0.6)] active:scale-95"
            >
              立即注册
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        
        {/* --- 3. Hero Section (首屏展示) --- */}
        <section className="pt-20 pb-32 px-6">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            
            {/* 左侧：文案与行动 */}
            <div className="space-y-8 animate-in slide-in-from-bottom-8 fade-in duration-1000">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Research Management Platform
              </div>
              
              <h1 className="text-5xl md:text-7xl font-extrabold leading-tight text-white tracking-tight">
                科研数据，<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 animate-gradient-x">
                  由此流动与增值
                </span>
              </h1>
              
              <p className="text-lg text-slate-400 leading-relaxed max-w-xl">
                专为高校打造的一站式科研管理中枢。集成项目申报、成果归档、经费透视与智能审批，让繁杂的行政流程转化为高效的创新动力。
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <button 
                  onClick={onLoginClick} 
                  className="h-14 px-8 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-lg shadow-lg shadow-blue-900/50 transition-all hover:-translate-y-1 active:scale-95 flex items-center"
                >
                  <LogIn className="w-5 h-5 mr-2" /> 进入工作台
                </button>
                <button 
                  className="h-14 px-8 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium backdrop-blur-md transition-all flex items-center group"
                >
                  了解功能 <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="pt-8 flex items-center gap-6 text-sm text-slate-500 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span>数据加密存储</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-500" />
                  <span>全流程合规审计</span>
                </div>
              </div>
            </div>

            {/* 右侧：抽象功能展示图 (Glassmorphism Cards) */}
            <div className="relative hidden lg:block h-[500px]">
              {/* 背景装饰环 */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
              
              {/* 悬浮卡片组 */}
              <div className="relative w-full h-full perspective-1000">
                {/* 卡片 1: 成果 */}
                <div className="absolute top-10 right-10 w-64 p-5 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-2xl animate-float-slow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400"><BookOpen className="w-5 h-5"/></div>
                    <div className="h-2 w-20 bg-white/20 rounded"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 w-full bg-white/10 rounded"></div>
                    <div className="h-2 w-2/3 bg-white/10 rounded"></div>
                  </div>
                </div>

                {/* 卡片 2: 统计 */}
                <div className="absolute top-40 left-0 w-72 p-6 rounded-2xl bg-gradient-to-br from-indigo-900/80 to-slate-900/80 backdrop-blur-xl border border-indigo-500/30 shadow-2xl animate-float-medium z-20">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <div className="text-xs text-indigo-300 mb-1">年度经费总额</div>
                      <div className="text-2xl font-bold text-white">¥ 1,280<span className="text-sm text-indigo-300 font-normal">万</span></div>
                    </div>
                    <Activity className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="flex items-end gap-1 h-16">
                    <div className="w-1/5 bg-indigo-500/30 rounded-t h-[40%]"></div>
                    <div className="w-1/5 bg-indigo-500/50 rounded-t h-[60%]"></div>
                    <div className="w-1/5 bg-indigo-500/70 rounded-t h-[50%]"></div>
                    <div className="w-1/5 bg-indigo-500/40 rounded-t h-[70%]"></div>
                    <div className="w-1/5 bg-cyan-500 rounded-t h-[90%] shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
                  </div>
                </div>

                {/* 卡片 3: 审批 */}
                <div className="absolute bottom-20 right-20 w-60 p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl animate-float-fast">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-slate-400">待办审批</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px]">Pending</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-700 border border-white/10"></div>
                    <div className="space-y-1">
                      <div className="h-2 w-24 bg-white/20 rounded"></div>
                      <div className="h-2 w-16 bg-white/10 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- 4. Feature Grid (核心功能) --- */}
        <section className="py-24 relative bg-[#0b1120]/50 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-white mb-4">为什么选择 UR System?</h2>
              <p className="text-slate-400">我们深入高校科研场景，重新定义了数据管理体验。</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <DetailCard 
                icon={Users}
                title="角色权限分明"
                desc="专为高校设计的三级权限体系：教师专注科研产出，院系负责初审把关，校级统筹全局管理。"
              />
              <DetailCard 
                icon={BarChart3}
                title="深度数据洞察"
                desc="内置多维分析报表。从学科分布、经费趋势到人才画像，数据可视化为双一流建设提供决策依据。"
              />
              <DetailCard 
                icon={ClipboardList}
                title="动态表单引擎"
                desc="支持管理员可视配置申报模板。无论是国自然还是校级课题，字段按需定义，无需代码即可扩展。"
              />
              <DetailCard 
                icon={Search}
                title="智能成果认领"
                desc="集成外部文献库接口，自动抓取并推送本校署名的论文成果，教师一键认领，拒绝重复填报。"
              />
              <DetailCard 
                icon={FileText}
                title="一键简历生成"
                desc="基于系统内沉淀的真实数据，一键导出符合学校考核标准的学术简历与职称评审材料。"
              />
              <DetailCard 
                icon={Layout}
                title="个性化驾驶舱"
                desc="千人千面。教师关注项目进度，领导关注学科指标，管理员关注待办队列，各取所需。"
              />
            </div>
          </div>
        </section>
      </main>

      {/* --- 5. Footer --- */}
      <footer className="border-t border-white/10 bg-[#0b1120] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition duration-300 cursor-default">
            <Hexagon className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-slate-200">UR System</span>
          </div>
          <div className="text-slate-500 text-sm">
            © 2024 University Research System. All rights reserved.
          </div>
        </div>
      </footer>

      {/* 定义 CSS 动画样式 (如果 Tailwind config 中没有配置，这里作为兜底) */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 5s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 4s ease-in-out infinite; }
        .perspective-1000 { perspective: 1000px; }
      `}</style>
    </div>
  );
}

// --- 子组件：详细特性卡片 ---
function DetailCard({ icon: Icon, title, desc }: any) {
  return (
    <div className="group p-8 rounded-3xl bg-[#1e293b]/40 border border-white/5 hover:border-cyan-500/30 hover:bg-[#1e293b] transition-all duration-300 hover:-translate-y-1">
      <div className="h-14 w-14 rounded-2xl bg-slate-800/50 border border-white/5 flex items-center justify-center mb-6 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/20 group-hover:scale-110 transition-all duration-300">
        <Icon className="w-7 h-7 text-slate-400 group-hover:text-cyan-400 transition-colors" />
      </div>
      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-100 transition-colors">{title}</h3>
      <p className="text-slate-400 leading-relaxed text-sm">
        {desc}
      </p>
    </div>
  );
}