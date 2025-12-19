
import { User, ResearchItem, Notification, ResearchCategory, AuditLog, ResearchSubtype, ProjectPhase, ResearchTag, CalendarEvent, SysRole, Permission, SystemHealth, SystemSetting, Department } from '../types';

// Mock Data Store

export const INITIAL_TAGS: ResearchTag[] = [
  { id: 't1', name: '国家级人才', category: 'honor', color: 'bg-red-100 text-red-800' },
  { id: 't2', name: '重点实验室成员', category: 'team', color: 'bg-blue-100 text-blue-800' },
  { id: 't3', name: '青年托举', category: 'honor', color: 'bg-purple-100 text-purple-800' },
];

export const INITIAL_PHASES: ProjectPhase[] = [
  { id: 'p1', name: '2024国自然预申报', deadline: '2024-01-15', targetCount: 120, submittedCount: 98, status: 'closed' },
  { id: 'p2', name: '2024国自然正式提交', deadline: '2024-03-10', targetCount: 120, submittedCount: 45, status: 'active' },
  { id: 'p3', name: '教育部人文社科申报', deadline: '2024-04-20', targetCount: 80, submittedCount: 0, status: 'upcoming' },
];

export const INITIAL_EVENTS: CalendarEvent[] = [
  { id: 'e1', title: '国自然申报截止', date: '2024-03-10', type: 'deadline' },
  { id: 'e2', title: '医疗影像项目中期检查', date: '2024-03-15', type: 'custom', relatedItemId: 'r1' },
  { id: 'e3', title: 'CVPR 2024 投稿截止', date: '2024-03-25', type: 'conference' },
  { id: 'e4', title: '年度科研绩效考核', date: '2024-03-31', type: 'custom' },
];

// Add default passwords for demo (123456)
export const INITIAL_USERS: User[] = [
  { id: 'u1', name: '陈教授', role: 'teacher', department: '计算机科学与技术学院', email: 'chen@univ.edu.cn', password: '123', tags: ['t1', 't2'] },
  { id: 'u2', name: '李研究员', role: 'teacher', department: '物理系', email: 'li.phys@univ.edu.cn', password: '123', tags: ['t3'] },
  { id: 'u3', name: '王管理员', role: 'research_admin', email: 'research.office@univ.edu.cn', password: '123' },
  { id: 'u4', name: '系统管理员', role: 'sys_admin', email: 'admin@univ.edu.cn', password: '123' }
];

// Configuration for Dynamic Forms (The "Engine" part)
export const RESEARCH_SUBTYPES: ResearchSubtype[] = [
  {
    id: 'st_vertical',
    db_id: 1, // Database integer ID
    name: '纵向科研项目',
    category: '纵向项目',
    fields: [
      { key: 'project_no', label: '项目批准号', type: 'text', required: true, placeholder: '例如: 6230001' },
      { key: 'source', label: '项目来源', type: 'select', options: ['国家自然科学基金', '科技部', '教育部'], required: true },
      { key: 'funding', label: '资助经费(万元)', type: 'number', required: true, isSensitive: true, placeholder: '例如: 50' },
      { key: 'start_date', label: '开始日期', type: 'date', required: true },
      { key: 'end_date', label: '结束日期', type: 'date', required: true }
    ]
  },
  {
    id: 'st_paper',
    db_id: 2, // Database integer ID
    name: '学术论文',
    category: '学术论文',
    fields: [
      { key: 'journal', label: '发表期刊/会议', type: 'text', required: true, placeholder: '例如: Nature Physics' },
      { key: 'impact_factor', label: '影响因子(IF)', type: 'number', placeholder: '例如: 20.1' },
      { key: 'doi', label: 'DOI', type: 'text', placeholder: '例如: 10.1038/s41567-023-0000' },
      { key: 'publish_date', label: '发表日期', type: 'date', required: true }
    ]
  },
  {
    id: 'st_patent',
    db_id: 3, // Database integer ID
    name: '发明专利',
    category: '专利',
    fields: [
      { key: 'patent_no', label: '专利号', type: 'text', required: true, placeholder: '例如: ZL 2023 1 0000000.0' },
      { key: 'type', label: '专利类型', type: 'select', options: ['发明专利', '实用新型', '外观设计'] },
      { key: 'status', label: '法律状态', type: 'select', options: ['已受理', '已授权', '已转让'] }
    ]
  }
];

