// API Service for University Research Info System

// Resolve API base URL with multiple fallbacks to avoid hardcoding ports
function resolveApiBase(): string {
  // 1) Runtime override via localStorage (no rebuild, immediate effect)
  try {
    const saved = localStorage.getItem('API_BASE_URL');
    if (saved && /^https?:\/\/.+/.test(saved)) {
      return saved.replace(/\/+$/, '');
    }
  } catch (_) {}

  // 2) Vite env variable (requires dev server restart if changed)
  const envBase = (import.meta as any)?.env?.VITE_API_BASE;
  if (envBase) {
    return String(envBase).replace(/\/+$/, '');
  }

  // 3) Global window override (optional)
  try {
    const g = window as any;
    if (g && g.__API_BASE__) {
      return String(g.__API_BASE__).replace(/\/+$/, '');
    }
  } catch (_) {}

  // 4) Default fallback
  return 'http://127.0.0.1:5003/api/v1';
}

const API_BASE_URL = resolveApiBase();

// Helper function for API requests
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  } as Record<string, string>;
  const url = `${API_BASE_URL}${endpoint}`;
  
  let attempt = 0;
  const method = String(options.method || 'GET').toUpperCase();
  const isWrite = method !== 'GET';
  const maxAttempts = isWrite ? 1 : 5;
  const baseDelay = 1000;

  while (attempt < maxAttempts) {
    try {
      const response = await fetch(url, { 
        ...options, 
        headers,
        cache: 'no-store' // Prevent caching to ensure we hit the live backend
      });

      if (!response.ok) {
        // 保留 token，避免短暂 401/403 导致后续请求全部未授权
        const errorData = await response.json().catch(() => ({} as any));
        const message =
          (errorData && (errorData.message || errorData.detail || errorData.error)) ||
          `API request failed (${response.status})`;
        throw new Error(message);
      }

      if (response.status === 204) {
        return undefined as T;
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        return (await response.text()) as unknown as T;
      }

      return response.json() as Promise<T>;
    } catch (error: any) {
      const isNetworkError = error instanceof TypeError && (
        error.message.includes('Failed to fetch') || 
        error.message.includes('ERR_CONNECTION_REFUSED') ||
        error.message.includes('NetworkError')
      );

      if (attempt === maxAttempts - 1) {
        if (isNetworkError) {
          throw new Error('无法连接后端服务，请确认 127.0.0.1:5003 已启动且网络正常');
        }
        throw error;
      }
      
      if (isNetworkError && !isWrite) {
        // Exponential backoff for network issues: 1s, 2s, 4s, 8s
        const delay = baseDelay * Math.pow(2, attempt);
        console.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        attempt++;
        continue;
      }

      // Non-network errors (e.g. 404, 500) throw immediately
      throw error;
    }
  }

  throw new Error('Max retries exceeded');
}

function normalizeUser(raw: any): any {
  if (!raw || typeof raw !== 'object') return raw;
  const id = raw.id != null ? String(raw.id) : '';
  const name = raw.name || raw.fullName || raw.full_name || raw.real_name || '';
  const email = raw.email || raw.username || '';
  const isSuperuser = Boolean(raw.isSuperuser ?? raw.is_superuser ?? raw.is_super_user ?? raw.isAdmin ?? false);
  let role = raw.role || (isSuperuser ? 'sys_admin' : 'teacher');
  const department = raw.department || raw.dept || raw.deptName || raw.dept_name || raw.department_name;
  const dept_id_raw = raw.dept_id ?? raw.deptId;
  const dept_id = dept_id_raw != null ? Number(dept_id_raw) : undefined;
  const department_code = raw.department_code || raw.dept_code || raw.deptCode;
  const tags = raw.tags;

  return {
    ...raw,
    id,
    name,
    email,
    role,
    ...(department ? { department } : {}),
    ...(dept_id != null ? { dept_id } : {}),
    ...(department_code ? { department_code } : {}),
    ...(Array.isArray(tags) ? { tags } : {}),
  };
}

