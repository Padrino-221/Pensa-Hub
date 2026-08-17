import enum
import uuid
from datetime import datetime, date
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class RoleEnum(str, enum.Enum):
    super_admin = "super_admin"
    admin_student = "admin_student"
    admin_alumni = "admin_alumni"
    finance_secretary = "finance_secretary"
    it_head = "it_head"


class MemberTypeEnum(str, enum.Enum):
    student = "student"
    alumni = "alumni"


class AttendanceStatusEnum(str, enum.Enum):
    present = "present"
    absent = "absent"
    excused = "excused"


class TransactionTypeEnum(str, enum.Enum):
    tithe = "tithe"
    offering = "offering"
    dues = "dues"
    expense = "expense"


def _uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    full_name: Mapped[str] = mapped_column(String(200))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    phone: Mapped[str] = mapped_column(String(50))
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[RoleEnum] = mapped_column(Enum(RoleEnum, name="role_enum"))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_by: Mapped[str | None] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.id"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Member(Base):
    __tablename__ = "members"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    full_name: Mapped[str] = mapped_column(String(200))
    member_type: Mapped[MemberTypeEnum] = mapped_column(Enum(MemberTypeEnum, name="member_type_enum"))
    phone: Mapped[str] = mapped_column(String(50))
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    program_of_study: Mapped[str | None] = mapped_column(String(200), nullable=True)
    level: Mapped[int | None] = mapped_column(nullable=True)
    graduation_year: Mapped[int | None] = mapped_column(nullable=True)
    occupation: Mapped[str | None] = mapped_column(String(200), nullable=True)
    date_joined: Mapped[date] = mapped_column(Date)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    added_by: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class AttendanceSession(Base):
    __tablename__ = "attendance_sessions"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    date: Mapped[date] = mapped_column(Date)
    service_type: Mapped[str] = mapped_column(String(200))
    recorded_by: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Session report fields (headcount + service details)
    title: Mapped[str | None] = mapped_column(String(200), nullable=True)
    total_attendance: Mapped[int | None] = mapped_column(nullable=True)
    total_males: Mapped[int | None] = mapped_column(nullable=True)
    total_females: Mapped[int | None] = mapped_column(nullable=True)
    speaker: Mapped[str | None] = mapped_column(String(200), nullable=True)
    topic: Mapped[str | None] = mapped_column(String(300), nullable=True)
    challenges: Mapped[str | None] = mapped_column(String(300), nullable=True)
    attitude_of_executives: Mapped[str | None] = mapped_column(String(50), nullable=True)
    remarks: Mapped[str | None] = mapped_column(Text, nullable=True)

    records: Mapped[list["AttendanceRecord"]] = relationship(
        back_populates="session", cascade="all, delete-orphan"
    )


class AttendanceRecord(Base):
    __tablename__ = "attendance_records"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    session_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("attendance_sessions.id")
    )
    member_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("members.id"))
    status: Mapped[AttendanceStatusEnum] = mapped_column(
        Enum(AttendanceStatusEnum, name="attendance_status_enum")
    )
    checked_in_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    session: Mapped[AttendanceSession] = relationship(back_populates="records")


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    member_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=False), ForeignKey("members.id"), nullable=True
    )
    type: Mapped[TransactionTypeEnum] = mapped_column(Enum(TransactionTypeEnum, name="transaction_type_enum"))
    amount: Mapped[Decimal] = mapped_column(Numeric(14, 2))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    recorded_by: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id"))
    transaction_date: Mapped[date] = mapped_column(Date)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id"))
    action: Mapped[str] = mapped_column(String(200))
    target_table: Mapped[str | None] = mapped_column(String(100), nullable=True)
    # Informational reference, not a real FK: UUIDs for records, but plain
    # strings where the target has no UUID (e.g. settings section names).
    target_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class SiteSetting(Base):
    __tablename__ = "site_settings"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    section: Mapped[str] = mapped_column(String(100), nullable=False)
    value: Mapped[str] = mapped_column(Text, nullable=False)
    updated_by: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(200))
    email: Mapped[str] = mapped_column(String(255))
    subject: Mapped[str] = mapped_column(String(300))
    message: Mapped[str] = mapped_column(Text)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


# Check constraint: attendance records only reference student members
Member.__table__.append_constraint(
    UniqueConstraint("email", name="uq_member_email")
)