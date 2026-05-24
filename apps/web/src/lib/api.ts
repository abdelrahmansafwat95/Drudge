import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const res = await axios.post('/api/auth/refresh', { refreshToken });
          localStorage.setItem('accessToken', res.data.accessToken);
          localStorage.setItem('refreshToken', res.data.refreshToken);
          error.config.headers.Authorization = `Bearer ${res.data.accessToken}`;
          return api(error.config);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      } else {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;

export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
};

export const dashboardApi = {
  getKPIs: () => api.get('/dashboard/kpis'),
  getVisitsByStatus: () => api.get('/dashboard/visits-by-status'),
  getRecentVisits: () => api.get('/dashboard/recent-visits'),
};

export const clientsApi = {
  getAll: (params?: any) => api.get('/clients', { params }),
  getOne: (id: string) => api.get(`/clients/${id}`),
  getStats: () => api.get('/clients/stats'),
  create: (data: any) => api.post('/clients', data),
  update: (id: string, data: any) => api.put(`/clients/${id}`, data),
  toggleActive: (id: string) => api.patch(`/clients/${id}/toggle-active`),
  getVisitHistory: (id: string) => api.get(`/clients/${id}/visits`),
  addContract: (id: string, data: any) => api.post(`/clients/${id}/contracts`, data),
};

export const sitesApi = {
  getAll: (params?: any) => api.get('/sites', { params }),
  getOne: (id: string) => api.get(`/sites/${id}`),
  create: (data: any) => api.post('/sites', data),
  update: (id: string, data: any) => api.put(`/sites/${id}`, data),
  toggleActive: (id: string) => api.patch(`/sites/${id}/toggle-active`),
  getStats: (id: string) => api.get(`/sites/${id}/stats`),
  addZone: (siteId: string, data: any) => api.post(`/sites/${siteId}/zones`, data),
  updateZone: (zoneId: string, data: any) => api.put(`/sites/zones/${zoneId}`, data),
  deleteZone: (zoneId: string) => api.delete(`/sites/zones/${zoneId}`),
};

export const schedulingApi = {
  getVisits: (params?: any) => api.get('/scheduling/visits', { params }),
  getTodayVisits: () => api.get('/scheduling/visits/today'),
  getCalendar: (year: number, month: number) => api.get('/scheduling/visits/calendar', { params: { year, month } }),
  getDispatch: () => api.get('/scheduling/visits/dispatch'),
  getVisit: (id: string) => api.get(`/scheduling/visits/${id}`),
  createVisit: (data: any) => api.post('/scheduling/visits', data),
  updateVisit: (id: string, data: any) => api.put(`/scheduling/visits/${id}`, data),
  updateStatus: (id: string, status: string) => api.patch(`/scheduling/visits/${id}/status`, { status }),
  deleteVisit: (id: string) => api.delete(`/scheduling/visits/${id}`),
  toggleChecklistItem: (visitId: string, itemId: string) => api.patch(`/scheduling/visits/${visitId}/checklist/${itemId}`),
  addChecklistItem: (visitId: string, data: any) => api.post(`/scheduling/visits/${visitId}/checklist`, data),
  addFinding: (visitId: string, data: any) => api.post(`/scheduling/visits/${visitId}/findings`, data),
  logChemical: (visitId: string, data: any) => api.post(`/scheduling/visits/${visitId}/chemicals`, data),
  saveSignature: (visitId: string, data: any) => api.post(`/scheduling/visits/${visitId}/signature`, data),
  getSchedules: () => api.get('/scheduling/schedules'),
  createSchedule: (data: any) => api.post('/scheduling/schedules', data),
};

export const teamsApi = {
  getAll: () => api.get('/teams'),
  create: (data: any) => api.post('/teams', data),
  update: (id: string, data: any) => api.put(`/teams/${id}`, data),
  delete: (id: string) => api.delete(`/teams/${id}`),
  getPerformance: () => api.get('/teams/performance'),
  addMember: (teamId: string, userId: string) => api.post(`/teams/${teamId}/members/${userId}`),
  removeMember: (teamId: string, userId: string) => api.delete(`/teams/${teamId}/members/${userId}`),
  setLeader: (teamId: string, userId: string) => api.put(`/teams/${teamId}/leader/${userId}`),
};

export const usersApi = {
  getAll: (params?: any) => api.get('/users', { params }),
  getOne: (id: string) => api.get(`/users/${id}`),
  create: (data: any) => api.post('/users', data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  toggleActive: (id: string) => api.patch(`/users/${id}/toggle-active`),
};

export const chemicalsApi = {
  getAll: () => api.get('/chemicals'),
  create: (data: any) => api.post('/chemicals', data),
  update: (id: string, data: any) => api.put(`/chemicals/${id}`, data),
  toggleActive: (id: string) => api.patch(`/chemicals/${id}/toggle-active`),
};

export const reportsApi = {
  getAll: () => api.get('/reports'),
  getOne: (id: string) => api.get(`/reports/${id}`),
  generateVisit: (data: any) => api.post('/reports/visit', data),
  generateMonthly: (data: any) => api.post('/reports/monthly', data),
  delete: (id: string) => api.delete(`/reports/${id}`),
};

export const organizationsApi = {
  getMe: () => api.get('/organizations/me'),
  update: (data: any) => api.put('/organizations/me', data),
  getStats: () => api.get('/organizations/stats'),
};

export const branchesApi = {
  getAll: () => api.get('/branches'),
  create: (data: any) => api.post('/branches', data),
  update: (id: string, data: any) => api.put(`/branches/${id}`, data),
  delete: (id: string) => api.delete(`/branches/${id}`),
};

export const notificationsApi = {
  getAll: () => api.get('/notifications'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
};