function normalizeResearchItem(raw: any, usersCache?: Record<string, string>): any {
  if (!raw || typeof raw !== 'object') return raw;
  const id = raw.id != null ? String(raw.id) : '';
  const authorId = raw.user_id != null ? String(raw.user_id) : '';
  const authorName = (usersCache && usersCache[authorId]) || raw.authorName || '';
  const subtypeId = raw.subtype_id;
  const sLower = String(raw.status || '').toLowerCase().trim();
  const status =
    sLower === 'approved' ? 'Approved' :
    sLower === 'rejected' ? 'Rejected' :
    sLower === 'pending' ? 'Pending' :
    sLower === 'draft' ? 'Draft' :
    (raw.status || 'Draft');
  const date = raw.date || (raw.created_at ? String(raw.created_at).substring(0, 10) : '');
  let category = raw.category;
  if (!category) {
    // Simple mapping by subtype id, aligned with RESEARCH_SUBTYPES db_id hints
    if (subtypeId === 1) category = '纵向项目';
    else if (subtypeId === 2) category = '学术论文';
    else if (subtypeId === 3) category = '专利';
    else {
      const src = raw?.content_json?.source;
      if (typeof src === 'string') {
        if (src.includes('校企合作') || src.includes('地方政府项目')) category = '横向项目';
        else if (src.includes('国家自然科学基金') || src.includes('科技部') || src.includes('教育部')) category = '纵向项目';
      }
    }
  }
  return {
    ...raw,
    id,
    authorId,
    authorName,
    category,
    date,
    status,
    content_json: raw.content_json,
    audit_remarks: raw.audit_remarks,
    teamMembers: raw.teamMembers || raw.collaborators?.map((c: any) => c.user_name) || [],
  };
}

