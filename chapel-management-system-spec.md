# Pensa UENR Hub (PU-HUB) — System Specification

## 1. Overview

A single-chapel (non-multi-tenant) management system for a university church denomination, covering member management, attendance tracking, and financial record-keeping across five distinct roles.

**Scope note:** This is a single chapel/denomination instance — no multi-tenancy required.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI |
| Database | PostgreSQL |
| Frontend | React (Vite) |
| Auth | JWT with secure cookies |
| Background jobs (if needed later) | Celery + Redis |

**Rationale:** Reuses proven, battle-tested patterns from existing projects (GoQuali's RBAC/auth system, Attendr's QR attendance flow, DeptPay's ledger model), enabling faster development through direct code/pattern reuse rather than adopting a new stack.

---

## 3. Roles

1. **Super Admin** — top of hierarchy; can do everything the two Admin roles can, plus exclusive account/role management and delete permissions
2. **Admin (Current Students)** — manages current student members
3. **Admin (Alumni)** — manages alumni members
4. **Finance Secretary** — exclusive control over financial records (dues, offerings, tithes, expenses)
5. **IT Head** — system administration + can add members and record attendance across both student and alumni scopes

---

## 4. Core Modules

- Member Management (students + alumni)
- Attendance Recording
- Financial Records (dues, offerings, tithes, expenses)
- Audit Logging (Super Admin visibility only)

*Not included in current scope:* multi-tenancy, event/service scheduling, SMS/email communications, MoMo payment integration. These can be layered in later if needed.

---

## 5. Permission Matrix

| Action | Super Admin | Admin (Students) | Admin (Alumni) | Finance Secretary | IT Head |
|---|---|---|---|---|---|
| Create/manage Admin accounts | ✅ | ❌ | ❌ | ❌ | ❌ |
| Add/update student members | ✅ | ✅ | ❌ | ❌ | ✅ |
| Add/update alumni members | ✅ | ❌ | ✅ | ❌ | ✅ |
| Delete members | ✅ | ❌ | ❌ | ❌ | ❌ |
| Record/update attendance (students only) | ✅ | ✅ | N/A | ❌ | ✅ |
| Delete attendance records | ✅ | ❌ | N/A | ❌ | ❌ |
| View attendance reports | ✅ (all) | own scope | N/A | ❌ | ✅ |
| Create/update/delete financial records | ❌ | ❌ | ❌ | ✅ | ❌ |
| View financial reports | ✅ | ✅ | ✅ | ✅ | ❌ |
| Manage system config/accounts | ✅ | ❌ | ❌ | ❌ | ✅ |
| View audit logs | ✅ (only) | ❌ | ❌ | ❌ | ❌ |

### Key design principles
- **Delete is Super-Admin-exclusive** across members and attendance records — all other roles are create/update only.
- **Finance is Finance-Secretary-exclusive for CRUD** — Super Admin can view but not edit financial records. This separation of duties is good internal-control practice for handling church funds and worth highlighting if pitched to CASA leadership.
- **Financial transparency** — both Admin roles (Students, Alumni) can view financial reports, but cannot make any changes.
- **Audit logs are Super-Admin-only** — a pure oversight tool, not accessible even to IT Head.
- **IT Head is scoped to system + operational tasks** — full system config/account management, plus member-adding across both scopes, but no financial or audit-log access, and no delete permissions. It is deliberately *not* "Super Admin lite."
- **Attendance is student-only** — alumni don't hold regular church meetings, so attendance recording, updating, and reporting applies only to the student scope. Admin (Alumni) has no attendance-related permissions at all; IT Head's attendance access is likewise limited to students.

---

## 6. Database Schema

```python
class RoleEnum(str, Enum):
    super_admin = "super_admin"
    admin_student = "admin_student"
    admin_alumni = "admin_alumni"
    finance_secretary = "finance_secretary"
    it_head = "it_head"

class User(Base):
    id: UUID
    full_name: str
    email: str
    phone: str
    password_hash: str
    role: RoleEnum
    is_active: bool
    created_by: UUID | None  # FK to User, tracks who created this admin
    created_at: datetime

class MemberTypeEnum(str, Enum):
    student = "student"
    alumni = "alumni"

class Member(Base):
    id: UUID
    full_name: str
    member_type: MemberTypeEnum
    phone: str
    email: str | None
    program_of_study: str | None      # relevant for students
    graduation_year: int | None       # relevant for alumni
    occupation: str | None            # relevant for alumni
    date_joined: date
    is_active: bool
    added_by: UUID  # FK to User (Admin or IT Head who added them)

class AttendanceSession(Base):
    id: UUID
    date: date
    service_type: str  # e.g. "Sunday Service", "Bible Study"
    recorded_by: UUID  # FK to User
    created_at: datetime

class AttendanceRecord(Base):
    id: UUID
    session_id: UUID  # FK to AttendanceSession
    member_id: UUID   # FK to Member
    status: str  # present / absent / excused
    checked_in_at: datetime | None

class Transaction(Base):
    id: UUID
    member_id: UUID | None  # nullable for general church income/expense
    type: str  # tithe / offering / dues / expense
    amount: Decimal
    description: str | None
    recorded_by: UUID  # FK to User, expected to be Finance Secretary
    transaction_date: date
    created_at: datetime

class AuditLog(Base):
    id: UUID
    user_id: UUID
    action: str
    target_table: str | None
    target_id: UUID | None
    timestamp: datetime
```

### Schema notes
- `User.created_by` traces which admins were created by which Super Admin — useful for accountability.
- `Member.member_type` is the scoping field that determines whether Admin (Students) or Admin (Alumni) can touch a given record — enforced via route dependency, mirroring GoQuali's institutional scoping pattern.
- `AuditLog` matters especially because IT Head has broad operational access (member management across both scopes, attendance for students) — worth logging all member/attendance mutations at minimum, even though only Super Admin can view the log.
- `AttendanceRecord.member_id` should only ever reference members where `member_type == student` — enforce this at the application layer (or via a check constraint) since alumni don't hold regular meetings.

---

## 7. Suggested Build Order

1. Auth + RBAC middleware (adapt directly from GoQuali's existing implementation)
2. Member CRUD endpoints, scoped by `member_type`
3. Attendance session + check-in flow (can reuse Attendr's QR check-in UI/pattern)
4. Finance module — dues/tithes/offerings/expenses ledger (no MoMo integration for now)
5. Admin account creation flow, restricted to Super Admin
6. Audit logging across member, attendance, and account-management mutations
7. React dashboard views, one per role, reflecting the permission matrix above

---

## 8. Open Items / Future Considerations

- Event/service scheduling module (not in current scope)
- SMS/email communications to members (not in current scope)
- MoMo-based dues/offering payments (not in current scope)
- Multi-tenancy, if this ever expands beyond a single chapel
