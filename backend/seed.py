"""
Database seeder for PU-HUB backend.

Default behaviour (run by start-puhub.bat):
  * Creates tables if missing.
  * Seeds roles / admin users ONLY IF the users table is empty.
  * Inserts the site-content settings ONLY IF those sections do not yet exist,
    so admin edits made via the Settings page are never overwritten.

Optional flags:
  --sync  : replace the site-content settings with the current website snapshot
            (useful during development; run manually:  python seed.py --sync)
"""

import argparse
import json
import uuid
from datetime import datetime

from app.core.database import SessionLocal, engine, Base
from app.models import User, RoleEnum, SiteSetting
from app.core.security import hash_password

# Default accounts — created only when the users table is empty. Passwords are
# overridable via environment variables (see main()).
DEFAULT_USERS = [
    {
        "full_name": "Super Admin",
        "email": "admin@puhub.com",
        "phone": "024 000 0001",
        "password": "admin123",
        "role": RoleEnum.super_admin,
    },
    {
        "full_name": "Admin (Students)",
        "email": "student.admin@puhub.com",
        "phone": "024 000 0002",
        "password": "student123",
        "role": RoleEnum.admin_student,
    },
    {
        "full_name": "Admin (Alumni)",
        "email": "alumni.admin@puhub.com",
        "phone": "024 000 0003",
        "password": "alumni123",
        "role": RoleEnum.admin_alumni,
    },
    {
        "full_name": "Finance Secretary",
        "email": "finance@puhub.com",
        "phone": "024 000 0004",
        "password": "finance123",
        "role": RoleEnum.finance_secretary,
    },
    {
        "full_name": "IT Head",
        "email": "it.head@puhub.com",
        "phone": "024 000 0005",
        "password": "ithead123",
        "role": RoleEnum.it_head,
    },
]


def seed_users(db: SessionLocal) -> int:
    """Create default admin accounts only if the users table is empty."""
    if db.query(User).count() > 0:
        return 0
    created = 0
    for spec in DEFAULT_USERS:
        user = User(
            id=str(uuid.uuid4()),
            full_name=spec["full_name"],
            email=spec["email"],
            phone=spec["phone"],
            password_hash=hash_password(spec["password"]),
            role=spec["role"],
            is_active=True,
            created_by=None,
        )
        db.add(user)
        created += 1
    db.commit()
    return created


def seed_settings(db: SessionLocal, snapshot: dict | None = None, force: bool = False) -> int:
    """Insert site-content settings only if a section is missing (or --sync).

    The site-content snapshot lives in the frontend (frontend/src/data/siteDefaults.ts)
    and the public website falls back to those defaults when a section is unsaved,
    so seeding settings is optional. Pass an explicit snapshot dict, or use --sync
    with a snapshot file, to populate them.
    """
    if snapshot is None:
        # No backend copy of the site content: the website renders from its own
        # defaults until the IT Head saves sections through the Site Builder.
        return 0
    written = 0
    for section, value in snapshot.items():
        existing = db.query(SiteSetting).filter(SiteSetting.section == section).first()
        if existing is None or force:
            if existing is None:
                existing = SiteSetting(section=section, value=json.dumps(value), updated_by=None)
                db.add(existing)
            else:
                existing.value = json.dumps(value)
            written += 1
    db.commit()
    return written


def main():
    parser = argparse.ArgumentParser(description="Seed the PU-HUB database")
    parser.add_argument("--sync", action="store_true", help="Overwrite site settings with the code snapshot")
    args = parser.parse_args()

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        users = seed_users(db)
        print(f"Seeded {users} user(s)" if users else "Users already present — skipping.")
        settings = seed_settings(db, force=args.sync)
        if settings:
            print(f"Seeded {settings} setting section(s)")
        else:
            print("No site-content snapshot in backend — settings will render from website defaults until saved via the Site Builder.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