// Auth API
export const authAPI = {
  login: async (account: string, password: string) => {
    const form = new URLSearchParams();
    form.set('username', account);
    form.set('password', password);

    const tokenResp = await fetch(`${API_BASE_URL}/login/access-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });

    if (!tokenResp.ok) {
      const errorData = await tokenResp.json().catch(() => ({} as any));
      const message =
        (errorData && (errorData.message || errorData.detail || errorData.error)) ||
        `登录失败 (${tokenResp.status})`;
      throw new Error(message);
    }

    const tokenData = (await tokenResp.json()) as any;
    const token = tokenData?.access_token || tokenData?.token;
    if (!token) throw new Error('登录失败：未获取到令牌');

    const me = await apiRequest<any>('/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    });

    return { token, user: normalizeUser(me) };
  },

  register: async (userData: any) => {
    await apiRequest<any>('/users', {
      method: 'POST',
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
        full_name: userData.name,
        is_superuser: userData.role === 'sys_admin',
        role: userData.role,
      }),
    });

    return authAPI.login(userData.email, userData.password);
  },
};

// Users API
export const usersAPI = {
  getMe: () => apiRequest<any>('/users/me').then(normalizeUser),
  getAll: () => apiRequest<any[]>('/users').then(arr => Array.isArray(arr) ? arr.map(normalizeUser) : []),
  getById: (id: string) => apiRequest<any>(`/users/${id}`),
  create: (userData: any) => apiRequest<any>('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  update: (id: string, userData: any) => apiRequest<any>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),
  delete: (id: string) => apiRequest<any>(`/users/${id}`, {
    method: 'DELETE',
  }),
  changePassword: (id: string, newPassword: string) => apiRequest<any>(`/users/${id}/password`, {
    method: 'PUT',
    body: JSON.stringify({ new_password: newPassword })
  }),
  updateTags: (id: string, tags: string[]) => 
    apiRequest<any>(`/users/${id}/tags`, {
      method: 'PUT',
      body: JSON.stringify({ tags })
    }),
  updateMe: (userData: any) => apiRequest<any>('/users/me', {
    method: 'PUT',
    body: JSON.stringify({
      // name mapping
      full_name: userData.full_name ?? userData.fullName ?? userData.name,
      // contact & profile
      email: userData.email,
      phone: userData.phone,
      office_location: userData.office_location ?? userData.officeLocation,
      // employment
      employee_id: userData.employee_id ?? userData.employeeId,
      gender: userData.gender,
      birth_date: userData.birth_date ?? userData.birthDate,
      // education
      highest_education: userData.highest_education ?? userData.highestEducation,
      degree: userData.degree,
      alma_mater: userData.alma_mater ?? userData.almaMater,
      major: userData.major,
      advisor_qualification: userData.advisor_qualification ?? userData.advisorQualification,
      // research
      research_direction: userData.research_direction ?? userData.researchDirection,
      // department
      department: userData.department,
      department_code: userData.department_code ?? userData.departmentCode,
      dept_id: userData.dept_id,
      // flags
      profile_public: userData.profile_public ?? userData.profilePublic
    }),
  }),
  getMyExperiences: () => apiRequest<any[]>('/users/me/experiences'),
  addMyExperience: (exp: any) => apiRequest<any>('/users/me/experiences', { method: 'POST', body: JSON.stringify(exp) }),
  updateMyExperience: (id: number, exp: any) => apiRequest<any>(`/users/me/experiences/${id}`, { method: 'PUT', body: JSON.stringify(exp) }),
  deleteMyExperience: (id: number) => apiRequest<any>(`/users/me/experiences/${id}`, { method: 'DELETE' }),
  changeMyPassword: (oldPassword: string, newPassword: string) => apiRequest<any>('/users/me/password', { method: 'PUT', body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }) }),
};

// Research API
export const researchAPI = {
  getAll: () => apiRequest<any[]>("/research").then(arr => Array.isArray(arr) ? arr.map(it => normalizeResearchItem(it)) : []),
  getAllAdmin: () => apiRequest<any[]>("/research/all").then(arr => Array.isArray(arr) ? arr.map(it => normalizeResearchItem(it)) : []),
  
  getByUserId: (userId: string) => apiRequest<any[]>(`/research/user/${userId}`).then(arr => Array.isArray(arr) ? arr.map(it => normalizeResearchItem(it)) : []),
  getByCategory: (category: string) => apiRequest<any[]>(`/research/category/${encodeURIComponent(category)}`).then(arr => Array.isArray(arr) ? arr.map(it => normalizeResearchItem(it)) : []),
  categories: () => apiRequest<any[]>(`/research/categories`),
  
  getPending: () => apiRequest<any[]>("/research/pending").then(arr => Array.isArray(arr) ? arr.map(it => normalizeResearchItem(it)) : []),
  
  listSubtypes: () => apiRequest<any[]>("/research/subtypes"),
  
  export: async (types: string[], format: 'csv'|'json'|'pdf') => {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${API_BASE_URL}/research/export`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ types, format }),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({} as any));
      const message = (errorData && (errorData.message || errorData.detail || errorData.error)) || `导出失败 (${res.status})`;
      throw new Error(message);
    }
    const blob = await res.blob();
    const cd = res.headers.get('content-disposition') || '';
    const m = cd.match(/filename="?([^"]+)"?/);
    const filename = m ? m[1] : `research_export_${Date.now()}.zip`;
    return { blob, filename, size: blob.size };
  },
  exportCV: async (types: string[]) => {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${API_BASE_URL}/research/export-cv`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ types }),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({} as any));
      const message = (errorData && (errorData.message || errorData.detail || errorData.error)) || `导出失败 (${res.status})`;
      throw new Error(message);
    }
    const blob = await res.blob();
    const cd = res.headers.get('content-disposition') || '';
    const m = cd.match(/filename="?([^"]+)"?/);
    const filename = m ? m[1] : `CV_${Date.now()}.docx`;
    return { blob, filename, size: blob.size };
  },
  fundingByDept: async (deptId: number) => {
    const res = await apiRequest<any>(`/research/funding/dept/${deptId}`);
    return Number(res?.total_funding || 0);
  },
  
  create: (researchData: any) => 
    apiRequest<any>("/research", {
      method: 'POST',
      body: JSON.stringify({
        title: researchData.title,
        subtype_id: researchData.subtype_id,
        content_json: researchData.content_json,
        status: String(researchData.status || 'draft').toLowerCase(),
        file_url: researchData.file_url,
        team_members: researchData.teamMembers || []
      })
    }),
  
  updateStatus: (id: string, status: string, operatorName: string, remarks?: string) => 
    apiRequest<any>(`/research/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: String(status).toLowerCase(), operatorName, remarks })
    }),
  
  batchUpdateStatus: (ids: string[], status: string, operatorName: string, remarks?: string) => 
    apiRequest<any>("/research/batch/status", {
      method: 'PUT',
      body: JSON.stringify({ ids, status: String(status).toLowerCase(), operatorName, remarks })
    }),
  
  delete: (id: string, operatorName: string) => 
    apiRequest<any>(`/research/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ operatorName })
    })
};

// Logs API
export const logsAPI = {
  getAll: async () => {
    try {
      return await apiRequest<any[]>("/logs");
    } catch {
      return [];
    }
  },
  
  getByTargetId: (targetId: string) => apiRequest<any[]>(`/logs/target/${targetId}`),
  
  getByAction: (action: string) => apiRequest<any[]>(`/logs/action/${action}`)
};

// Notices API
export const noticeAPI = {
  list: () => apiRequest<any[]>("/notices/"),
  create: (data: { title: string; content: string; target_role: string; target_department_code?: string; publisher?: string }) =>
    apiRequest<any>("/notices/", { method: 'POST', body: JSON.stringify(data) }),
  my: () => apiRequest<any[]>("/notices/mine"),
  markRead: (id: string | number) => apiRequest<any>(`/notices/${id}/read`, { method: 'PUT' }),
  unreadCount: async () => {
    const r = await apiRequest<any>("/notices/unread-count");
    return Number(r?.count || 0);
  },
  deleteMine: (id: number) => apiRequest<any>(`/notices/${id}/mine`, { method: 'DELETE' }),
};

export const departmentAPI = {
  list: () => apiRequest<any[]>("/departments"),
  normalize: async (name: string) => {
    const res = await apiRequest<any>(`/departments/normalize?name=${encodeURIComponent(name)}`);
    return res?.code || null;
  },
  create: (code: string, name: string) => apiRequest<any>("/departments", { method: 'POST', body: JSON.stringify({ code, name }) }),
  update: (code: string, name: string) => apiRequest<any>(`/departments/${code}`, { method: 'PUT', body: JSON.stringify({ name }) }),
  delete: (code: string) => apiRequest<any>(`/departments/${code}`, { method: 'DELETE' }),
};

// Review Templates API (for research_admin)
export const templatesAPI = {
  list: () => apiRequest<any[]>("/review-templates"),
  create: (data: { title: string; content: string; is_shared?: boolean }) =>
    apiRequest<any>("/review-templates", { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: { title?: string; content?: string; is_shared?: boolean }) =>
    apiRequest<any>(`/review-templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => apiRequest<any>(`/review-templates/${id}`, { method: 'DELETE' })
};

