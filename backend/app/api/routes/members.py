import csv
import io
from datetime import date

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import EmailStr

from app.api.deps import require_roles
from app.core.database import get_db
from app.models import Member, MemberTypeEnum, RoleEnum, User
from app.schemas import MemberCreate, MemberOut, MemberUpdate
from app.services import audit

router = APIRouter(prefix="/members", tags=["members"])

# Who can touch which member_type (per permission matrix)
ALLOWED_ROLES_BY_TYPE = {
    MemberTypeEnum.student: {RoleEnum.super_admin, RoleEnum.admin_student, RoleEnum.it_head},
    MemberTypeEnum.alumni: {RoleEnum.super_admin, RoleEnum.admin_alumni, RoleEnum.it_head},
}

DELETE_ROLES = {RoleEnum.super_admin}


def _check_member_type_access(user: User, member_type: MemberTypeEnum):
    if user.role not in ALLOWED_ROLES_BY_TYPE[member_type]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")


@router.post("", response_model=MemberOut, status_code=status.HTTP_201_CREATED)
def create_member(
    payload: MemberCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*RoleEnum)),
):
    _check_member_type_access(current_user, payload.member_type)

    member = Member(
        full_name=payload.full_name,
        member_type=payload.member_type,
        phone=payload.phone,
        email=payload.email,
        program_of_study=payload.program_of_study if payload.member_type == MemberTypeEnum.student else None,
        level=payload.level if payload.member_type == MemberTypeEnum.student else None,
        graduation_year=payload.graduation_year if payload.member_type == MemberTypeEnum.alumni else None,
        occupation=payload.occupation if payload.member_type == MemberTypeEnum.alumni else None,
        date_joined=payload.date_joined,
        added_by=current_user.id,
    )
    db.add(member)
    audit.log(db, current_user.id, "member.created", "members", member.id)
    db.commit()
    db.refresh(member)
    return member


@router.get("", response_model=list[MemberOut])
def list_members(
    member_type: MemberTypeEnum | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*RoleEnum)),
):
    q = db.query(Member)
    if member_type:
        _check_member_type_access(current_user, member_type)
        q = q.filter(Member.member_type == member_type)
    else:
        if current_user.role in (RoleEnum.admin_student, RoleEnum.admin_alumni):
            scope = (
                MemberTypeEnum.student
                if current_user.role == RoleEnum.admin_student
                else MemberTypeEnum.alumni
            )
            q = q.filter(Member.member_type == scope)
    return q.all()


@router.get("/{member_id}", response_model=MemberOut)
def get_member(
    member_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*RoleEnum)),
):
    member = db.get(Member, member_id)
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")
    _check_member_type_access(current_user, member.member_type)
    return member


@router.patch("/{member_id}", response_model=MemberOut)
def update_member(
    member_id: str,
    payload: MemberUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*RoleEnum)),
):
    member = db.get(Member, member_id)
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")
    _check_member_type_access(current_user, member.member_type)

    data = payload.model_dump(exclude_unset=True)
    # Level only applies to students; alumni never carry a level.
    if member.member_type == MemberTypeEnum.student and "level" in data:
        member.level = data.pop("level")
    else:
        data.pop("level", None)
    for field, value in data.items():
        setattr(member, field, value)
    audit.log(db, current_user.id, "member.updated", "members", member.id)
    db.commit()
    db.refresh(member)
    return member


@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_member(
    member_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(RoleEnum.super_admin)),
):
    member = db.get(Member, member_id)
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")
    db.delete(member)
    audit.log(db, current_user.id, "member.deleted", "members", member.id)
    db.commit()


IMPORT_HEADERS = [
    "full_name",
    "phone",
    "email",
    "member_type",
    "program_of_study",
    "level",
    "graduation_year",
    "occupation",
    "date_joined",
]


