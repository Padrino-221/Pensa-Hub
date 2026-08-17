from sqlalchemy.orm import Session

from app.models import AuditLog


def log(db: Session, user_id: str, action: str, target_table: str | None = None, target_id: str | None = None):
    entry = AuditLog(
        user_id=user_id,
        action=action,
        target_table=target_table,
        target_id=target_id,
    )
    db.add(entry)