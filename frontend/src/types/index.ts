export type Role =
  | 'super_admin'
  | 'admin_student'
  | 'admin_alumni'
  | 'finance_secretary'
  | 'it_head';

export type MemberType = 'student' | 'alumni';
export type TransactionType = 'tithe' | 'offering' | 'dues' | 'expense';

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: Role;
  is_active: boolean;
  created_by: string | null;
}

export interface Member {
  id: string;
  full_name: string;
  member_type: MemberType;
  phone: string;
  email: string | null;
  program_of_study: string | null;
  level: number | null;
  graduation_year: number | null;
  occupation: string | null;
  date_joined: string;
  is_active: boolean;
  added_by: string;
}

export interface AttendanceSession {
  id: string;
  date: string;
  service_type: string;
  title: string | null;
  total_attendance: number | null;
  total_males: number | null;
  total_females: number | null;
  speaker: string | null;
  topic: string | null;
  challenges: string | null;
  attitude_of_executives: string | null;
  remarks: string | null;
  recorded_by: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  member_id: string | null;
  type: TransactionType;
  amount: string;
  description: string | null;
  recorded_by: string;
  transaction_date: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  target_table: string | null;
  target_id: string | null;
  timestamp: string;
}

export interface FinancialSummary {
  total_income: number;
  total_expenses: number;
  balance: number;
  by_type: Record<TransactionType, string>;
}

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: 'Super Admin',
  admin_student: 'Admin (Students)',
  admin_alumni: 'Admin (Alumni)',
  finance_secretary: 'Finance Secretary',
  it_head: 'IT Head',
};

export const ROLE_COLORS: Record<Role, string> = {
  super_admin: 'bg-ink text-white',
  admin_student: 'bg-royal text-white',
  admin_alumni: 'bg-royal-400 text-white',
  finance_secretary: 'bg-accent text-ink',
  it_head: 'bg-success text-white',
}

export interface SettingsSection {
  id: string
  section: string
  value: string
  updated_by: string | null
  updated_at: string
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}