def _parse_import_row(raw: dict, existing_emails: set[str]) -> tuple[Member | None, str | None]:
    """Validate one CSV row. Returns (member, error); exactly one is set."""
    full_name = (raw.get("full_name") or "").strip()
    phone = (raw.get("phone") or "").strip()
    email = (raw.get("email") or "").strip() or None
    member_type_raw = (raw.get("member_type") or "student").strip().lower()

    if not full_name:
        return None, "full_name is required"
    if not phone:
        return None, "phone is required"
    try:
        member_type = MemberTypeEnum(member_type_raw)
    except ValueError:
        return None, f"member_type must be 'student' or 'alumni', got '{member_type_raw}'"
    if email:
        try:
            EmailStr._validate(email)
        except Exception:
            return None, f"invalid email '{email}'"
        email = email.lower()
        if email in existing_emails:
            return None, f"duplicate email '{email}'"
        existing_emails.add(email)

    date_joined = date.today()
    dj_raw = (raw.get("date_joined") or "").strip()
    if dj_raw:
        try:
            date_joined = date.fromisoformat(dj_raw)
        except ValueError:
            return None, f"date_joined must be YYYY-MM-DD, got '{dj_raw}'"

    program_of_study = (raw.get("program_of_study") or "").strip() or None
    occupation = (raw.get("occupation") or "").strip() or None
    graduation_year = None
    gy_raw = (raw.get("graduation_year") or "").strip()
    if gy_raw:
        try:
            graduation_year = int(gy_raw)
        except ValueError:
            return None, f"graduation_year must be a number, got '{gy_raw}'"

    level = None
    level_raw = (raw.get("level") or "").strip()
    if level_raw:
        try:
            level = int(level_raw)
        except ValueError:
            return None, f"level must be a number, got '{level_raw}'"
        if level < 100 or level > 400:
            return None, f"level must be between 100 and 400, got '{level_raw}'"

    member = Member(
        full_name=full_name,
        phone=phone,
        email=email,
        member_type=member_type,
        program_of_study=program_of_study if member_type == MemberTypeEnum.student else None,
        level=level if member_type == MemberTypeEnum.student else None,
        graduation_year=graduation_year if member_type == MemberTypeEnum.alumni else None,
        occupation=occupation if member_type == MemberTypeEnum.alumni else None,
        date_joined=date_joined,
    )
    return member, None


@router.get("/import/template")
def import_template():
    """Download a CSV template for bulk-importing members."""
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(IMPORT_HEADERS)
    writer.writerow(["Kwame Mensah", "024 000 0000", "kwame@example.com", "student", "Renewable Energy Engineering", "200", "", "", "2024-09-01"])
    writer.writerow(["Ama Serwaa", "055 111 2222", "", "alumni", "", "", "2022", "Software Engineer", "2022-06-15"])
    return StreamingResponse(
        io.BytesIO(buffer.getvalue().encode("utf-8-sig")),
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="members_import_template.csv"'},
    )


@router.post("/import")
def import_members(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*RoleEnum)),
):
    """Bulk-import members from a CSV file.

    Returns a summary of imported rows plus per-row errors (no partial-commit
    surprises: valid rows are inserted, invalid rows are reported).
    """
    contents = file.file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Empty file")
    try:
        text = contents.decode("utf-8-sig")
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="File must be UTF-8 encoded CSV")

    reader = csv.DictReader(io.StringIO(text))
    if not reader.fieldnames:
        raise HTTPException(status_code=400, detail="CSV must have a header row")

    existing_emails = {
        (e or "").lower()
        for (e,) in db.query(Member.email).filter(Member.email.isnot(None)).all()
    }

    imported: list[Member] = []
    errors: list[dict] = []
    for index, raw in enumerate(reader, start=2):  # 1-based, header is row 1
        row = {k.strip(): (v or "") for k, v in raw.items()}
        member, error = _parse_import_row(row, existing_emails)
        if error:
            errors.append({"row": index, "error": error})
            continue
        _check_member_type_access(current_user, member.member_type)
        member.added_by = current_user.id
        db.add(member)
        imported.append(member)
        audit.log(db, current_user.id, "member.created", "members", member.id)

    db.commit()
    return {
        "imported": len(imported),
        "errors": errors,
    }


@router.post("/promote")
def promote_students(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(RoleEnum.super_admin, RoleEnum.it_head)),
):
    """Promote every active student one level up.

    Level 100 → 200 → 300 → 400. Students at level 400 (or beyond) are
    graduated to alumni status. Returns a summary of what changed.

    Locks the matching rows (SELECT ... FOR UPDATE) so two concurrent requests
    cannot double-promote the same students.
    """
    students = (
        db.query(Member)
        .filter(Member.member_type == MemberTypeEnum.student, Member.is_active.is_(True))
        .with_for_update()
        .all()
    )

    moved_up = 0
    graduated = 0
    current_year = date.today().year
    for student in students:
        level = student.level or 100  # treat missing level as freshmen
        if level >= 400:
            student.member_type = MemberTypeEnum.alumni
            student.level = None
            if not student.graduation_year:
                student.graduation_year = current_year
            graduated += 1
        else:
            student.level = min(level + 100, 400)
            moved_up += 1
        audit.log(db, current_user.id, "member.promoted", "members", student.id)

    db.commit()
    return {
        "promoted": moved_up,
        "graduated": graduated,
    }