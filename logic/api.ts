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
  return 'http://127.0.0.1:5002/api';
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
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'API request failed');
  }
  
  return response.json() as Promise<T>;
}

// Auth API
export const authAPI = {
  // Backend expects `username` instead of `email`. Accept any identifier and send as `username`.
  login: (account: string, password: string) => 
    apiRequest<{ user: any; token: string }>("/auth/login", {
      method: 'POST',
      body: JSON.stringify({ username: account, password })
    }),
  
  // Map frontend fields to backend expected payload
  register: (userData: any) => 
    apiRequest<{ user: any; token: string }>("/auth/register", {
      method: 'POST',
      body: JSON.stringify({
        username: userData.email || userData.name,
        password: userData.password,
        real_name: userData.name,
        email: userData.email,
        // role mapping for backend role binding
        role_code: userData.role,
        // Optional fields the backend accepts; leave undefined if not provided
        phone: userData.phone,
        dept_id: userData.dept_id,
        title_id: userData.title_id
      })
    })
};

// Users API
export const usersAPI = {
  getAll: () => apiRequest<any[]>('/users'),
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
  updateTags: (id: string, tags: string[]) => 
    apiRequest<any>(`/users/${id}/tags`, {
      method: 'PUT',
      body: JSON.stringify({ tags })
    })
};

// Research API
export const researchAPI = {
  getAll: () => apiRequest<any[]>("/research"),
  
  getByUserId: (userId: string) => apiRequest<any[]>(`/research/user/${userId}`),
  
  getPending: () => apiRequest<any[]>("/research/pending"),
  
  create: (researchData: any) => 
    apiRequest<any>("/research", {
      method: 'POST',
      body: JSON.stringify(researchData)
    }),
  
  updateStatus: (id: string, status: string, operatorName: string, remarks?: string) => 
    apiRequest<any>(`/research/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, operatorName, remarks })
    }),
  
  batchUpdateStatus: (ids: string[], status: string, operatorName: string, remarks?: string) => 
    apiRequest<any>("/research/batch/status", {
      method: 'PUT',
      body: JSON.stringify({ ids, status, operatorName, remarks })
    }),
  
  delete: (id: string, operatorName: string) => 
    apiRequest<any>(`/research/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ operatorName })
    })
};

// Logs API
export const logsAPI = {
  getAll: () => apiRequest<any[]>("/logs"),
  
  getByTargetId: (targetId: string) => apiRequest<any[]>(`/logs/target/${targetId}`),
  
  getByAction: (action: string) => apiRequest<any[]>(`/logs/action/${action}`)
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
  getLatestSubmissions: () => apiRequest<any[]>('/projects/submissions/latest')
};

// Health check
export const healthAPI = {
  check: () => apiRequest<any>("/health")
};
