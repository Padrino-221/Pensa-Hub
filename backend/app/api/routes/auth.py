import time
from collections import defaultdict
from threading import Lock

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_access_token, hash_password, verify_password
from app.models import User

# Dummy hash used to equalize login timing when the email doesn't exist, so
# response time cannot be used to enumerate valid accounts.
_DUMMY_HASH = hash_password("dummy-password-for-timing")
from app.schemas import LoginRequest, UserOut
from app.services import audit

router = APIRouter(prefix="/auth", tags=["auth"])

# ---- Brute-force protection (in-memory, per email+IP sliding window) ----
MAX_FAILED_ATTEMPTS = 5
RATE_LIMIT_WINDOW_SECONDS = 15 * 60  # 15 minutes
_attempts: dict[tuple[str, str], list[float]] = defaultdict(list)
_attempts_lock = Lock()


def _key(email: str, ip: str) -> tuple[str, str]:
    return email.strip().lower(), ip


def _record_failure(email: str, ip: str) -> None:
    with _attempts_lock:
        _attempts[_key(email, ip)].append(time.time())


def _check_rate_limit(email: str, ip: str) -> None:
    now = time.time()
    with _attempts_lock:
        recent = [t for t in _attempts[_key(email, ip)] if now - t < RATE_LIMIT_WINDOW_SECONDS]
        _attempts[_key(email, ip)] = recent
        blocked = len(recent) >= MAX_FAILED_ATTEMPTS
    if blocked:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed attempts. Try again in 15 minutes.",
        )


def _clear_failures(email: str, ip: str) -> None:
    with _attempts_lock:
        _attempts.pop(_key(email, ip), None)


@router.post("/login", response_model=UserOut)
def login(payload: LoginRequest, request: Request, response: Response, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    ip = request.client.host if request.client else "unknown"

    _check_rate_limit(email, ip)

    user = db.query(User).filter(User.email == email).first()
    if user is not None:
        valid = verify_password(payload.password, user.password_hash)
    else:
        # Run a dummy verification so the response time matches a real check.
        verify_password(payload.password, _DUMMY_HASH)
        valid = False
    if not valid:
        _record_failure(email, ip)
        # Same message whether the email exists or not — no account enumeration.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")

    _clear_failures(email, ip)
    token = create_access_token(user.id, user.role.value)
    response.set_cookie(
        key=settings.COOKIE_NAME,
        value=token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
    )
    audit.log(db, user.id, "auth.login", "auth", user.id)
    db.commit()
    return user


@router.post("/logout")
def logout(response: Response, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    audit.log(db, current_user.id, "auth.logout", "auth", current_user.id)
    db.commit()
    response.delete_cookie(settings.COOKIE_NAME)
    return {"detail": "Logged out"}


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user