export const INITIAL_RESEARCH: ResearchItem[] = [
  { 
    id: 'r1', 
    title: '基于深度学习的医疗影像分析', 
    authorId: 'u1', 
    authorName: '陈教授', 
    category: '纵向项目', 
    subtype_id: 1,
    date: '2023-09-15', 
    status: 'Approved', 
    details: '国家自然科学基金项目', 
    content_json: { project_no: '6230001', source: '国家自然科学基金', funding: 50, start_date: '2023-01-01' },
    teamMembers: ['张博士', '刘硕士'] 
  },
  { 
    id: 'r2', 
    title: '量子纠缠在通信中的应用研究', 
    authorId: 'u2', 
    authorName: '李研究员', 
    category: '学术论文', 
    subtype_id: 2,
    date: '2023-10-01', 
    status: 'Pending', 
    details: '发表于《Nature Physics》', 
    content_json: { journal: 'Nature Physics', impact_factor: 20.0, doi: '10.1038/s41567-023-0000' },
    teamMembers: ['Alice', 'Bob'] 
  },
  { 
    id: 'r5', 
    title: '企业大数据平台建设', 
    authorId: 'u1', 
    authorName: '陈教授', 
    category: '横向项目', 
    subtype_id: 1, // Assuming this is a vertical project for now
    date: '2024-01-15', 
    status: 'Draft', 
    details: '与某科技公司合作', 
    content_json: { funding: 100, source: '横向合作' },
    teamMembers: ['王工程师'] 
  },
  { 
    id: 'r6', 
    title: '面向未来的智能交通系统', 
    authorId: 'u2', 
    authorName: '李研究员', 
    category: '纵向项目', 
    subtype_id: 1,
    date: '2024-03-20', 
    status: 'Pending', 
    details: '省科技厅重点研发计划', 
    content_json: { funding: 200, source: '科技部' },
    teamMembers: [] 
  },
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 'n1', title: '关于2024年度国家自然科学基金申报的通知', date: '2023-12-01', content: '请各位老师于1月31日前在系统中提交申报书初稿。', publisher: '科研处' },
  { id: 'n2', title: '系统维护通知', date: '2023-12-05', content: '系统将于本周日凌晨2:00-4:00进行升级维护，届时将无法访问。', publisher: '信息中心' }
];

export const INITIAL_LOGS: AuditLog[] = [
  { 
    id: 'l1', 
    operatorName: '陈教授', 
    action: '提交项目申报', 
    targetId: 'r5', 
    timestamp: '2024-01-15 10:30:00',
    ip: '10.20.1.5',
    diff: { newValue: { status: 'Pending' } }
  },
  { 
    id: 'l2', 
    operatorName: '王管理员', 
    action: '审核通过', 
    targetId: 'r1', 
    timestamp: '2023-09-20 14:20:00',
    ip: '10.20.5.88',
    diff: { oldValue: { status: 'Pending' }, newValue: { status: 'Approved' } }
  }
];

export const RESEARCH_CATEGORIES: ResearchCategory[] = [
  '纵向项目', 
  '横向项目', 
  '学术论文', 
  '出版著作', 
  '专利', 
  '科技奖励'
];

// --- SYSTEM ADMIN MOCK DATA ---

export const INITIAL_ROLES: SysRole[] = [
  { id: 'role_sys_admin', name: '系统管理员', description: '拥有系统所有权限', isSystem: true, permissions: ['*'] },
  { id: 'role_research_admin', name: '校级科研管理员', description: '负责全校科研审核', isSystem: true, permissions: ['research:audit', 'research:view_all'] },
  { id: 'role_dept_auditor', name: '院级审核员', description: '仅审核本院数据', isSystem: false, permissions: ['research:audit_dept'] },
];

export const INITIAL_PERMISSIONS: Permission[] = [
  { code: 'sys:user:edit', name: '用户管理', module: 'System' },
  { code: 'sys:config:edit', name: '系统配置', module: 'System' },
  { code: 'research:audit', name: '全校审核', module: 'Research' },
  { code: 'research:audit_dept', name: '院级审核', module: 'Research' },
];

export const INITIAL_HEALTH: SystemHealth[] = [
  { id: 'h1', checkType: 'Database Connection', status: 'ok', message: 'Connection Pool: 5/20', metric: '2ms', checkedAt: 'Just now' },
  { id: 'h2', checkType: 'Disk Space (/data)', status: 'warning', message: '85% used (150GB free)', metric: '85%', checkedAt: '5 mins ago' },
  { id: 'h3', checkType: 'API Latency', status: 'ok', message: 'Average response time', metric: '120ms', checkedAt: '1 min ago' },
  { id: 'h4', checkType: 'Backup Job', status: 'error', message: 'Last backup failed: Timeout', metric: 'Failed', checkedAt: '2 hours ago' },
];

export const INITIAL_SETTINGS: SystemSetting[] = [
  { key: 'file.max_size', value: '50', type: 'number', description: '最大文件上传限制 (MB)' },
  { key: 'notification.enable_email', value: 'true', type: 'boolean', description: '启用邮件通知' },
  { key: 'security.session_timeout', value: '30', type: 'number', description: '会话超时时间 (分钟)' },
  { key: 'ui.banner_text', value: '系统维护中，请勿提交', type: 'string', description: '首页横幅公告 (为空则不显示)' },
];

export const INITIAL_DEPARTMENTS: Department[] = [
  { id: 'd1', code: 'CS', name: '计算机科学与技术学院', level: 1 },
  { id: 'd2', code: 'PHYS', name: '物理系', level: 1 },
  { id: 'd3', code: 'MATH', name: '数学科学学院', level: 1 },
];
