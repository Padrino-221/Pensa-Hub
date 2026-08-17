# PU-HUB — Demo Credentials

Seeded automatically by `backend\seed.py` (the `start-puhub.bat` launcher runs it for you).
The seed is idempotent — re-running it never duplicates or overwrites accounts.

| Role | Email | Password |
|---|---|---|
| Super Admin | `admin@puhub.com` | `admin123` |
| Admin (Students) | `student.admin@puhub.com` | `student123` |
| Admin (Alumni) | `alumni.admin@puhub.com` | `alumni123` |
| Finance Secretary | `finance@puhub.com` | `finance123` |
| IT Head | `it.head@puhub.com` | `ithead123` |

## What each role can do (quick guide)

- **Super Admin** — everything: members (both scopes), attendance, finance (view), user management, audit logs, and all deletes.
- **Admin (Students)** — manage student members and student attendance; view finance.
- **Admin (Alumni)** — manage alumni members; view finance.
- **Finance Secretary** — exclusive create/update/delete on financial records; view-only everything else.
- **IT Head** — add members in both scopes, record student attendance, and view the accounts list (no user management, no finance).

## Quick start

1. Double-click `start-puhub.bat` — it starts PostgreSQL (best effort), seeds the database, and opens the backend (`:8000`) and frontend (`:5173`).
2. Open http://localhost:5173 and sign in with any account above.
