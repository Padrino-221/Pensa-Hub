import type {
  User, Member, AttendanceSession,
  Transaction, AuditLog, FinancialSummary, Role, MemberType,
  TransactionType, SettingsSection, ContactMessage,
} from '../types';

// In dev, Vite proxies /api to the local backend. In production, set
// VITE_API_URL to the deployed backend origin (e.g. https://api.puhub.app).
const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '/api';

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const isForm = options.body instanceof FormData;
  const res = await fetch(`${BASE}${url}`, {
    credentials: 'include',
    headers: isForm
      ? { ...options.headers as Record<string, string> }
      : { 'Content-Type': 'application/json', ...options.headers as Record<string, string> },
    ...options,
  });
  if (res.status === 204) return null as T;
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(body.detail || 'Request failed');
  }
  return res.json();
}

// Auth
export const auth = {
  login: (email: string, password: string) =>
    request<User>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => request<void>('/auth/logout', { method: 'POST' }),
  me: () => request<User>('/auth/me'),
};

// Users
export const users = {
  list: () => request<User[]>('/users'),
  create: (data: { full_name: string; email: string; phone: string; password: string; role: Role }) =>
    request<User>('/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Pick<User, 'full_name' | 'phone' | 'email' | 'role' | 'is_active'>> & { password?: string }) =>
    request<User>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove: (id: string) => request<void>(`/users/${id}`, { method: 'DELETE' }),
};

// Members
export const members = {
  list: (memberType?: MemberType) =>
    request<Member[]>(`/members${memberType ? `?member_type=${memberType}` : ''}`),
  get: (id: string) => request<Member>(`/members/${id}`),
  create: (data: Partial<Member> & { full_name: string; member_type: MemberType; phone: string; date_joined: string }) =>
    request<Member>('/members', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Member>) =>
    request<Member>(`/members/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove: (id: string) => request<void>(`/members/${id}`, { method: 'DELETE' }),
  promote: () => request<{ promoted: number; graduated: number }>('/members/promote', { method: 'POST' }),
  importTemplate: () => `${BASE}/members/import/template`,
  importCsv: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return request<{ imported: number; errors: { row: number; error: string }[] }>('/members/import', {
      method: 'POST',
      body: form,
    });
  },
};

// Attendance
export const attendance = {
  listSessions: () => request<AttendanceSession[]>('/attendance/sessions'),
  createSession: (data: { date: string; service_type: string; title?: string | null }) =>
    request<AttendanceSession>('/attendance/sessions', { method: 'POST', body: JSON.stringify(data) }),
  getSession: (sessionId: string) =>
    request<AttendanceSession>(`/attendance/sessions/${sessionId}`),
  updateSession: (
    sessionId: string,
    data: Partial<Pick<AttendanceSession, 'title' | 'total_attendance' | 'total_males' | 'total_females' | 'speaker' | 'topic' | 'challenges' | 'attitude_of_executives' | 'remarks'>>,
  ) =>
    request<AttendanceSession>(`/attendance/sessions/${sessionId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  removeSession: (sessionId: string) =>
    request<void>(`/attendance/sessions/${sessionId}`, { method: 'DELETE' }),
};

// Finance
export const finance = {
  listTransactions: (type?: TransactionType, memberId?: string) => {
    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (memberId) params.set('member_id', memberId);
    const q = params.toString();
    return request<Transaction[]>(`/finance/transactions${q ? `?${q}` : ''}`);
  },
  getTransaction: (id: string) => request<Transaction>(`/finance/transactions/${id}`),
  createTransaction: (data: { type: TransactionType; amount: number; description?: string | null; transaction_date: string; member_id?: string | null }) =>
    request<Transaction>('/finance/transactions', { method: 'POST', body: JSON.stringify(data) }),
  updateTransaction: (id: string, data: { type?: TransactionType; amount?: number; description?: string | null; transaction_date?: string; member_id?: string | null }) =>
    request<Transaction>(`/finance/transactions/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  removeTransaction: (id: string) =>
    request<void>(`/finance/transactions/${id}`, { method: 'DELETE' }),
  summary: () => request<FinancialSummary>('/finance/reports/summary'),
};

// Audit
export const audit = {
  list: (limit = 100) => request<AuditLog[]>(`/audit/logs?limit=${limit}`),
};

// Settings
export const settings = {
  list: () => request<SettingsSection[]>('/settings'),
  get: (section: string) => request<SettingsSection>('/settings/' + section),
  upsert: (section: string, data: { value: string }) => request<SettingsSection>('/settings/' + section, { method: 'PUT', body: JSON.stringify(data) }),
}

// Contact messages
export const contact = {
  send: (data: { name: string; email: string; subject: string; message: string }) =>
    request<ContactMessage>('/contact', { method: 'POST', body: JSON.stringify(data) }),
  list: () => request<ContactMessage[]>('/contact/messages'),
  markRead: (id: string) => request<ContactMessage>(`/contact/messages/${id}/read`, { method: 'PATCH' }),
  remove: (id: string) => request<void>(`/contact/messages/${id}`, { method: 'DELETE' }),
}