// Project Application API
export const projectAPI = {
  // Get all project notices
  getNotices: () => apiRequest<any[]>('/projects/notices'),
  
  // Get project phases for a notice
  getNoticePhases: (noticeId: number) => apiRequest<any[]>(`/projects/notices/${noticeId}/phases`),
  
  // Get my submissions (teacher-side)
  getMySubmissions: (userId: number) => apiRequest<any[]>(`/projects/my-submissions?user_id=${userId}`),
  
  // Get submissions for a specific phase (admin-side)
  getPhaseSubmissions: (phaseId: number) => apiRequest<any[]>(`/projects/phases/${phaseId}/submissions`),
  
  // Get latest submissions (admin-side real-time updates)
  getLatestSubmissions: () => apiRequest<any[]>('/projects/submissions/latest'),

  // Save draft
  saveDraft: (phaseId: number, content_json: any) =>
    apiRequest<any>(`/projects/phases/${phaseId}/draft`, { method: 'POST', body: JSON.stringify({ content_json }) }),

  // Create submission
  submit: (phaseId: number, payload: { status?: string; file_url?: string; remarks?: string; content_json?: any }) =>
    apiRequest<any>(`/projects/phases/${phaseId}/submissions`, { method: 'POST', body: JSON.stringify(payload) }),

  // Upload attachment
  uploadAttachment: async (submissionId: number, file: File) => {
    const token = localStorage.getItem('token');
    const url = `${API_BASE_URL}/projects/upload?submission_id=${submissionId}`;
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      } as any,
      body: fd
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({} as any));
      throw new Error(data.detail || 'Upload failed');
    }
    return await res.json();
  }
,
  // Core project create/list per design document
  createProject: (payload: { title: string; type: string; status?: number; content_json?: any }) =>
    apiRequest<any>("/projects/create", { method: 'POST', body: JSON.stringify(payload) }),
  listProjects: (params: { applicant_id?: number; keyword?: string; status?: number; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params.applicant_id) query.set("applicant_id", String(params.applicant_id));
    if (params.keyword) query.set("keyword", params.keyword);
    if (typeof params.status === 'number') query.set("status", String(params.status));
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    return apiRequest<any>("/projects/list" + (query.toString() ? `?${query.toString()}` : ""));
  },
  publishBatch: (data: { batch_name: string; start_time: string; end_time: string; visibility_scope?: number; requirements?: string }) =>
    apiRequest<any>("/projects/batches", { method: 'POST', body: JSON.stringify(data) }),
  getAvailableBatches: () => apiRequest<any[]>("/projects/batches/available")
};

