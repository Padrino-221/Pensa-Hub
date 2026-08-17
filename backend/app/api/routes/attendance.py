from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.core.database import get_db
from app.models import (
    AttendanceRecord,
    AttendanceSession,
    Member,
    MemberTypeEnum,
    RoleEnum,
    User,
)
from app.schemas import (
    AttendanceRecordCreate,
    AttendanceRecordOut,
    AttendanceRecordUpdate,
    AttendanceSessionCreate,
    AttendanceSessionOut,
    AttendanceSessionUpdate,
)
from app.services import audit

router = APIRouter(prefix="/attendance", tags=["attendance"])

# Per matrix: Super Admin, Admin (Students), IT Head record/update attendance (students only)
ATTENDANCE_ROLES = {RoleEnum.super_admin, RoleEnum.admin_student, RoleEnum.it_head}
DELETE_ROLES = {RoleEnum.super_admin}


@router.post("/sessions", response_model=AttendanceSessionOut, status_code=status.HTTP_201_CREATED)
def create_session(
    payload: AttendanceSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*ATTENDANCE_ROLES)),
):
    session = AttendanceSession(
        date=payload.date,
        service_type=payload.service_type,
        recorded_by=current_user.id,
    )
    db.add(session)
    audit.log(db, current_user.id, "attendance.session_created", "attendance_sessions", session.id)
    db.commit()
    db.refresh(session)
    return session


@router.post("/sessions/{session_id}/records", response_model=AttendanceRecordOut, status_code=status.HTTP_201_CREATED)
def create_record(
    session_id: str,
    payload: AttendanceRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*ATTENDANCE_ROLES)),
):
    session = db.get(AttendanceSession, session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    member = db.get(Member, payload.member_id)
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")
    if member.member_type != MemberTypeEnum.student:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Attendance only applies to student members",
        )

    existing = (
        db.query(AttendanceRecord)
        .filter(AttendanceRecord.session_id == session_id, AttendanceRecord.member_id == payload.member_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Member already recorded for this session")

    record = AttendanceRecord(
        session_id=session_id,
        member_id=payload.member_id,
        status=payload.status,
        checked_in_at=datetime.now(timezone.utc),
    )
    db.add(record)
    audit.log(db, current_user.id, "attendance.record_created", "attendance_records", record.id)
    db.commit()
    db.refresh(record)
    return record


@router.get("/sessions", response_model=list[AttendanceSessionOut])
def list_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*ATTENDANCE_ROLES)),
):
    return db.query(AttendanceSession).order_by(AttendanceSession.date.desc()).all()


@router.get("/sessions/{session_id}", response_model=AttendanceSessionOut)
def get_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*ATTENDANCE_ROLES)),
):
    session = db.get(AttendanceSession, session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return session


@router.patch("/sessions/{session_id}", response_model=AttendanceSessionOut)
def update_session_report(
    session_id: str,
    payload: AttendanceSessionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*ATTENDANCE_ROLES)),
):
    session = db.get(AttendanceSession, session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    counts = payload.model_dump(exclude_unset=True)
    total = counts.get("total_attendance")
    males = counts.get("total_males")
    females = counts.get("total_females")
    if (
        total is not None
        and males is not None
        and females is not None
        and males + females > total
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Male + female count cannot exceed total attendance",
        )

    for field, value in counts.items():
        setattr(session, field, value)
    audit.log(db, current_user.id, "attendance.session_updated", "attendance_sessions", session.id)
    db.commit()
    db.refresh(session)
    return session


@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(RoleEnum.super_admin)),
):
    session = db.get(AttendanceSession, session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    db.delete(session)
    audit.log(db, current_user.id, "attendance.session_deleted", "attendance_sessions", session.id)
    db.commit()


@router.patch("/records/{record_id}", response_model=AttendanceRecordOut)
def update_record(
    record_id: str,
    payload: AttendanceRecordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*ATTENDANCE_ROLES)),
):
    record = db.get(AttendanceRecord, record_id)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found")
    record.status = payload.status
    audit.log(db, current_user.id, "attendance.record_updated", "attendance_records", record.id)
    db.commit()
    db.refresh(record)
    return record


@router.delete("/records/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_record(
    record_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(RoleEnum.super_admin)),
):
    record = db.get(AttendanceRecord, record_id)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found")
    db.delete(record)
    audit.log(db, current_user.id, "attendance.record_deleted", "attendance_records", record.id)
    db.commit()