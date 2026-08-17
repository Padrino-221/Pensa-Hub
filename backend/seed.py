"""
Database seeder for PU-HUB backend.

Default behaviour (run manually:  python seed.py):
  * Creates tables if missing.
  * Seeds the SUPER ADMIN account ONLY IF the users table is empty.
    (Other role accounts are created through the Users page, not the seeder.)
  * Inserts the site-content settings ONLY IF those sections do not yet exist,
    so admin edits made via the Settings page are never overwritten.

The site-content snapshot lives in app/data/site_defaults.json (generated from
frontend/src/data/siteDefaults.ts, the source of truth). Regenerate it with:

    cd frontend
    ./node_modules/.bin/tsc src/data/siteDefaults.ts --outDir ../backend/app/data/.gen \
        --module commonjs --target es2020 --skipLibCheck --ignoreConfig --ignoreDeprecations 6.0
    node -e "const m=require('../backend/app/data/.gen/siteDefaults.js');const fs=require('fs');\
fs.writeFileSync('../backend/app/data/site_defaults.json',JSON.stringify(m.siteDefaults,null,2)+'\\n')"
    rm -rf ../backend/app/data/.gen

Optional flags:
  --sync  : replace the site-content settings with the snapshot
            (useful during development; run manually:  python seed.py --sync)
"""

import argparse
import json
import os
import uuid
from pathlib import Path

from app.core.database import SessionLocal, engine, Base
from app.models import User, RoleEnum, SiteSetting
from app.core.security import hash_password

SITE_DEFAULTS_PATH = Path(__file__).parent / "app" / "data" / "site_defaults.json"

# The super admin account — created only when the users table is empty. Email and
# password are overridable via environment variables (SEED_SUPER_ADMIN_EMAIL /
# SEED_SUPER_ADMIN_PASSWORD), so production can avoid the default password.
DEFAULT_USERS = [
    {
        "full_name": "Super Admin",
        "email": os.getenv("SEED_SUPER_ADMIN_EMAIL", "admin@puhub.com"),
        "phone": "024 000 0001",
        "password": os.getenv("SEED_SUPER_ADMIN_PASSWORD", "admin123"),
        "role": RoleEnum.super_admin,
    },
]


def seed_users(db: SessionLocal) -> int:
    """Create the super admin account only if the users table is empty."""
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


def load_snapshot() -> dict | None:
    """Load the site-content snapshot shipped with the backend."""
    if not SITE_DEFAULTS_PATH.exists():
        return None
    with open(SITE_DEFAULTS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def seed_settings(db: SessionLocal, snapshot: dict | None = None, force: bool = False) -> int:
    """Insert site-content settings only if a section is missing (or --sync)."""
    if snapshot is None:
        # No snapshot available: the website renders from its own defaults
        # (frontend/src/data/siteDefaults.ts) until sections are saved via the
        # Site Builder.
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
        settings = seed_settings(db, load_snapshot(), force=args.sync)
        if settings:
            print(f"Seeded {settings} setting section(s)")
        else:
            print("No site-content snapshot found — settings will render from website defaults until saved via the Site Builder.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
