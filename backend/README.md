# Pensa UENR Hub (PU-HUB) — Backend

FastAPI backend for the PU-HUB chapel management system.

## Setup

```powershell
# 1. Create a database (PostgreSQL 17 running)
#    CREATE DATABASE puhub;

# 2. Install dependencies
cd backend
python -m venv .venv
.\.venv\Scripts\pip install -r requirements.txt
.\.venv\Scripts\pip install email-validator

# 3. Configure DB URL in app/core/config.py (or a .env file with DATABASE_URL)

# 4. Seed demo accounts (one per role — see CREDENTIALS.md at the project root)
.\.venv\Scripts\python seed.py
#    -> admin@puhub.com / admin123  (Super Admin)
#    -> student.admin@puhub.com / student123  (Admin Students)

# 5. Run the server
.\.venv\Scripts\python -m uvicorn app.main:app --port 8000
```

API docs: http://localhost:8000/docs

## Roles

| Role | Description |
|---|---|
| `super_admin` | Full access incl. account management, deletes, audit logs |
| `admin_student` | Manage current student members + student attendance |
| `admin_alumni` | Manage alumni members |
| `finance_secretary` | Exclusive CRUD on financial records |
| `it_head` | System/account admin + add members (both scopes) + student attendance |

## Auth

JWT stored in an HttpOnly cookie (`puhub_token`). Log in via `POST /auth/login`.
Requests can also send the token via `Authorization: Bearer <token>`.
