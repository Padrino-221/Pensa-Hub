import type { MemberType, Role } from '../types';

/** Which member scopes a role can manage (per permission matrix). */
export function memberScopes(role: Role): MemberType[] {
  if (role === 'admin_student') return ['student'];
  if (role === 'admin_alumni') return ['alumni'];
  if (role === 'finance_secretary') return [];
  return ['student', 'alumni'];
}

/** Roles that can create/update members within their scope. */
export const canManageMembers = (role: Role) => role !== 'finance_secretary';

/** Delete is Super-Admin-exclusive. */
export const canDelete = (role: Role) => role === 'super_admin';

/** Attendance is student-only; roles per matrix. */
export const canViewAttendance = (role: Role) =>
  role === 'super_admin' || role === 'admin_student' || role === 'it_head';

/** Finance is viewable by all except IT Head. */
export const canViewFinance = (role: Role) =>
  role === 'super_admin' || role === 'admin_student' || role === 'admin_alumni' || role === 'finance_secretary';

/** Finance CRUD is Finance-Secretary-exclusive. */
export const canManageFinance = (role: Role) => role === 'finance_secretary';

/** Users list is visible to Super Admin + IT Head. */
export const canViewUsers = (role: Role) => role === 'super_admin' || role === 'it_head';

/** Account creation/deletion is Super-Admin-exclusive. */
export const canManageUsers = (role: Role) => role === 'super_admin';

/** Settings management: IT Head and Super Admin */
export const canManageSettings = (role: Role) => role === 'it_head' || role === 'super_admin';

/** Contact inbox: IT Head and Super Admin */
export const canViewMessages = (role: Role) => role === 'it_head' || role === 'super_admin';

/** Audit logs are Super-Admin-only. */
export const canViewAudit = (role: Role) => role === 'super_admin';
