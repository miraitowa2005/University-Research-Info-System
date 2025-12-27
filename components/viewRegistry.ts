export type ViewDef = {
  id: string;
  title: string;
  roles?: Array<'teacher' | 'research_admin' | 'sys_admin'>;
};

const VIEWS: ViewDef[] = [
  { id: 'dashboard', title: '科研管理驾驶舱', roles: ['research_admin', 'sys_admin'] },
  { id: 'my_research', title: '我的科研成果', roles: ['teacher'] },
  { id: 'apply', title: '科研项目申报', roles: ['teacher'] },
  { id: 'profile', title: '个人学术主页', roles: ['teacher'] },
  { id: 'audit', title: '科研成果审核', roles: ['research_admin', 'sys_admin'] },
  { id: 'stats', title: '科研数据统计', roles: ['research_admin', 'sys_admin'] },
  { id: 'publish', title: '通知公告发布', roles: ['research_admin', 'sys_admin'] },
  { id: 'lifecycle', title: '项目全流程管理', roles: ['research_admin'] },
  { id: 'tags', title: '数据治理 / 标签管理', roles: ['research_admin'] },
  { id: 'reports', title: '自定义统计报表', roles: ['research_admin'] },
  { id: 'users', title: '系统用户管理', roles: ['sys_admin'] },
  { id: 'logs', title: '全链路操作审计', roles: ['sys_admin'] },
  { id: 'config', title: '系统参数配置', roles: ['sys_admin'] },
  { id: 'calendar', title: '科研日历', roles: ['teacher'] },
  { id: 'export', title: '数据导出中心', roles: ['teacher'] },
  { id: 'sys_health', title: '系统健康监控', roles: ['sys_admin'] },
  { id: 'sys_roles', title: '角色权限管理', roles: ['sys_admin'] },
  { id: 'sys_mdm', title: '主数据管理', roles: ['sys_admin'] },
  { id: 'templates', title: '审核意见模板', roles: ['research_admin'] },
  { id: 'account', title: '个人中心', roles: ['teacher'] },
  { id: 'midterm', title: '中期检查', roles: ['teacher'] },
];

export function getViewTitle(viewId: string): string {
  const v = VIEWS.find(v => v.id === viewId);
  return v?.title || viewId;
}

export function listViewsForRole(role: 'teacher' | 'research_admin' | 'sys_admin'): ViewDef[] {
  return VIEWS.filter(v => !v.roles || v.roles.includes(role));
}

