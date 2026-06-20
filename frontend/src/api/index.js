import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || '/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('aigc_geo_overseas_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - unified error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) {
        localStorage.removeItem('aigc_geo_overseas_token');
        window.location.href = '/login';
      }
      return Promise.reject({
        code: status,
        message: data?.message || data?.detail || 'Request failed',
        data: data,
      });
    }
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({ code: 0, message: 'Request timeout, please retry later' });
    }
    return Promise.reject({ code: 0, message: 'Network error, please check connection' });
  }
);

// ========== Dashboard ==========
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getAgentStatus: () => api.get('/dashboard/agent-status'),
  getTokenTrend: (days = 7) => api.get(`/dashboard/token-trend?days=${days}`),
  getRecentActivity: () => api.get('/dashboard/recent-activity'),
};

// ========== Agents ==========
export const agentsApi = {
  list: (params = {}) => api.get('/agents', { params }),
  getById: (id) => api.get(`/agents/${id}`),
  create: (data) => api.post('/agents', data),
  update: (id, data) => api.put(`/agents/${id}`, data),
  delete: (id) => api.delete(`/agents/${id}`),
  duplicate: (id) => api.post(`/agents/${id}/duplicate`),
  getVersions: (id) => api.get(`/agents/${id}/versions`),
  toggleStatus: (id) => api.post(`/agents/${id}/toggle`),
  testRun: (id, input) => api.post(`/agents/${id}/test`, { input }),
};

// ========== Team ==========
export const teamApi = {
  getOrgTree: () => api.get('/team/org-tree'),
  getMembers: (params = {}) => api.get('/team/members', { params }),
  inviteMember: (data) => api.post('/team/invite', data),
  updateMember: (id, data) => api.put(`/team/members/${id}`, data),
  removeMember: (id) => api.delete(`/team/members/${id}`),
  getRoles: () => api.get('/team/roles'),
  createRole: (data) => api.post('/team/roles', data),
  getDepartments: () => api.get('/api/v1/departments'),
  getAgents: () => api.get('/api/v1/agents'),
};

// ========== Workflow ==========
export const workflowApi = {
  list: (params = {}) => api.get('/workflows', { params }),
  getById: (id) => api.get(`/workflows/${id}`),
  create: (data) => api.post('/workflows', data),
  update: (id, data) => api.put(`/workflows/${id}`, data),
  delete: (id) => api.delete(`/workflows/${id}`),
  execute: (id, input) => api.post(`/workflows/${id}/execute`, { input }),
  getLogs: (id) => api.get(`/workflows/${id}/logs`),
  validate: (data) => api.post('/workflows/validate', data),
};

// ========== Tasks / Kanban ==========
export const tasksApi = {
  list: (params = {}) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  moveCard: (id, status) => api.patch(`/tasks/${id}/move`, { status }),
  getColumns: () => api.get('/tasks/columns'),
};

// ========== Content ==========
export const contentApi = {
  list: (params = {}) => api.get('/content', { params }),
  getById: (id) => api.get(`/content/${id}`),
  create: (data) => api.post('/content', data),
  update: (id, data) => api.put(`/content/${id}`, data),
  delete: (id) => api.delete(`/content/${id}`),
  generate: (data) => api.post('/content/generate', data),
  batchGenerate: (data) => api.post('/content/batch-generate', data),
  getCategories: () => api.get('/content/categories'),
};

// ========== Keywords ==========
export const keywordsApi = {
  list: (params = {}) => api.get('/keywords', { params }),
  getById: (id) => api.get(`/keywords/${id}`),
  create: (data) => api.post('/keywords', data),
  update: (id, data) => api.put(`/keywords/${id}`, data),
  delete: (id) => api.delete(`/keywords/${id}`),
  batchCreate: (data) => api.post('/keywords/batch', data),
  analyze: (data) => api.post('/keywords/analyze', data),
  getGroups: () => api.get('/keywords/groups'),
  getSuggestions: (keyword) => api.get(`/keywords/suggestions?q=${keyword}`),
};

// ========== Tokens ==========
export const tokensApi = {
  getUsage: (params = {}) => api.get('/tokens/usage', { params }),
  getTrend: (days = 30) => api.get(`/tokens/trend?days=${days}`),
  getModelBreakdown: () => api.get('/tokens/model-breakdown'),
  getCostAnalysis: () => api.get('/tokens/cost-analysis'),
  getDailyReport: (date) => api.get(`/tokens/daily-report?date=${date}`),
};

// ========== Plugins ==========
export const pluginsApi = {
  list: (params = {}) => api.get('/plugins', { params }),
  getById: (id) => api.get(`/plugins/${id}`),
  create: (data) => api.post('/plugins', data),
  update: (id, data) => api.put(`/plugins/${id}`, data),
  delete: (id) => api.delete(`/plugins/${id}`),
  toggleStatus: (id) => api.post(`/plugins/${id}/toggle`),
  getMarketplace: () => api.get('/plugins/marketplace'),
  installFromMarket: (id) => api.post(`/plugins/install/${id}`),
};

// ========== Chat ==========
export const chatApi = {
  send: (data) => api.post('/chat/send', data),
  getHistory: (sessionId) => api.get(`/chat/history/${sessionId}`),
  getSessions: () => api.get('/chat/sessions'),
  createSession: () => api.post('/chat/sessions'),
  deleteSession: (id) => api.delete(`/chat/sessions/${id}`),
};

// ========== AI Sm@rtOP ==========
export const smartopApi = {
  ask: (data) => api.post('/smartop/ask', data),
  getSuggestions: (context) => api.post('/smartop/suggestions', { context }),
  getShortcuts: () => api.get('/smartop/shortcuts'),
};

export default api;
