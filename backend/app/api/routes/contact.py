from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.core.database import get_db
from app.models import ContactMessage, RoleEnum, User
from app.schemas import ContactMessageCreate, ContactMessageOut

router = APIRouter(prefix="/contact", tags=["contact"])


@router.post("", response_model=ContactMessageOut, status_code=201)
def submit_message(
    payload: ContactMessageCreate,
    db: Session = Depends(get_db),
):
    """Public endpoint — anyone can send a message through the website form."""
    message = ContactMessage(
        name=payload.name.strip(),
        email=payload.email.strip(),
        subject=payload.subject.strip(),
        message=payload.message.strip(),
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message


@router.get("/messages", response_model=list[ContactMessageOut])
def list_messages(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(RoleEnum.super_admin, RoleEnum.it_head)),
):
    """Inbox for the IT Head / Super Admin (newest first)."""
    return (
        db.query(ContactMessage)
        .order_by(ContactMessage.created_at.desc())
        .all()
    )


@router.patch("/messages/{message_id}/read", response_model=ContactMessageOut)
def mark_read(
    message_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(RoleEnum.super_admin, RoleEnum.it_head)),
):
    message = db.get(ContactMessage, message_id)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    if not message.is_read:
        message.is_read = True
        db.commit()
        db.refresh(message)
    return message


@router.delete("/messages/{message_id}", status_code=204)
def delete_message(
    message_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(RoleEnum.super_admin, RoleEnum.it_head)),
):
    message = db.get(ContactMessage, message_id)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    db.delete(message)
    db.commit()
