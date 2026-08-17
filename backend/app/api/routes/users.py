from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.core.database import get_db
from app.core.security import hash_password
from app.models import AuditLog, RoleEnum, User
from app.schemas import UserCreate, UserOut, UserUpdate
from app.services import audit

router = APIRouter(prefix="/users", tags=["users"])


@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(RoleEnum.super_admin)),
):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        password_hash=hash_password(payload.password),
        role=payload.role,
        created_by=current_user.id,
    )
    db.add(user)
    audit.log(db, current_user.id, "user.created", "users", user.id)
    db.commit()
    db.refresh(user)
    return user


@router.get("", response_model=list[UserOut])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(RoleEnum.super_admin, RoleEnum.it_head)),
):
    return db.query(User).all()


@router.patch("/{user_id}", response_model=UserOut)
def update_user(
    user_id: str,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(RoleEnum.super_admin)),
):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    data = payload.model_dump(exclude_unset=True)

    # A super admin cannot lock themselves out.
    if user.id == current_user.id:
        if data.get("is_active") is False:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot deactivate your own account",
            )
        if "role" in data and data["role"] != RoleEnum.super_admin:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot change your own role",
            )

    if "email" in data and data["email"] and data["email"] != user.email:
        if db.query(User).filter(User.email == data["email"]).first():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    if "password" in data:
        new_password = data.pop("password")
        if new_password:
            user.password_hash = hash_password(new_password)

    for field, value in data.items():
        setattr(user, field, value)
    audit.log(db, current_user.id, "user.updated", "users", user.id)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(RoleEnum.super_admin)),
):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete your own account")
    db.delete(user)
    audit.log(db, current_user.id, "user.deleted", "users", user.id)
    db.commit()