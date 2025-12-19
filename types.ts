
export type Role = 'teacher' | 'research_admin' | 'sys_admin' | string;

export interface User {
  id: string;
  name: string;
  role: Role;
  department?: string;
  email: string;
  password?: string; // Added for authentication simulation
  avatarUrl?: string;
  tags?: string[]; // IDs of tags assigned to user
}

export type ResearchCategory = '纵向项目' | '横向项目' | '学术论文' | '出版著作' | '专利' | '科技奖励';

export type ApprovalStatus = 'Draft' | 'Pending' | 'Approved' | 'Rejected';

// Dynamic Field Definition
export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'textarea' | 'select';
  required?: boolean;
  options?: string[]; // For select types
  isSensitive?: boolean; // For masking (e.g., funding amount)
  placeholder?: string;
}

// Subtype Definition (e.g., configuration for "Vertical Project")
export interface ResearchSubtype {
  id: string;
  name: string;
  category: ResearchCategory;
  fields: FormField[];
}

export interface ResearchItem {
  id: string;
  title: string;
  authorId: string;
  authorName: string;
  category: ResearchCategory;
  date: string;
  status: ApprovalStatus;
  details?: string; // Summary string for display
  content_json?: Record<string, any>; // Dynamic data storage
  teamMembers?: string[];
}

export interface Notification {
  id: string;
  title: string;
  date: string;
  content: string;
  publisher?: string;
}

export interface AuditLog {
  id: string;
  operatorName: string;
  action: string;
  targetId: string;
  timestamp: string;
  ip?: string;
  diff?: {
    oldValue?: any;
    newValue?: any;
  };
}

// --- NEW TYPES FOR ENHANCED ADMIN ---

export interface ProjectPhase {
  id: string;
  name: string; // e.g., "预申报", "正式申报"
  deadline: string;
  targetCount: number; // Total eligible teachers
  submittedCount: number;
  status: 'active' | 'upcoming' | 'closed';
}

export interface ResearchTag {
  id: string;
  name: string; // e.g., "国家级人才"
  category: 'honor' | 'team' | 'other';
  color: string;
}

export interface ReportConfig {
  id: string;
  title: string;
  dimensions: string[]; // e.g., ['year', 'department']
  metrics: string[]; // e.g., ['count', 'funding']
}

// --- NEW TYPES FOR TEACHER TOOLS ---

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  type: 'deadline' | 'conference' | 'custom';
  relatedItemId?: string;
}

// --- NEW TYPES FOR SYSTEM ADMIN CORE ---

export interface SysRole {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: string[]; // Permission Codes
}

export interface Permission {
  code: string;
  name: string;
  module: string;
}

export interface SystemHealth {
  id: string;
  checkType: string;
  status: 'ok' | 'warning' | 'error';
  message: string;
  metric?: string; // e.g., "24ms"
  checkedAt: string;
}

export interface SystemSetting {
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  description: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  parentId?: string;
  level: number;
}
