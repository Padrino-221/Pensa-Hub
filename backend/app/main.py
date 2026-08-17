from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import attendance, audit, auth, contact, finance, members, settings as settings_routes, uploads, users
from app.core.config import settings
from app.core.database import Base, engine

app = FastAPI(title="Pensa UENR Hub (PU-HUB) API", version="0.1.0")

# Origins come from CORS_ORIGINS (comma-separated); default allows local dev.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(members.router, prefix="/api")
app.include_router(attendance.router, prefix="/api")
app.include_router(finance.router, prefix="/api")
app.include_router(audit.router, prefix="/api")
app.include_router(settings_routes.router, prefix="/api")
app.include_router(settings_routes.public_router, prefix="/api")
app.include_router(uploads.router, prefix="/api")
app.include_router(contact.router, prefix="/api")


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    _ensure_attendance_report_columns()
    _ensure_member_level_column()
    _ensure_audit_target_id_column()


# Idempotent column backfill for existing databases (no Alembic in this project).
_ATTENDANCE_REPORT_COLUMNS = {
    "title": "VARCHAR(200)",
    "total_attendance": "INTEGER",
    "total_males": "INTEGER",
    "total_females": "INTEGER",
    "speaker": "VARCHAR(200)",
    "topic": "VARCHAR(300)",
    "challenges": "VARCHAR(300)",
    "attitude_of_executives": "VARCHAR(50)",
    "remarks": "TEXT",
}


def _ensure_attendance_report_columns():
    from sqlalchemy import text

    with engine.begin() as conn:
        for column, ddl in _ATTENDANCE_REPORT_COLUMNS.items():
            conn.execute(
                text(
                    f"ALTER TABLE attendance_sessions ADD COLUMN IF NOT EXISTS {column} {ddl}"
                )
            )


def _ensure_audit_target_id_column():
    """Widen audit_logs.target_id from UUID to VARCHAR so it can hold
    non-UUID references (e.g. settings section names). Idempotent."""
    from sqlalchemy import text

    with engine.begin() as conn:
        conn.execute(
            text(
                "ALTER TABLE audit_logs ALTER COLUMN target_id TYPE VARCHAR(100) USING target_id::text"
            )
        )


def _ensure_member_level_column():
    """Add the student level column (100/200/300/400).

    Existing students default to level 100; alumni get NULL. Idempotent — safe
    to run on every startup, no Alembic in this project.
    """
    from sqlalchemy import text

    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE members ADD COLUMN IF NOT EXISTS level INTEGER"))
        # Backfill only rows that still have no level.
        conn.execute(
            text("UPDATE members SET level = 100 WHERE member_type = 'student' AND level IS NULL")
        )
        conn.execute(
            text("UPDATE members SET level = NULL WHERE member_type = 'alumni' AND level IS NOT NULL")
        )


@app.get("/health")
def health():
    return {"status": "ok"}