export const reportsAPI = {
  yearend: (year: number, deptId?: number) => {
    const qs = new URLSearchParams();
    qs.set('year', String(year));
    if (deptId != null) qs.set('dept_id', String(deptId));
    return apiRequest<any>(`/research/reports/yearend?${qs.toString()}`);
  }
};
// Health check
export const healthAPI = {
  check: () => apiRequest<any>("/admin/health")
};

export const adminAPI = {
  backup: () => apiRequest<any>("/admin/backup", { method: 'POST' }),
  backups: () => apiRequest<any[]>("/admin/backups"),
  clearCache: () => apiRequest<any>("/admin/cache/clear", { method: 'POST' }),
};

export const rbacAPI = {
  listRoles: () => apiRequest<any[]>("/rbac/roles"),
  createRole: (name: string, description?: string) => apiRequest<any>("/rbac/roles", { method: 'POST', body: JSON.stringify({ name, description }) }),
  updateRole: (id: number, data: { name?: string; description?: string }) => apiRequest<any>(`/rbac/roles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRole: (id: number) => apiRequest<any>(`/rbac/roles/${id}`, { method: 'DELETE' }),
  savePermissions: (id: number, codes: string[]) => apiRequest<any>(`/rbac/roles/${id}/permissions`, { method: 'PUT', body: JSON.stringify({ codes }) }),
  getPermissions: () => apiRequest<any[]>("/rbac/permissions"),
  createPermission: (code: string, name: string, module: string, description?: string) => apiRequest<any>("/rbac/permissions", { method: 'POST', body: JSON.stringify({ code, name, module, description }) }),
  updatePermission: (id: number, data: { name?: string; module?: string; description?: string; enabled?: boolean }) => apiRequest<any>(`/rbac/permissions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePermission: (id: number) => apiRequest<any>(`/rbac/permissions/${id}`, { method: 'DELETE' }),
};

export const roleAPIs = {
  teacher: {
    auth: authAPI,
    users: {
      me: usersAPI.getMe,
      updateMe: usersAPI.updateMe,
      experiences: {
        list: usersAPI.getMyExperiences,
        add: usersAPI.addMyExperience,
        update: usersAPI.updateMyExperience,
        delete: usersAPI.deleteMyExperience,
      },
      changePassword: usersAPI.changeMyPassword,
    },
    research: {
      listMine: researchAPI.getAll,
      listByUser: researchAPI.getByUserId,
      listSubtypes: researchAPI.listSubtypes,
      categories: researchAPI.categories,
      create: researchAPI.create,
      submit: (id: string, operatorName: string) => researchAPI.updateStatus(id, 'pending', operatorName),
    },
    notices: {
      my: noticeAPI.my,
      markRead: noticeAPI.markRead,
    },
    departments: {
      list: departmentAPI.list,
      normalize: departmentAPI.normalize,
    },
    logs: {
      list: logsAPI.getAll,
    },
  },
  research_admin: {
    auth: authAPI,
    users: {
      me: usersAPI.getMe,
      updateMe: usersAPI.updateMe,
    },
    research: {
      listAll: researchAPI.getAllAdmin,
      listPending: researchAPI.getPending,
      approve: (id: string, operatorName: string) => researchAPI.updateStatus(id, 'approved', operatorName),
      reject: (id: string, operatorName: string, remarks?: string) => researchAPI.updateStatus(id, 'rejected', operatorName, remarks),
      batchUpdate: researchAPI.batchUpdateStatus,
    },
    notices: {
      list: noticeAPI.list,
    },
    templates: templatesAPI,
    departments: {
      list: departmentAPI.list,
      normalize: departmentAPI.normalize,
    },
    logs: {
      list: logsAPI.getAll,
    },
    health: healthAPI.check,
  },
  sys_admin: {
    auth: authAPI,
    users: usersAPI,
    research: {
      listAll: researchAPI.getAllAdmin,
      listPending: researchAPI.getPending,
      updateStatus: researchAPI.updateStatus,
      batchUpdate: researchAPI.batchUpdateStatus,
      delete: researchAPI.delete,
    },
    notices: {
      list: noticeAPI.list,
      create: noticeAPI.create,
    },
    departments: departmentAPI,
    admin: adminAPI,
    rbac: rbacAPI,
    logs: {
      list: logsAPI.getAll,
    },
    health: healthAPI.check,
  }
};
